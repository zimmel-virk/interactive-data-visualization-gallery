function SunburstChart() {
  this.name = 'Education: Sunburst Chart'; // Name for the visualization to appear in the menu bar.
  this.id = 'sunburst-chart-participation'; // Unique ID for the visualization.
  this.title = 'Sunburst Chart: Visualization of Apprenticeship Participation Across Levels and Age Groups'; // Title to display above the plot.

  var marginSize = 35; // Define the size of the margins around the plot.

  this.layout = {
    marginSize: marginSize, // Set the size of the margin.
    leftMargin: marginSize * 2, // Define the left margin with additional space for axes and labels.
    rightMargin: width - marginSize - 150, // Define the right margin with additional space for legend.
    topMargin: marginSize + 20, // Define the top margin with additional space for title.
    bottomMargin: height - marginSize * 2, // Define the bottom margin.
    pad: 5, // Padding around elements in the layout.
    plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate the plot width based on margins.
    plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate the plot height based on margins.
  };

  this.loaded = false; // Property to indicate whether data has been loaded.
  this.selectedLevel = 'All'; // Default to 'All' for the initial chart, showing all levels.

  // Define a pastel color palette for the different levels and age groups in the chart.
  this.colorPalette = {
    'root': color(255, 240, 245),          // Pastel Pink for the innermost circle.
    'Intermediate': color(255, 182, 193),  // Light Pink for Intermediate level.
    'Advanced': color(176, 224, 230),      // Powder Blue for Advanced level.
    'Higher': color(136, 6, 206),          // Plum for Higher level.
    'Under 19': color(240, 230, 140),      // Khaki for under 19 age group.
    '19-24': color(255, 218, 185),         // Peach Puff for 19-24 age group.
    '25 and Above': color(152, 251, 152)   // Pale Green for 25 and above age group.
  };

  // Preload the data from the CSV file.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/education.csv', // Path to the CSV file and its format.
        'csv', 'header', // Specify the file type and that it contains a header row.
        function(table) {
          self.loaded = true; // Set 'loaded' to true once the data is successfully loaded.
          self.processData(); // Process the data once loaded.
        }
    );
  };

  // Function to process the data and prepare it for the Sunburst chart.
  this.processData = function() {
    console.log('Processing data...');
    // Initialize the root of the chart's data structure.
    this.chartData = { 'name': 'root', 'children': [] };

    let years = this.data.getColumn('AcademicYear'); // Get the list of years from the data.
    let uniqueYears = [...new Set(years)]; // Get unique years to avoid duplicates.

    // Loop through each unique year to organize the data hierarchically.
    uniqueYears.forEach(year => {
      let yearData = this.data.findRows(year, 'AcademicYear'); // Find rows corresponding to the current year.
      let yearNode = { 'name': year, 'children': [] }; // Create a node for the current year.

      // Loop through each row of data for the current year.
      yearData.forEach(row => {
        let period = row.getString('Period'); // Get the period (e.g., Q1, Q2) from the row.
        let periodNode = yearNode.children.find(child => child.name === period); // Check if a node for this period already exists.

        if (!periodNode) {
          periodNode = { 'name': period, 'children': [] }; // Create a new node for the period if it doesn't exist.
          yearNode.children.push(periodNode); // Add the period node to the year node.
        }

        // Function to add data for a specific level and age group to the period node.
        let addLevelData = (level, under19, age19to24, age25andAbove) => {
          periodNode.children.push({
            'name': level,
            'children': [
              { 'name': 'Under 19', 'size': parseInt(under19) || 0 }, // Add data for under 19 age group.
              { 'name': '19-24', 'size': parseInt(age19to24) || 0 }, // Add data for 19-24 age group.
              { 'name': '25 and Above', 'size': parseInt(age25andAbove) || 0 } // Add data for 25 and above age group.
            ]
          });
        };

        // Add data for the 'Intermediate' level if selected or if 'All' levels are selected.
        if (this.selectedLevel === 'All' || this.selectedLevel === 'Intermediate') {
          addLevelData('Intermediate', row.getString('Participation_Intermediate_Under_19'), row.getString('Participation_Intermediate_19-24'), row.getString('Participation_Intermediate_25_and_Above'));
        }

        // Add data for the 'Advanced' level if selected or if 'All' levels are selected.
        if (this.selectedLevel === 'All' || this.selectedLevel === 'Advanced') {
          addLevelData('Advanced', row.getString('Participation_Advanced_Under_19'), row.getString('Participation_Advanced_19-24'), row.getString('Participation_Advanced_25_and_Above'));
        }

        // Add data for the 'Higher' level if selected or if 'All' levels are selected.
        if (this.selectedLevel === 'All' || this.selectedLevel === 'Higher') {
          console.log('Adding Higher level data:', {
            'Under 19': row.getString('Participation_Higher_Under_19'),
            '19-24': row.getString('Participation_Higher_19_24'),
            '25 and Above': row.getString('Participation_Higher_25_and_Above')
          });
          addLevelData('Higher', row.getString('Participation_Higher_Under_19'), row.getString('Participation_Higher_19_24'), row.getString('Participation_Higher_25_and_Above'));
        }
      });

      this.chartData.children.push(yearNode); // Add the year node to the root.
    });

    console.log('Data processed:', this.chartData); // Log the processed data for debugging.
  };

  // Setup function to initialize the visualization.
  this.setup = function() {
    textSize(14);  // Adjust text size for labels.
    angleMode(RADIANS); // Use radians for angles in the Sunburst chart.

    // Create a dropdown menu for selecting the apprenticeship level.
    this.levelSelector = createSelect();
    this.levelSelector.position(400, 140); // Position the dropdown on the canvas.
    this.levelSelector.option('All'); // Option for selecting all levels.
    this.levelSelector.option('Intermediate'); // Option for selecting Intermediate level.
    this.levelSelector.option('Advanced'); // Option for selecting Advanced level.
    this.levelSelector.option('Higher'); // Option for selecting Higher level.

    this.levelSelector.selected('All');  // Set dropdown to 'All' initially.
    this.selectedLevel = 'All';  // Ensure selectedLevel is 'All' by default.

    var self = this;
    this.levelSelector.changed(function() {
      self.selectedLevel = self.levelSelector.value(); // Update the selected level when the dropdown value changes.
      self.processData();  // Re-process data based on the new selection.
      self.draw();  // Re-draw the chart with the new selection.
    });

    // Process the data initially with 'All' as the default selection.
    this.processData();
  };

  // Main draw function to render the Sunburst chart.
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded'); // Log a message if the data has not been loaded yet.
      return;
    }

    background(255);  // Set a white background to better see the chart.
    this.drawTitle(); // Draw the title of the plot.
    this.drawSunburst(this.chartData, width / 2, height / 2 + 50, 100);  // Draw the Sunburst chart with a specified radius.
    this.drawLegend();  // Draw the legend to explain the colors used.
  };

  // Function to draw the Sunburst chart recursively.
  this.drawSunburst = function(data, x, y, radius) {
    var totalSize = 0; // Initialize total size to accumulate the sum of all nodes.

    // Function to calculate the total size of a node and its children.
    function calculateTotalSize(node) {
      if (node.children) {
        node.size = node.children.reduce((sum, child) => sum + calculateTotalSize(child), 0); // Sum the sizes of child nodes.
      }
      totalSize += node.size; // Add the node's size to the total size.
      return node.size;
    }

    totalSize = calculateTotalSize(data); // Calculate the total size for the root node.

    console.log('Total size calculated:', totalSize); // Log the total size for debugging.

    // Recursive function to draw each node of the Sunburst chart.
    function drawNode(node, startAngle, endAngle, innerRadius, outerRadius, depth) {
      var angleStep = endAngle - startAngle; // Calculate the angle span for the current node.

      // Determine the color based on the node depth and its name.
      let nodeColor = color(150);  // Default grey color for nodes.
      if (node.children) {
        nodeColor = this.colorPalette[node.name] || color(200, 200, 255);  // Use color from palette or default for non-leaf nodes.
      } else if (this.colorPalette[node.name]) {
        nodeColor = this.colorPalette[node.name];  // Use color from palette for leaf nodes based on their name.
      }

      // Debugging log to trace node drawing.
      console.log('Drawing node:', node.name, 'Start angle:', startAngle, 'End angle:', endAngle);

      // Draw the arc representing the current node.
      fill(nodeColor);
      noStroke();
      beginShape();
      for (let a = startAngle; a <= endAngle; a += 0.01) {
        let sx = x + cos(a) * outerRadius;
        let sy = y + sin(a) * outerRadius;
        vertex(sx, sy);
      }
      for (let a = endAngle; a >= startAngle; a -= 0.01) {
        let sx = x + cos(a) * innerRadius;
        let sy = y + sin(a) * innerRadius;
        vertex(sx, sy);
      }
      endShape(CLOSE);

      // Draw label for the node only if it's a year or period (depth 1 or 2).
      if (depth === 1 || depth === 2) {
        let midAngle = (startAngle + endAngle) / 2; // Calculate the midpoint angle for positioning the label.
        let labelX = x + cos(midAngle) * (outerRadius + innerRadius) / 2; // Calculate the x position for the label.
        let labelY = y + sin(midAngle) * (outerRadius + innerRadius) / 2; // Calculate the y position for the label.
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(10);  // Smaller text size for labels.
        text(node.name, labelX, labelY); // Draw the node name as a label.
      }

      // Draw children nodes recursively.
      if (node.children) {
        var currentAngle = startAngle; // Initialize the current angle for the first child.
        node.children.forEach(child => {
          var childAngleStep = angleStep * (child.size / node.size); // Calculate the angle span for the child node.
          if (childAngleStep < 0.01) childAngleStep = 0.01;  // Ensure a minimum angle for visibility.
          drawNode.call(this, child, currentAngle, currentAngle + childAngleStep, outerRadius, outerRadius + radius / 3, depth + 1); // Recursively draw the child node.
          currentAngle += childAngleStep; // Increment the current angle for the next child.
        });
      }
    }

    drawNode.call(this, data, 0, TWO_PI, 0, radius, 0); // Start drawing from the root node.
  };

  // Function to draw the title of the Sunburst chart.
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    textSize(20);  // Set the text size for the title.
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin + 50, this.layout.topMargin - (this.layout.marginSize / 2) - 20); // Position and draw the title.
  };

  // Function to draw the legend on the canvas.
  this.drawLegend = function() {
    let legendX = width - 140; // X position for the legend.
    let legendY = 200; // Y position for the legend.
    let legendSize = 20; // Size of the color boxes in the legend.

    // Draw the legend for levels and age groups.
    Object.keys(this.colorPalette).forEach((key, index) => {
      fill(this.colorPalette[key]);
      noStroke();
      rect(legendX, legendY + index * (legendSize + 5), legendSize, legendSize); // Draw the colored box for the legend item.
      fill(0);
      textAlign(LEFT, CENTER);
      text(key, legendX + legendSize + 10, legendY + index * (legendSize + 5) + legendSize / 2); // Draw the label next to the color box.
    });

    // Add a statement explaining the periods of the year (e.g., Q1, Q2).
    fill(0);
    textSize(10);
    textAlign(LEFT, TOP);
    text("Q1, Q2, Q3, Q4 represent periods of the year", legendX - 70, legendY + (Object.keys(this.colorPalette).length + 1) * (legendSize + 5) - 20);
  };

  // Destroy function to remove dropdown menus and clean up when the visualization is destroyed.
  this.destroy = function() {
    if (this.levelSelector) {
      this.levelSelector.remove(); // Remove the dropdown from the DOM.
      this.levelSelector = null;  // Set the reference to null to avoid memory leaks.
    }
  };
}
