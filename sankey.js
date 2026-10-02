function SankeyDiagram() {
  this.name = 'Education: Sankey Diagram'; // Name for the visualization to appear in the menu bar.
  this.id = 'sankey-diagram-participation'; // Unique ID for the visualization.
  this.title = 'Sankey Diagram: Apprenticeship Distribution Across Levels and Age Groups with Participation Values'; // Title to display above the plot.

  var marginSize = 35; // Define the size of the margins around the plot.

  this.layout = {
    marginSize: marginSize, // Set the size of the margin.
    leftMargin: marginSize * 2 + 300, // Define the left margin with additional space for axes and labels.
    rightMargin: width - marginSize - 150, // Define the right margin with additional space for legend.
    topMargin: marginSize + 20, // Define the top margin with additional space for title.
    bottomMargin: height - marginSize * 2, // Define the bottom margin.
    pad: 5, // Padding around elements in the layout.
    plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate the plot width based on margins.
    plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate the plot height based on margins.
  };

  this.loaded = false; // Property to indicate whether data has been loaded.

  // Preload the data from the CSV file.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/education.csv', // Path to the CSV file and its format.
        'csv', 'header', // Specify the file type and that it contains a header row.
        function(table) {
          self.loaded = true; // Set 'loaded' to true once the data is successfully loaded.
          self.processData(); // Process the data once loaded.
          console.log('Data loaded successfully:', self.data.getRowCount(), 'rows'); // Log successful data loading.
        }
    );
  };

  // Function to process the data and prepare nodes and links for the Sankey diagram.
  this.processData = function() {
    this.nodes = []; // Initialize an empty array to store nodes.
    this.links = []; // Initialize an empty array to store links.

    var levels = ['Intermediate', 'Advanced', 'Higher']; // Define the different levels of apprenticeships.
    var ageGroups = ['Under_19', '19-24', '25_and_Above']; // Define the different age groups.

    var filteredData = this.data.rows; // Start with all the rows in the data.
    if (this.selectedYear && this.selectedYear !== 'All Years') {
      // Filter data by the selected academic year if it's not "All Years".
      filteredData = filteredData.filter(row => row.obj.AcademicYear === this.selectedYear);
    }

    // Loop through each combination of level and age group.
    levels.forEach(level => {
      ageGroups.forEach(ageGroup => {
        // Skip age groups that don't match the selected age group (unless "All Age Groups" is selected).
        if (this.selectedAgeGroup !== 'All Age Groups' && this.selectedAgeGroup !== ageGroup) {
          return;
        }

        var columnName = `Participation_${level}_${ageGroup}`; // Construct the column name for participation data.
        var totalParticipation = filteredData.reduce((sum, row) => sum + parseFloat(row.obj[columnName] || 0), 0); // Sum up participation values for the current level and age group.

        if (totalParticipation > 0) {
          // Add a node for the current level and age group if participation is greater than 0.
          this.nodes.push({
            name: `${level}_${ageGroup}`, // Name the node based on level and age group.
            value: totalParticipation // Store the total participation value.
          });

          // Add a link between the level and the age group with the participation value.
          this.links.push({
            source: level, // Source of the link is the level.
            target: ageGroup, // Target of the link is the age group.
            value: totalParticipation // Value of the link is the total participation.
          });
        }
      });
    });

    console.log('Filtered Data:', this.nodes, this.links); // Log the processed nodes and links for debugging.
  };

  // Setup function to initialize the visualization.
  this.setup = function() {
    textSize(16); // Set the default text size for the visualization.

    // Create a dropdown menu for selecting age groups.
    this.ageGroupDropdown = createSelect();
    this.ageGroupDropdown.position(this.layout.leftMargin , this.layout.topMargin + 20); // Position the dropdown on the canvas.
    this.ageGroupDropdown.option('All Age Groups'); // Default option to show all age groups.
    this.ageGroupDropdown.option('Under_19'); // Option for under 19 age group.
    this.ageGroupDropdown.option('19-24'); // Option for 19-24 age group.
    this.ageGroupDropdown.option('25_and_Above'); // Option for 25 and above age group.
    this.ageGroupDropdown.changed(() => {
      this.selectedAgeGroup = this.ageGroupDropdown.value(); // Update the selected age group when the dropdown value changes.
      this.processData(); // Re-process the data based on the new selection.
      this.draw(); // Redraw the Sankey diagram with the new data.
    });

    // Create a dropdown menu for selecting academic years.
    this.yearDropdown = createSelect();
    this.yearDropdown.position(this.layout.leftMargin + 130, this.layout.topMargin +20); // Position the dropdown on the canvas.
    this.yearDropdown.option('All Years'); // Default option to show all years.
    var uniqueYears = [...new Set(this.data.getColumn('AcademicYear').filter(year => year))]; // Get unique years from the data.
    uniqueYears.forEach(year => {
      this.yearDropdown.option(year); // Add each unique year as an option.
    });
    this.yearDropdown.changed(() => {
      this.selectedYear = this.yearDropdown.value(); // Update the selected year when the dropdown value changes.
      this.processData(); // Re-process the data based on the new selection.
      this.draw(); // Redraw the Sankey diagram with the new data.
    });

    this.selectedAgeGroup = 'All Age Groups';  // Default selection for age group.
    this.selectedYear = 'All Years';  // Default selection for academic year.
    this.processData(); // Process data initially with default selections.
  };

  // Main draw function to render the Sankey diagram.
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded'); // Log a message if the data has not been loaded yet.
      return;
    }

    this.drawTitle(); // Draw the title of the plot.
    this.drawSankey(); // Draw the Sankey diagram with nodes and links.
  };

  // Function to draw the title of the Sankey diagram.
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    textSize(20); // Set the text size for the title.
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin - 90, this.layout.topMargin - (this.layout.marginSize / 2) - 20); // Position and draw the title.
  };

  // Function to draw the Sankey diagram.
  this.drawSankey = function() {
    var nodeWidth = 10; // Define the width of each node in the Sankey diagram.
    var nodePadding = 15; // Define the padding between nodes.
    var nodeSpacing = (this.layout.plotHeight() - (nodePadding * this.nodes.length)) / this.nodes.length; // Calculate spacing between nodes based on plot height.

    // Loop through each node to draw it on the canvas.
    this.nodes.forEach((node, i) => {
      var x = this.layout.leftMargin + (i % 3) * (this.layout.plotWidth() / 3); // Calculate the x position of the node.
      var y = this.layout.topMargin + i * (nodeSpacing + nodePadding) + 70; // Calculate the y position of the node.
      var nodeHeight = map(node.value, 0, max(this.nodes.map(d => d.value)), 0, nodeSpacing); // Map the node value to a height.

      fill(color(map(i, 0, this.nodes.length, 0, 255), 100, 150)); // Set the color of the node.
      rect(x, y, nodeWidth, nodeHeight); // Draw the node as a rectangle.
      fill(0);
      textAlign(CENTER);
      textSize(15); // Set the text size for the node label.
      text(`${node.name} 
      value: ${node.value}`, x + nodeWidth / 2, y + nodeHeight + 15);  // Add a label with the node name and value.
    });

    // Loop through each link to draw the connections between nodes.
    this.links.forEach(link => {
      var sourceNode = this.nodes.find(node => node.name.startsWith(link.source)); // Find the source node.
      var targetNode = this.nodes.find(node => node.name.endsWith(link.target)); // Find the target node.
      var sourceX = this.layout.leftMargin + (this.nodes.indexOf(sourceNode) % 3) * (this.layout.plotWidth() / 3) + nodeWidth; // Calculate the x position of the source node.
      var sourceY = this.layout.topMargin + this.nodes.indexOf(sourceNode) * (nodeSpacing + nodePadding) + nodeWidth / 2 + 70; // Calculate the y position of the source node.
      var targetX = this.layout.leftMargin + (this.nodes.indexOf(targetNode) % 3) * (this.layout.plotWidth() / 3); // Calculate the x position of the target node.
      var targetY = this.layout.topMargin + this.nodes.indexOf(targetNode) * (nodeSpacing + nodePadding) + nodeWidth / 2 + 70; // Calculate the y position of the target node.

      stroke(204, 204, 255); // Set the stroke color for the link.
      line(sourceX, sourceY, targetX, targetY); // Draw the line representing the link.
    });
  };

  // Destroy function to remove dropdown menus and clean up when the visualization is destroyed.
  this.destroy = function() {
    this.ageGroupDropdown.remove(); // Remove the age group dropdown menu from the canvas.
    this.yearDropdown.remove(); // Remove the year dropdown menu from the canvas.
    // Any additional cleanup code goes here.
  };
}
