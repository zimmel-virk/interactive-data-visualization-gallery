function CorrelationMatrixHeatmap() {
  this.name = 'Forest-Fires: Correlation Matrix Heatmap'; // Name of the chart
  this.id = 'correlation-matrix-heatmap'; // Unique identifier
  this.title = 'Correlation Matrix Heatmap: Forest Fire Environmental Factors';
  this.xAxisLabel = 'Variables'; // X-axis label
  this.yAxisLabel = 'Variables'; // Y-axis label
  this.loaded = false; // Data loaded flag


  this.preload = function() {
    var self = this;
    this.data = loadTable('./data/forest_fires.csv', 'csv', 'header', function(table) {
      self.loaded = true; // Set loaded flag to true when data is loaded
    });
  };

  this.setup = function() {
    textSize(20); // Set text size for chart
    textAlign(CENTER, CENTER); // Text alignment
    this.variables = ['FFMC', 'DMC', 'DC', 'ISI', 'temp', 'RH', 'wind', 'rain ', 'area'];
    this.corrMatrix = this.calculateCorrelationMatrix(this.variables);
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(255); // Clear background
    var marginSize = 100; // Margin size for chart
    var cellSize = min((width - 2 * marginSize) / this.variables.length, (height - 2 * marginSize) / this.variables.length) + 10; // Calculate cell size
    var topMargin = (height - this.variables.length * cellSize) / 2 + 30; // Top margin for centering the chart
    var leftMargin = (width - this.variables.length * cellSize) / 2; // Left margin for centering the chart

    // Draw chart title
    textSize(20); // Set text size for title
    fill(0); // Fill color for text (black)
    textAlign(CENTER, CENTER); // Text alignment
    text(this.title, width / 2, topMargin - 50); // Display title at the top center of the chart

    // Draw variable labels on x-axis and y-axis
    fill(0); // Fill color for text (black)
    textAlign(CENTER, CENTER); // Text alignment
    for (var i = 0; i < this.variables.length; i++) {
      // Draw x-axis labels
      text(this.variables[i], leftMargin + i * cellSize + cellSize / 2, topMargin - 10);
      // Draw y-axis labels
      text(this.variables[i], leftMargin - 50, topMargin + i * cellSize + cellSize / 2);
    }

    // Iterate through each cell in the correlation matrix
    for (var i = 0; i < this.variables.length; i++) {
      for (var j = 0; j < this.variables.length; j++) {
        var value = this.corrMatrix[i][j]; // Get correlation value from the matrix
        var x = leftMargin + j * cellSize; // Calculate x-coordinate of the cell
        var y = topMargin + i * cellSize; // Calculate y-coordinate of the cell

        // Set fill color based on correlation value (map to a color gradient)
        var colorValue = map(value, -1, 1, 0, 255);
        fill(colorValue, 100, 255 - colorValue);
        rect(x, y, cellSize, cellSize); // Draw rectangle representing the correlation cell

        // Display correlation value inside the cell
        fill(255); // Fill color for text (white)
        textAlign(CENTER, CENTER); // Text alignment
        text(value.toFixed(2), x + cellSize / 2, y + cellSize / 2); // Display correlation value centered inside the cell
      }
    }

    // Draw the legend for the color gradient
    this.drawLegend(leftMargin + this.variables.length * cellSize + 20, topMargin, 20, cellSize * this.variables.length);
  };

  this.drawLegend = function(x, y, width, height) {
    noStroke();
    for (let i = 0; i <= 100; i++) {
      let inter = map(i, 0, 100, -1, 1);
      let colorValue = map(inter, -1, 1, 0, 255);
      fill(colorValue, 100, 255 - colorValue);
      rect(x, y + map(i, 0, 100, height, 0), width, height / 100);
    }

    // Add min, mid, and max labels to the legend
    fill(0);
    textAlign(LEFT, CENTER);
    text('-1', x + width + 10, y + height);
    text('0', x + width + 10, y + height / 2);
    text('1', x + width + 10, y);
  };

  this.calculateCorrelationMatrix = function(variables) {
    var matrix = []; // Initialize empty matrix for correlations
    for (var i = 0; i < variables.length; i++) {
      matrix[i] = []; // Initialize empty row for each variable
      for (var j = 0; j < variables.length; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Diagonal elements are 1 (correlation of a variable with itself)
        } else {
          matrix[i][j] = this.calculateCorrelation(this.data.getColumn(variables[i]), this.data.getColumn(variables[j]));
        }
      }
    }
    return matrix; // Return the correlation matrix
  };

  this.calculateCorrelation = function(column1, column2) {
    var n = column1.length; // Number of data points (should be the same for both columns)
    var mean1 = column1.reduce((a, b) => a + parseFloat(b), 0) / n; // Mean of column1 values
    var mean2 = column2.reduce((a, b) => a + parseFloat(b), 0) / n; // Mean of column2 values

    var numerator = 0; // Initialize numerator for correlation calculation
    var denominator1 = 0; // Initialize denominator for column1
    var denominator2 = 0; // Initialize denominator for column2

    // Iterate through each data point
    for (var i = 0; i < n; i++) {
      var x = parseFloat(column1[i]) - mean1; // Difference from mean for column1
      var y = parseFloat(column2[i]) - mean2; // Difference from mean for column2
      numerator += x * y; // Sum of products of differences
      denominator1 += x * x; // Sum of squares of differences for column1
      denominator2 += y * y; // Sum of squares of differences for column2
    }

    // Handle case where denominator is 0 to prevent division by zero
    if (denominator1 === 0 || denominator2 === 0) {
      return 0; // Return 0 correlation if one of the denominators is 0
    }

    // Calculate Pearson correlation coefficient
    return numerator / Math.sqrt(denominator1 * denominator2);
  };
}
