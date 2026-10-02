function BoxPlotSuccessRates() {
  this.name = 'Success-Rates: Box Plot'; // Chart title
  this.title = 'Comparative Analysis of Success Rates by Apprenticeship Level Across Institutions'; // Chart title
  this.id = 'box-plot-success-rates'; // Unique identifier
  this.loaded = false; // Data loaded flag
  this.pad = 70; // Padding for axes
  this.textColor = '#333'; // Darker color for text
  this.boxColor = '#69b3a2'; // Light teal color for box plot elements
  this.medianColor = '#404080'; // Dark purple color for median line
  this.institutionTypes = []; // List of institution types
  this.selectedInstitution = 'All Institution Types'; // Default selected institution type
  this.dropdown = null; // Dropdown for selecting institution type

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/successrates.csv', 'csv', 'header',
        function(table) {
          self.loaded = true; // Set loaded flag to true when data is loaded
          self.institutionTypes = self.data.getColumn('Institution_Type'); // Extract institution types
          self.institutionTypes = [...new Set(self.institutionTypes)]; // Remove duplicates
          self.institutionTypes.unshift('All Institution Types'); // Add 'All Institution Types' option
        }
    );
  };

  // Setup function to create dropdown
  this.setup = function() {
    var self = this;
    if (!this.dropdown) {
      this.dropdown = createSelect(); // Create dropdown
      this.dropdown.position(this.pad + 1060, this.pad / 2 + 40); // Position dropdown
      this.institutionTypes.forEach(function(type) {
        self.dropdown.option(type); // Add options to dropdown
      });
      this.dropdown.selected('All Institution Types'); // Set default selection to 'All Institution Types'
      this.selectedInstitution = 'All Institution Types'; // Ensure the selected institution is 'All Institution Types'

      this.dropdown.changed(function() {
        self.selectedInstitution = self.dropdown.value(); // Update selected institution
        self.draw(); // Redraw the chart
      });
    }
  };

  // Destroy function to remove dropdown after chart is closed
  this.destroy = function() {
    // Remove the dropdown if it exists
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null; // Ensure dropdown is recreated when revisited
    }
    this.selectedInstitution = 'All Institution Types'; // Reset the selected institution to 'All Institution Types'
  };

  // Draw function to render the box plot
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Ensure the dropdown is created and visible
    if (!this.dropdown) {
      this.setup(); // Recreate the dropdown if it doesn't exist
    } else {
      this.dropdown.show(); // Show the dropdown if it exists
    }

    background(255); // Clear the canvas
    var levels = this.data.getColumn('Apprenticeship_Level'); // Extract apprenticeship levels
    var successRates = this.data.getColumn('Overall_Success_Rate_%'); // Extract success rates
    var institutionTypes = this.data.getColumn('Institution_Type'); // Extract institution types
    successRates = stringsToNumbers(successRates); // Convert success rate strings to numbers

    var filteredData = [];
    if (this.selectedInstitution === 'All Institution Types') {
      // Include all data if 'All Institution Types' is selected
      for (var i = 0; i < levels.length; i++) {
        filteredData.push({ level: levels[i], successRate: successRates[i] });
      }
    } else {
      // Filter data by selected institution type
      for (var i = 0; i < levels.length; i++) {
        if (institutionTypes[i] === this.selectedInstitution) {
          filteredData.push({ level: levels[i], successRate: successRates[i] });
        }
      }
    }

    var groupedData = {};
    // Group data by apprenticeship levels
    filteredData.forEach(function(row) {
      if (!groupedData[row.level]) {
        groupedData[row.level] = [];
      }
      groupedData[row.level].push(row.successRate);
    });

    var keys = Object.keys(groupedData); // Get keys (apprenticeship levels)
    var xStep = (width - 2 * this.pad) / (keys.length + 1); // Calculate x step for positioning box plots

    stroke(this.textColor); // Set stroke color for text

    // Draw box plots for each level
    keys.forEach((level, idx) => {
      var data = groupedData[level]; // Get success rate data for the current level
      var x = this.pad + xStep * (idx + 1); // Calculate x position for the current box plot

      // Calculate statistics for the box plot
      var minVal = min(data); // Minimum value
      var maxVal = max(data); // Maximum value
      var q1 = quantile(data, 0.25); // First quartile (25th percentile)
      var medianVal = quantile(data, 0.5); // Median (50th percentile)
      var q3 = quantile(data, 0.75); // Third quartile (75th percentile)

      // Draw box
      fill(this.boxColor); // Set fill color for box
      rect(x - xStep / 4, map(q3, 0, 100, height - this.pad, this.pad), xStep / 2, map(q1, 0, 100, height - this.pad, this.pad) - map(q3, 0, 100, height - this.pad, this.pad));

      // Draw median line
      stroke(this.medianColor); // Set stroke color for median line
      line(x - xStep / 4, map(medianVal, 0, 100, height - this.pad, this.pad), x + xStep / 4, map(medianVal, 0, 100, height - this.pad, this.pad));
      stroke(this.textColor); // Reset stroke color for text

      // Draw whiskers
      line(x, map(minVal, 0, 100, height - this.pad, this.pad), x, map(q1, 0, 100, height - this.pad, this.pad)); // Lower whisker
      line(x, map(maxVal, 0, 100, height - this.pad, this.pad), x, map(q3, 0, 100, height - this.pad, this.pad)); // Upper whisker

      // Draw outliers (if any)
      var outliers = data.filter(val => val < q1 || val > q3); // Filter outliers outside the quartiles
      fill(this.textColor); // Set fill color for outliers
      outliers.forEach(outlier => {
        var y = map(outlier, 0, 100, height - this.pad, this.pad); // Calculate y position for outlier
        ellipse(x, y, 5, 5); // Draw outlier as an ellipse
      });

      // Draw level label
      textAlign(CENTER); // Set text alignment
      fill(this.textColor); // Set fill color for text
      text(level, x, height - this.pad + 20); // Display apprenticeship level label
    });

    // Add axes and labels
    this.addAxes();
    this.addLabels();
  };

  // Function to add axes (x-axis and y-axis)
  this.addAxes = function() {
    stroke(this.textColor); // Set stroke color for axes

    // Add x-axis
    line(this.pad, height - this.pad, width - this.pad, height - this.pad);

    // Add y-axis
    line(this.pad, height - this.pad, this.pad, this.pad);

    // Add y-axis labels
    textAlign(RIGHT); // Set text alignment
    textSize(12); // Set text size
    fill(this.textColor); // Set fill color for text
    for (var i = 0; i <= 100; i += 10) {
      var y = map(i, 0, 100, height - this.pad, this.pad); // Calculate y position for label
      text(i, this.pad - 10, y + 5); // Display label with slight offset
    }
  };

  // Function to add labels (x-axis label, y-axis label, and chart title)
  this.addLabels = function() {
    fill(this.textColor); // Set fill color for text
    noStroke(); // Disable stroke for labels

    // Add x-axis label
    textAlign(CENTER); // Set text alignment
    textSize(18);
    text('Levels', width / 2, height - 10); // Display x-axis label

    // Add y-axis label
    textAlign(CENTER); // Set text alignment
    push(); // Push current drawing style settings onto the stack
    translate(this.pad / 2, height / 2); // Translate to the center of the left edge
    rotate(-PI / 2); // Rotate by -90 degrees (to align vertically)
    text('Success Rate (%)', 0, 0); // Display y-axis label
    pop(); // Restore the settings from the stack

    // Add chart title
    textAlign(CENTER); // Set text alignment
    textSize(20); // Set text size
    text(this.title, width / 2, this.pad / 2 ); // Display chart title
  };
}

// Utility function to convert strings to numbers
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the quantile of an array
function quantile(arr, q) {
  arr.sort((a, b) => a - b); // Sort array in ascending order
  var pos = (arr.length - 1) * q; // Calculate position based on quantile
  var base = Math.floor(pos); // Round down to the nearest integer
  var rest = pos - base; // Calculate remainder
  if (arr[base + 1] !== undefined) {
    return arr[base] + rest * (arr[base + 1] - arr[base]); // Interpolate between values
  } else {
    return arr[base]; // Return exact value if no interpolation is needed
  }
}
