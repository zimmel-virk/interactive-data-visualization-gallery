function Treemap() {
  this.name = 'Energy: Treemap'; // Name for the visualization to appear in the menu bar.
  this.id = 'treemap-consumption'; // Unique ID for the visualization.
  this.title = 'Treemap Visualization of Energy Consumption Across Categories'; // Title to display above the plot.

  var marginSize = 35; // Define the size of the margins around the plot.
  var width = 800; // Define the width of the canvas.
  var height = 600; // Define the height of the canvas.

  this.layout = {
    marginSize: marginSize, // Set the size of the margin.
    leftMargin: marginSize * 2 + 100, // Define the left margin with additional space for labels.
    rightMargin: width - marginSize - 150, // Define the right margin with space for the legend.
    topMargin: marginSize + 20, // Define the top margin with space for the title.
    bottomMargin: height - marginSize * 2, // Define the bottom margin.
    pad: 5, // Padding around elements in the layout.
    plotWidth: function() {
      return this.rightMargin - this.leftMargin; // Calculate the plot width based on margins.
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin; // Calculate the plot height based on margins.
    }
  };

  this.loaded = false; // Property to indicate whether data has been loaded.
  this.selectedVariable = ''; // Initialize selected variable as an empty string.
  this.selectedSection = ''; // Initialize selected section as an empty string.
  this.treeData = {}; // Object to store the processed data for the treemap.
  this.variableSelect = null; // Reference to the variable dropdown menu.
  this.sectionSelect = null; // Reference to the section dropdown menu.
  this.boxColors = {}; // Store the colors for each box in the treemap.

  // Preload the data from the CSV file.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/energy.csv', // Path to the CSV file.
        'csv', 'header', // Specify the file type and that it contains a header row.
        function(table) {
          self.loaded = true; // Set 'loaded' to true once the data is successfully loaded.
          console.log('Data loaded:', table.getRowCount(), 'rows'); // Log successful data loading.
        }
    );
  };

  // Setup function to initialize the visualization.
  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded'); // Log a message if the data has not been loaded yet.
      return;
    }

    this.clearCanvas(); // Clear the canvas on setup.
    this.createDropdowns(); // Create dropdown menus for user interaction.
    console.log('Setup complete'); // Log that setup is complete.
  };

  // Function to create dropdown menus for selecting variables and sections.
  this.createDropdowns = function() {
    var self = this;

    // Destroy existing dropdowns if they exist.
    this.destroyDropdowns();

    // Reset selections and clear the canvas.
    this.selectedVariable = '';
    this.selectedSection = '';
    this.treeData = {};
    this.boxColors = {};
    this.clearCanvas();

    // Create a dropdown for selecting the variable.
    this.variableSelect = createSelect();
    this.variableSelect.position(this.layout.leftMargin + 170, this.layout.topMargin + 10); // Position the dropdown on the canvas.
    this.variableSelect.option('Select Variable'); // Default option.

    var uniqueVariables = [...new Set(this.data.getColumn('Variable 1'))]; // Get unique variables from the data.
    uniqueVariables.forEach(value => {
      this.variableSelect.option(value); // Add each variable as an option.
    });

    this.variableSelect.changed(function() {
      self.selectedVariable = self.variableSelect.value(); // Update selected variable when dropdown changes.
      if (self.selectedVariable === 'Select Variable') {
        self.selectedVariable = ''; // Reset if the default option is selected.
      }
      self.checkUserSelection(); // Check if both variable and section are selected.
    });

    // Create a dropdown for selecting the data section.
    this.sectionSelect = createSelect();
    this.sectionSelect.position(this.layout.leftMargin + 170, this.layout.topMargin + 40); // Position the dropdown on the canvas.
    this.sectionSelect.option('Select Data Section'); // Default option.

    for (var i = 1; i <= 4; i++) {
      this.sectionSelect.option('Section ' + i); // Add section options (Section 1, Section 2, etc.).
    }

    this.sectionSelect.changed(function() {
      self.selectedSection = self.sectionSelect.value(); // Update selected section when dropdown changes.
      if (self.selectedSection === 'Select Data Section') {
        self.selectedSection = ''; // Reset if the default option is selected.
      }
      self.checkUserSelection(); // Check if both variable and section are selected.
    });
  };

  // Function to check if both a variable and a section have been selected.
  this.checkUserSelection = function() {
    this.clearCanvas(); // Clear the canvas each time a new selection is made.
    if (this.selectedVariable && this.selectedSection) {
      this.processData(); // Process the data based on the current selections.
      this.draw(); // Draw the treemap with the processed data.
    }
  };

  // Function to destroy the dropdown menus (clean up).
  this.destroyDropdowns = function() {
    if (this.variableSelect) this.variableSelect.remove(); // Remove the variable dropdown.
    if (this.sectionSelect) this.sectionSelect.remove(); // Remove the section dropdown.
  };

  // Function to process the data and prepare it for the treemap.
  this.processData = function() {
    if (!this.data) {
      console.error('No data to process'); // Log an error if there is no data.
      return;
    }

    this.treeData = {}; // Reset the processed data.
    this.boxColors = {}; // Clear previous colors.

    var variableCol = 'Variable 1'; // Column name for the variable.
    var valueCols = this.data.columns.slice(2); // Get the columns that contain the values.

    var sectionSize = Math.ceil(valueCols.length / 4); // Divide the data into four sections.
    var startIdx, endIdx;

    // Determine the start and end indices for the selected section.
    switch (this.selectedSection) {
      case 'Section 1':
        startIdx = 0;
        break;
      case 'Section 2':
        startIdx = sectionSize;
        break;
      case 'Section 3':
        startIdx = 2 * sectionSize;
        break;
      case 'Section 4':
        startIdx = 3 * sectionSize;
        break;
    }
    endIdx = Math.min(startIdx + sectionSize, valueCols.length); // Ensure the end index does not exceed the number of columns.

    var selectedCols = valueCols.slice(startIdx, endIdx); // Get the columns for the selected section.

    var selectedRows = this.data.findRows(this.selectedVariable, variableCol); // Find rows that match the selected variable.
    if (!selectedRows.length) {
      console.error('No matching rows found'); // Log an error if no matching rows are found.
      return;
    }

    // Loop through each selected row and column to accumulate the values.
    selectedRows.forEach(row => {
      selectedCols.forEach(col => {
        var value = row.getString(col).replace(/,/g, '').replace(/n\/a/gi, '0').trim(); // Clean up the value string.
        value = parseFloat(value); // Convert the value to a float.
        if (isNaN(value)) {
          value = 0; // Default to 0 if the value is not a number.
        }
        if (!this.treeData[col]) {
          this.treeData[col] = 0; // Initialize the data structure for the column.
          this.boxColors[col] = color(random(255), random(255), random(255), 150); // Assign a random color to the column.
        }
        this.treeData[col] += value; // Accumulate the values.
      });
    });
  };

  // Function to clear the canvas.
  this.clearCanvas = function() {
    clear(); // Completely clear the canvas.
    background(255); // Set the background to white.
  };

  // Main draw function to render the treemap.
  this.draw = function() {
    this.clearCanvas(); // Clear the canvas before drawing.

    this.drawTitle(); // Draw the title of the treemap.

    // Ensure both dropdowns have valid selections before proceeding.
    if (!this.selectedVariable || !this.selectedSection ||
        this.selectedVariable === 'Select Variable' ||
        this.selectedSection === 'Select Data Section') {

      console.log('Please select appropriate variable and section'); // Log a message if selections are invalid.
      textSize(20);
      textAlign(CENTER, CENTER);
      text('Select the options from the dropdown menu to generate the graph.', width / 2 + 120, height / 2 ); // Display a message prompting the user to make selections.
      return;
    }

    if (Object.keys(this.treeData).length > 0) {
      var x = this.layout.leftMargin + 50; // Starting x position for the treemap.
      var y = this.layout.topMargin + 70; // Starting y position for the treemap.
      var w = this.layout.plotWidth() + 100; // Width of the treemap area.
      var h = this.layout.plotHeight(); // Height of the treemap area.

      var keys = Object.keys(this.treeData); // Get the keys (categories) from the processed data.

      // Sort the keys based on the value size.
      keys.sort((a, b) => this.treeData[b] - this.treeData[a]);

      // Calculate total sum of values for percentage calculation.
      var totalSum = keys.reduce((sum, key) => sum + this.treeData[key], 0);

      // Create an array of boxes with their corresponding values and colors.
      var boxes = keys.map((key, index) => ({
        key: key,
        value: this.treeData[key],
        color: this.boxColors[key] // Use the precomputed color.
      }));

      // Partition the space and get the layout for the boxes.
      var layout = this.partition(x, y, w, h, boxes, 'horizontal');

      layout.forEach(box => {
        // Calculate the area of the box.
        var boxArea = box.w * box.h;

        // Calculate the total area of the treemap.
        var totalArea = w * h;

        // Calculate the percentage based on area.
        var percentage = (boxArea / totalArea * 100).toFixed(2);

        // Skip drawing if the percentage is 0%.
        if (percentage === '0.00') {
          return;
        }

        // Draw the box.
        fill(box.color);
        rect(box.x, box.y, box.w, box.h);

        // Display the percentage inside the box.
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text(percentage + '%', box.x + box.w / 2, box.y + box.h / 2);
      });

      this.drawLegend(keys, layout.map(box => box.color)); // Draw the legend for the treemap.
    } else {
      console.log('No data to draw'); // Log a message if there is no data to draw.
    }
  };

  // Function to partition the space into boxes based on the data values.
  this.partition = function(x, y, w, h, data, direction) {
    if (data.length === 0) return []; // Return an empty array if there is no data.
    if (data.length === 1) {
      return [{x: x, y: y, w: w, h: h, color: data[0].color}]; // Return a single box if there is only one data point.
    }

    var total = data.reduce((acc, d) => acc + d.value, 0); // Calculate the total value of the data.
    var mid = 0;
    var sum = 0;

    // Find the midpoint where the data can be split into two groups with approximately equal sums.
    while (sum + data[mid].value < total / 2) {
      sum += data[mid].value;
      mid++;
    }

    var left = data.slice(0, mid + 1); // Data for the left group.
    var right = data.slice(mid + 1); // Data for the right group.

    if (direction === 'horizontal') {
      var leftW = w * sum / total; // Width for the left group.
      var rightW = w - leftW; // Width for the right group.
      return [
        ...this.partition(x, y, leftW, h, left, 'vertical'), // Recursively partition the left group vertically.
        ...this.partition(x + leftW, y, rightW, h, right, 'vertical') // Recursively partition the right group vertically.
      ];
    } else {
      var leftH = h * sum / total; // Height for the left group.
      var rightH = h - leftH; // Height for the right group.
      return [
        ...this.partition(x, y, w, leftH, left, 'horizontal'), // Recursively partition the left group horizontally.
        ...this.partition(x, y + leftH, w, rightH, right, 'horizontal') // Recursively partition the right group horizontally.
      ];
    }
  };

  // Function to draw the title of the treemap.
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25); // Set the text size for the title.
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin + 120, this.layout.topMargin - (this.layout.marginSize / 2)- 20); // Position and draw the title.
  };

  // Function to draw the legend for the treemap.
  this.drawLegend = function(keys, colors) {
    var legendX = this.layout.rightMargin + 200; // X position for the legend.
    var legendY = this.layout.topMargin + 100; // Y position for the legend.
    var legendWidth = 10; // Width of the color boxes in the legend.
    var legendHeight = 10; // Height of the color boxes in the legend.

    textSize(12); // Set the text size for the legend.
    keys.forEach((key, index) => {
      fill(colors[index % colors.length]); // Set the color for the legend box.
      rect(legendX, legendY + index * 20, legendWidth, legendHeight); // Draw the legend box.
      fill(0);
      textAlign(LEFT, TOP);
      text(key + ': ' + this.treeData[key].toFixed(2), legendX + legendWidth + 5, legendY + index * 20); // Display the key with its corresponding value.
    });
  };

  // Destroy function to clean up when the treemap is destroyed.
  this.destroy = function() {
    this.destroyDropdowns(); // Remove the dropdown menus.
    this.clearCanvas(); // Clear the canvas when destroying the treemap.
    console.log('Treemap instance destroyed'); // Log that the treemap instance has been destroyed.
  };
}
