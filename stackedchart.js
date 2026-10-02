function SuccessRatesStackedBar() {
  // Chart properties
  this.name = 'Success-Rates: Stacked Bar Chart'; // Chart title
  this.title = 'Stacked Bar Chart: Success Rates by Apprenticeship Level and Institution Type'; // Chart title
  this.id = 'success-rates-stacked-bar'; // Unique identifier
  this.loaded = false; // Data loaded flag
  this.pad = 70; // Padding for the axes
  this.rightMargin = 200; // Increased right margin for the legend


  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/successrates.csv', 'csv', 'header',
      function(table) {
        self.loaded = true; // Set loaded flag to true when data is loaded
        console.log('Data loaded successfully');
      }
    );
  };

  // Setup function to initialize dropdowns and draw initial chart
  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Create dropdown for apprenticeship levels
    this.levelSelect = createSelect();
    this.levelSelect.position(1000, 50);
    this.levelSelect.option('All Levels'); // Default option

    // Create dropdown for apprenticeship types
    this.typeSelect = createSelect();
    this.typeSelect.position(1090, 50);
    this.typeSelect.option('All Types'); // Default option

    // Create dropdown for institution types
    this.instTypeSelect = createSelect();
    this.instTypeSelect.position(1200, 50);
    this.instTypeSelect.option('All Institution Types'); // Default option

    // Populate dropdowns with unique values from the data
    var levels = this.data.getColumn('Apprenticeship_Level');
    var types = this.data.getColumn('Apprenticeship_Type');
    var instTypes = this.data.getColumn('Institution_Type');

    var uniqueLevels = [...new Set(levels)];
    var uniqueTypes = [...new Set(types)];
    var uniqueInstTypes = [...new Set(instTypes)];

    uniqueLevels.sort();
    uniqueTypes.sort();
    uniqueInstTypes.sort();

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
    this.levelSelect.changed(() => this.draw());
    this.typeSelect.changed(() => this.draw());
    this.instTypeSelect.changed(() => this.draw());

    // Initial draw of the chart
    this.draw();
  };

  // Cleanup function to remove dropdowns
  this.destroy = function() {
    this.levelSelect.remove();
    this.typeSelect.remove();
    this.instTypeSelect.remove();
  };

  // Draw function to render the stacked bar chart
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Clear the canvas
    clear();

    // Extract columns from the data
    var levels = this.data.getColumn('Apprenticeship_Level');
    var types = this.data.getColumn('Apprenticeship_Type');
    var instTypes = this.data.getColumn('Institution_Type');
    var successRates = this.data.getColumn('Overall_Success_Rate_%');

    // Convert success rate strings to numbers
    successRates = stringsToNumbers(successRates);

    // Get selected values from dropdowns
    var selectedLevel = this.levelSelect.value();
    var selectedType = this.typeSelect.value();
    var selectedInstType = this.instTypeSelect.value();

    // Filter data based on selections
    var filteredData = [];
    for (var i = 0; i < levels.length; i++) {
      if ((selectedLevel === 'All Levels' || levels[i] === selectedLevel) &&
          (selectedType === 'All Types' || types[i] === selectedType) &&
          (selectedInstType === 'All Institution Types' || instTypes[i] === selectedInstType)) {
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

    // Define colors and abbreviations for each institution type
    var instTypeColors = {
      'General FE and Tertiary College': color(255, 0, 0),
      'Other Public Funded': color(0, 255, 0),
      'Private Sector Public Funded': color(0, 0, 255),
      'Schools': color(255, 255, 0),
      'Sixth Form College': color(0, 255, 255),
      'Specialist College': color(255, 0, 255),
      'All Institution Type': color(100, 100, 100)
    };

    var instTypeAbbr = {
      'General FE and Tertiary College': 'GFETC',
      'Other Public Funded': 'OPF',
      'Private Sector Public Funded': 'PSPF',
      'Schools': 'SCH',
      'Sixth Form College': 'SFC',
      'Specialist College': 'SC',
      'All Institution Type': 'AIT'
    };

    // Create unique keys for each level/type/instType combination
    var keys = [];
    var filteredSuccessRates = [];
    var filteredInstTypes = [];
    for (var i = 0; i < filteredData.length; i++) {
      keys.push(filteredData[i].level + '-' + filteredData[i].type + '-' + filteredData[i].instType);
      filteredSuccessRates.push(filteredData[i].successRate);
      filteredInstTypes.push(filteredData[i].instType);
    }

    // Calculate the x scale
    var xStep = (width - this.pad - this.rightMargin) / keys.length;

    // Calculate the y scale
    var yMax = 100; // Assuming success rates are percentages
    var yScale = (height - 2 * this.pad) / yMax ;

    fill(255);
    stroke(0);
    strokeWeight(1);

    // Draw the bars with colors based on institution type
    for (var i = 0; i < keys.length; i++) {
      var x = this.pad + i * xStep;
      var y = height - this.pad - filteredSuccessRates[i] * yScale;
      var barHeight = filteredSuccessRates[i] * yScale;
      fill(instTypeColors[filteredInstTypes[i]]);
      rect(x, y, xStep * 0.8, barHeight);
    }

    // Add axes and labels
    this.addAxes(keys, xStep, yScale, selectedInstType, filteredInstTypes, instTypeAbbr);
    // Draw the legend
    this.drawLegend(instTypeColors, instTypeAbbr);
  };

  // Function to add axes and labels to the chart
this.addAxes = function(keys, xStep, yScale, selectedInstType, filteredInstTypes, instTypeAbbr) {
  var bottomPadding = 70;
  stroke(200);

  // Add x-axis
  line(this.pad, height - this.pad, width - this.pad - this.rightMargin, height - this.pad);

  // Add y-axis
  line(this.pad, height - this.pad, this.pad, this.pad);

  // Add x-axis labels
  textAlign(CENTER);
  fill(0); // Set text color to black
  textSize(10);

  var drawnLabels = new Set(); // Track drawn labels to avoid duplicates

  for (var i = 0; i < keys.length; i++) {
    var x = this.pad + i * xStep + xStep * 0.4;

    var label = instTypeAbbr[filteredInstTypes[i]];
    if (!drawnLabels.has(label)) {
      text(label, x + xStep * 0.4, height - this.pad + 15);
      drawnLabels.add(label);
    }
  }

  // Add y-axis labels
  textAlign(RIGHT);
  fill(0); // Set text color to black
  for (var i = 0; i <= 100; i += 10) {
    var y = height - this.pad - i * yScale;
    textSize(10);
    text(i, this.pad - 5, y);
  }

  // Add axis names
  textSize(15);
  textAlign(CENTER);
  text('Apprenticeship Levels, Types, and Institution Types', width / 2 - 70, height - this.pad + 55);
  textAlign(CENTER);
  push();
  translate(this.pad - 35, height / 2);
  rotate(-PI / 2);
  text('Success Rate (%)', 0, 0);
  pop();

  // Add chart title
  textAlign(CENTER);
  textSize(20);
  text(this.title, width / 2 - 60, this.pad - 40);
};

  // Function to draw the legend
  this.drawLegend = function(instTypeColors, instTypeAbbr) {
    var x = width - this.rightMargin + 20;
    var y = this.pad + 100;

    textSize(12);
    textAlign(LEFT);
    for (var instType in instTypeColors) {
      fill(instTypeColors[instType]);
          rect(x, y, 15, 15);
      fill(0);
      text(instTypeAbbr[instType] + ' (' + instType + ')', x + 20, y + 12);
      y += 20;
    }
  };
}

// Utility function to convert strings to numbers
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the sum of an array
function sum(array) {
  return array.reduce((acc, val) => acc + val, 0);
}

