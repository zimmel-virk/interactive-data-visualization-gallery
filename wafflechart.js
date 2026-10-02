function SuccessRatesWaffleChart() {
  this.name = 'Success-Rates: Waffle Chart'; // Chart title
  this.title= 'Waffle Chart Representation of Apprenticeship Success Rates by Level, Type, and Institution'
  this.id = 'success-rates-waffle-chart'; // Unique identifier for the chart
  this.loaded = false; // Flag to indicate if data is loaded

  // Preload function to load CSV data
  this.preload = function() {
    var self = this; // Reference to the current instance of the chart
    this.data = loadTable(
      './data/successrates.csv', 'csv', 'header', // Load CSV data from the specified path
      function(table) {
        self.loaded = true; // Set loaded flag to true when data is loaded
        console.log('Data loaded successfully'); // Log a message to the console
      }
    );
  };

  // Setup function to initialize and draw the initial chart
  this.setup = function() {
    if (!this.loaded) { // Check if data is not loaded
      console.log('Data not yet loaded'); // Log a message to the console
      return; // Exit the function if data is not loaded
    }

    // Create dropdowns for filtering (if needed)
    this.levelSelect = createSelect(); // Create a select dropdown for levels
    this.levelSelect.position(400, 80); // Position the dropdown
    this.levelSelect.option('All Levels'); // Add default option to the dropdown

    this.typeSelect = createSelect(); // Create a select dropdown for types
    this.typeSelect.position(600, 80); // Position the dropdown
    this.typeSelect.option('All Types'); // Add default option to the dropdown

    this.instTypeSelect = createSelect(); // Create a select dropdown for institution types
    this.instTypeSelect.position(800, 80); // Position the dropdown
    this.instTypeSelect.option('All Institution Types'); // Add default option to the dropdown

    // Populate dropdowns with unique values from the data
    var levels = this.data.getColumn('Apprenticeship_Level'); // Get levels column from the data
    var types = this.data.getColumn('Apprenticeship_Type'); // Get types column from the data
    var instTypes = this.data.getColumn('Institution_Type'); // Get institution types column from the data

    // Get unique values from the columns
    var uniqueLevels = [...new Set(levels)]; // Unique levels
    var uniqueTypes = [...new Set(types)]; // Unique types
    var uniqueInstTypes = [...new Set(instTypes)]; // Unique institution types

    // Sort the unique values
    uniqueLevels.sort(); 
    uniqueTypes.sort(); 
    uniqueInstTypes.sort();

    // Add sorted unique values to the dropdowns
    for (let level of uniqueLevels) {
      this.levelSelect.option(level);
    }

    for (let type of uniqueTypes) {
      this.typeSelect.option(type);
    }

    for (let instType of uniqueInstTypes) {
      this.instTypeSelect.option(instType);
    }

    // Set event listeners for dropdowns
    this.levelSelect.changed(() => this.draw()); // Redraw chart when level is changed
    this.typeSelect.changed(() => this.draw()); // Redraw chart when type is changed
    this.instTypeSelect.changed(() => this.draw()); // Redraw chart when institution type is changed

    // Initial draw of the chart
    this.draw();
  };
    // Destroy function
  this.destroy = function() {
    // Remove the dropdowns if they exist
    if (this.levelSelect) {
      this.levelSelect.remove();
    }
    if (this.typeSelect) {
      this.typeSelect.remove();
    }
    if (this.instTypeSelect) {
      this.instTypeSelect.remove();
    }
  };

  // Draw function to render the waffle chart
  this.draw = function() {
    if (!this.loaded) { // Check if data is not loaded
      console.log('Data not yet loaded'); // Log a message to the console
      return; // Exit the function if data is not loaded
    }

    // Clear previous chart
    clear();

    // Extract columns from the data
    var levels = this.data.getColumn('Apprenticeship_Level'); // Levels column
    var types = this.data.getColumn('Apprenticeship_Type'); // Types column
    var instTypes = this.data.getColumn('Institution_Type'); // Institution types column
    var successRates = this.data.getColumn('Overall_Success_Rate_%'); // Success rates column

    // Convert success rate strings to numbers
    successRates = stringsToNumbers(successRates); // Convert strings to numbers

    // Get selected values from dropdowns
    var selectedLevel = this.levelSelect.value(); // Selected level
    var selectedType = this.typeSelect.value(); // Selected type
    var selectedInstType = this.instTypeSelect.value(); // Selected institution type

    // Filter data based on selections
    var filteredData = []; // Array to store filtered data
    for (var i = 0; i < levels.length; i++) {
      if ((selectedLevel === 'All Levels' || levels[i] === selectedLevel) && // Filter by level
          (selectedType === 'All Types' || types[i] === selectedType) && // Filter by type
          (selectedInstType === 'All Institution Types' || instTypes[i] === selectedInstType)) { // Filter by institution type
        filteredData.push({
          level: levels[i],
          type: types[i],
          instType: instTypes[i],
          successRate: successRates[i]
        });
      }
    }

    // Log the filtered data for debugging
    console.log('Filtered Data:', filteredData);

    // Calculate the total number of squares
    var totalSquares = 100; // 10x10 grid

    // Calculate the average success rate for the filtered data
    var filteredSuccessRates = filteredData.map(d => d.successRate); // Extract success rates from filtered data
    var averageSuccessRate = sum(filteredSuccessRates) / filteredSuccessRates.length; // Calculate average success rate
    var successSquares = Math.round(averageSuccessRate); // Calculate number of success squares

      // Log the calculated average success rate and number of success squares
  console.log('Average Success Rate:', averageSuccessRate);
  console.log('Number of Success Squares:', successSquares);
      
    // Draw the waffle chart
    var cols = 18; // Number of columns in the grid
    var rows = 5; // Number of rows in the grid
    var squareSize = Math.min((width - 100) / cols, (height - 200) / rows); // Calculate square size

    var leftPadding = (width - (cols * squareSize)) / 2; // Calculate left padding

    // Loop to draw squares in the grid
    for (var i = 0; i < totalSquares; i++) {
      var x = (i % cols) * squareSize + leftPadding; // Calculate x position of the square
      var y = Math.floor(i / cols) * squareSize + 130 ; // Calculate y position of the square
      if (i < successSquares) {
        fill(0, 128, 0); // Color for success
      } else {
        fill(255, 0, 0); // Color for failure
      }
      rect(x, y, squareSize, squareSize); // Draw the square
    }

    // Add chart title
    textAlign(CENTER); // Center align the text
    stroke(0);

    textSize(24); // Set text size
    text(this.title, width / 2, 50); // Draw the chart title

    // Add legend
    textSize(15); // Set text size
    noStroke();
    textAlign(LEFT); // Left align the text
    fill(0, 128, 0); // Color for success
    rect(200, height - 95, 30, 30); // Draw success color square in the legend
    fill(0); // Set text color to black
    text('Success', 190, height - 110); // Draw success label

    fill(255, 0, 0); // Color for failure
    rect(300, height - 95, 30, 30); // Draw failure color square in the legend
    fill(0); // Set text color to black
    text('Failure', 290, height - 110); // Draw failure label
  };

  // Utility function to convert strings to numbers
  function stringsToNumbers(array) {
    return array.map(Number); // Convert each element in the array to a number
  }

  // Utility function to calculate the sum of an array
  function sum(array) {
    return array.reduce((acc, val) => acc + val, 0); // Sum all elements in the array
  }
}

// Create an instance of the chart and call preload and setup
var chart = new SuccessRatesWaffleChart(); // Instantiate the chart
chart.preload(); // Preload data
chart.setup(); // Setup the chart
