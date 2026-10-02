function TimeSeriesPlot() {
  // Chart properties
  this.name = 'Forest-Fires: Time Series Plot'; // Name of the chart
  this.id = 'time-series-plot'; // Unique identifier
  this.title = 'Time Series Visualization: Monthly Trends in Fire Weather Indices'; // Title of the chart
  this.xAxisLabel = 'Month'; // X-axis label
  this.yAxisLabel = 'Index Value'; // Y-axis label
  this.loaded = false; // Data loaded flag
  // Layout settings including margins and plot dimensions
  this.layout = {
    leftMargin: 150,
    rightMargin: width - 100,
    topMargin: 100,
    bottomMargin: height - 100,
    marginSize: 50,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    }
  };

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    // Load CSV data from file
    this.data = loadTable('./data/forest_fires.csv', 'csv', 'header', function(table) {
      self.loaded = true; // Set loaded flag to true when data is loaded
    });
  };

  // Setup function for initial setup operations
  this.setup = function() {
    textSize(16); // Set text size for chart
  };

  // Draw function to render the time series plot
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawTitle(); // Draw chart title
    drawAxis(this.layout, this.data); // Draw axes and labels
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout); // Draw axis labels

    var indices = ['FFMC', 'DMC', 'DC', 'ISI']; // Indices to plot
    var colors = ['red', 'blue', 'green', 'orange']; // Corresponding colors for indices

    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      var maxValue = max(this.data.getColumn(index)); // Get maximum value for current index
      console.log(`Max value for ${index}: ${maxValue}`);
      var previous = null; // Variable to store previous point for drawing lines
      stroke(colors[i]); // Set stroke color for current index
      for (var j = 0; j < this.data.getRowCount(); j++) {
        var row = this.data.getRow(j); // Get current row
        var month = monthToNumber(row.getString('month')); // Convert month string to number
        var value = row.getNum(index); // Get index value
        var x = map(month, 1, 12, this.layout.leftMargin, this.layout.rightMargin); // Map month to x-coordinate
        var y = map(value, 0, maxValue, this.layout.bottomMargin, this.layout.topMargin); // Map index value to y-coordinate
        console.log('Mapped coordinates:', x, y); // Log mapped coordinates
        if (previous != null) {
          line(previous.x, previous.y, x, y); // Draw line segment from previous point to current point
        }
        previous = { x: x, y: y }; // Update previous point
      }
    }
  };

  // Function to draw the chart title
  this.drawTitle = function() {
    fill(0); // Fill color for text (black)
    noStroke(); // No stroke for text
    textSize(20);
    textAlign(CENTER, CENTER); // Text alignment
    // Display title centered above the plot area
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 50);
  };

  // Function to draw axes and month labels
  function drawAxis(layout, data) {
    stroke(0); // Stroke color (black)
    textSize(16);
    line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin); // Draw y-axis
    line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin); // Draw x-axis

    // Array of month labels
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var spacing = layout.plotWidth() / 11; // Calculate spacing between month labels

    textAlign(CENTER); // Text alignment
    // Display month labels evenly spaced along the x-axis
    for (var i = 0; i < months.length; i++) {
      var x = layout.leftMargin + (i * spacing);
      text(months[i], x, layout.bottomMargin + 20); // Adjust 20 to move labels if needed
    }

    // Determine maximum value across all indices for y-axis scaling
    var maxValue = max([
      max(data.getColumn('FFMC')),
      max(data.getColumn('DMC')),
      max(data.getColumn('DC')),
      max(data.getColumn('ISI'))
    ]);

    var numTicks = 10; // Number of tick marks on the y-axis
    textAlign(RIGHT); // Text alignment
    // Display index value labels evenly spaced along the y-axis
    for (var i = 0; i <= numTicks; i++) {
      var value = maxValue / numTicks * i;
      var y = map(value, 0, maxValue, layout.bottomMargin, layout.topMargin);
      text(nf(value, 1, 1), layout.leftMargin - 10, y); // Adjust -10 to move labels if needed
    }
  }

  // Function to draw axis labels
  function drawAxisLabels(xAxisLabel, yAxisLabel, layout) {
    fill(0); // Fill color for text (black)
    noStroke(); // No stroke for text
    textSize(20);
    textAlign(CENTER, CENTER); // Text alignment
    // Display x-axis label centered below the plot area
    text(xAxisLabel, (layout.plotWidth() / 2) + layout.leftMargin, layout.bottomMargin + (layout.marginSize));
    // Display y-axis label rotated and centered to the left of the plot area
    push();
    translate(layout.leftMargin - (layout.marginSize), layout.topMargin + (layout.plotHeight() / 2));
    rotate(-PI / 2); // Rotate text
    text(yAxisLabel, 0, -20); // Adjust -20 to move labels if needed
    pop(); // Restore original drawing state
  }

  // Function to convert month string to number
  function monthToNumber(month) {
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months.indexOf(month.toLowerCase()) + 1; // Return index of month string in array (1-based)
  }
}
