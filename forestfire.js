function ForestFiresLineChart() {
  // Properties
  this.name = 'Forest-Fires: Line Chart';//chart name
  this.id = 'forest-fires-line-chart';
  this.title = 'Burned Area by Month: Forest Fire Data Analysis';//chart title
  this.xAxisLabel = 'Month';
  this.yAxisLabel = 'Burned Area (ha)';

  // Layout settings
  var marginSize = 50;
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
  };

  // Data state
  this.loaded = false;
  this.burnedAreaByMonth = {}; // Object to store burned area by month

  var self = this; // Capture context for callback functions

  // Preload function to load data before setup
  this.preload = function() {
    // Load CSV data
    this.data = loadTable(
      './data/forest_fires.csv', 'csv', 'header',
      function(table) {
        self.loaded = true; // Set loaded flag to true when data is loaded
        console.log('Data loaded successfully');
        self.calculateBurnedAreaByMonth(); // Calculate burned area by month after data load
      }
    );
  };

  // Setup function to initialize visualization
  this.setup = function() {
    textSize(16); // Set default text size
  };

  // Destroy function to clean up after visualization
  this.destroy = function() {
    // No cleanup needed for this simple example
  };

  // Function to calculate burned area by month from loaded data
  this.calculateBurnedAreaByMonth = function() {
    console.log('Calculating burned area by month...');
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var month = this.data.getString(i, 'month');
      var area = this.data.getNum(i, 'area');

      if (!month || isNaN(area)) continue; // Skip if month is undefined or area is NaN

      // Accumulate burned area for each month
      this.burnedAreaByMonth[month] = this.burnedAreaByMonth[month] || 0;
      this.burnedAreaByMonth[month] += area;
    }
    console.log('Burned area by month:', this.burnedAreaByMonth);
  };

  // Function to draw the line chart
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw title, axis, labels, and data points
    this.drawTitle();
    this.drawAxis();
    this.drawAxisLabels(this.xAxisLabel, this.yAxisLabel);

    var months = Object.keys(this.burnedAreaByMonth).sort(); // Get sorted list of months
    console.log('Months:', months);

    // Draw data points and connecting lines
    for (var i = 0; i < months.length; i++) {
      var month = months[i];
      var x = map(i, 0, months.length - 1, this.layout.leftMargin, this.layout.rightMargin); // Map x-coordinate based on index
      var y = this.mapBurnedAreaToY(this.burnedAreaByMonth[month]); // Map y-coordinate based on burned area

      // Draw data point
      fill(255, 0, 0); // Red color for data points
      ellipse(x, y, 8, 8); // Draw a circle at each data point

      // Draw line connecting data points (skip for the first point)
      if (i > 0) {
        var previousX = map(i - 1, 0, months.length - 1, this.layout.leftMargin, this.layout.rightMargin);
        var previousY = this.mapBurnedAreaToY(this.burnedAreaByMonth[months[i - 1]]);
        stroke(255, 0, 0); // Red color for lines
        line(previousX, previousY, x, y); // Draw a line from previous point to current point
      }

      // Draw month labels on x-axis
      fill(0); // Black color for labels
      noStroke();
      textAlign(CENTER, CENTER);
      text(month, x, this.layout.bottomMargin + this.layout.marginSize / 2); // Display month label below x-axis
    }

    // Draw tick marks and labels on y-axis
    var maxArea = max(Object.values(this.burnedAreaByMonth)); // Find maximum burned area
    var numTicks = 5; // Number of ticks on y-axis
    for (var j = 0; j <= numTicks; j++) {
      var value = maxArea * j / numTicks; // Calculate tick value
      var y = map(value, 0, maxArea, this.layout.bottomMargin, this.layout.topMargin); // Map y-coordinate

      stroke(0); // Black color for ticks
      line(this.layout.leftMargin - 5, y, this.layout.leftMargin, y); // Draw tick mark
      noStroke();
      fill(0); // Black color for tick labels
      textAlign(RIGHT, CENTER);
      text(value.toFixed(2), this.layout.leftMargin - 10, y); // Display tick label to the left of y-axis
    }
  };

  // Function to draw the title at the top of the chart
  this.drawTitle = function() {
    fill(0); // Black color for text
    noStroke();
    textAlign(CENTER, CENTER);
    text(this.title, width / 2, this.layout.topMargin / 2); // Display title at the top margin
  };

  // Function to draw x-axis and y-axis lines
  this.drawAxis = function() {
    stroke(0); // Black color for axis lines
    line(this.layout.leftMargin, this.layout.topMargin, this.layout.leftMargin, this.layout.bottomMargin); // Draw y-axis
    line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.rightMargin, this.layout.bottomMargin); // Draw x-axis
  };

  // Function to draw x-axis and y-axis labels
  this.drawAxisLabels = function(xAxisLabel, yAxisLabel) {
    fill(0); // Black color for text
    noStroke();
    textAlign(CENTER, CENTER);

    // Draw x-axis label
    text(xAxisLabel, (this.layout.rightMargin - this.layout.leftMargin) / 2 + this.layout.leftMargin, this.layout.bottomMargin + this.layout.marginSize * 1.5);

    // Draw y-axis label (rotated)
    push();
    translate(this.layout.leftMargin - this.layout.marginSize * 1.5, (this.layout.bottomMargin - this.layout.topMargin) / 2 + this.layout.topMargin);
    rotate(-PI / 2);
    text(yAxisLabel, 0, 0); // Display y-axis label rotated
    pop();
  };

  // Function to map burned area to y-coordinate within the chart area
  this.mapBurnedAreaToY = function(area) {
    var maxArea = max(Object.values(this.burnedAreaByMonth)); // Find maximum burned area
    if (maxArea == 0) {
      console.log('Max area is 0, cannot map Y coordinate');
      return this.layout.bottomMargin; // Return bottom margin if max area is 0
    }
    return map(area, 0, maxArea, this.layout.bottomMargin, this.layout.topMargin); // Map area to y-coordinate
  };
}
