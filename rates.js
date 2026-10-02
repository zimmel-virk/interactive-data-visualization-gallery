function SuccessRatesByInstitutionTypeYear() {
  // Chart properties
  this.name = 'Success-Rates: Bar Chart'; // Chart title
  this.title = 'Success Rates by Institution Type and Year'; // Chart title
  this.id = 'Institutional Type Success Rates: Yearly Analysis'; // Unique identifier
  this.loaded = false; // Data loaded flag
  this.pad = 170; // Padding for the chart edges
  this.barGap = 20; // Increase gap between groups of bars for clarity

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/successrates.csv', 'csv', 'header',
      function(table) {
        self.loaded = true; // Set loaded flag to true when data is loaded
      }
    );
  };

 
  // Setup function
this.setup = function() {
  if (!this.loaded) {
    console.log('Data not yet loaded');
    return;
  }

  // Create a select dropdown for years
  this.yearSelect = createSelect();
  this.yearSelect.position(400, 70); // Position the dropdown

  // Get all unique years from the data
  var years = this.data.getColumn('Hybrid_End_Year');
  var uniqueYears = [...new Set(years)];
  uniqueYears.sort();

  // Add options to the dropdown for each unique year
  this.yearSelect.option('All Years'); // Default option
  for (let year of uniqueYears) {
    this.yearSelect.option(year);
  }

  // Call draw function when year is changed
  this.yearSelect.changed(() => this.draw());

  // Initial draw of the chart
  this.draw();

  // Additional setup logic can be added here if needed
};
    
    

  // Destroy function
  this.destroy = function() {
    // Remove the dropdown if it exists
    if (this.yearSelect) {
      this.yearSelect.remove();
    }
    // Cleanup logic can be added here if needed
  };


// Draw function to render the chart
this.draw = function() {
  if (!this.loaded) {
    console.log('Data not yet loaded');
    return;
  }

  // Extract columns from the loaded data
  var selectedYear = this.yearSelect.value(); // Get the selected year from the dropdown
  var years = this.data.getColumn('Hybrid_End_Year');
  var institutions = this.data.getColumn('Institution_Type');
  var successRates = this.data.getColumn('Overall_Success_Rate_%');

  // Convert successRates from strings to numbers
  successRates = stringsToNumbers(successRates);

  // Filter data based on selected year
  var filteredData = [];
  for (var k = 0; k < years.length; k++) {
    if (selectedYear === 'All Years' || years[k].startsWith(selectedYear)) {
      filteredData.push({
        year: years[k],
        institution: institutions[k],
        successRate: successRates[k]
      });
    }
  }

  // Get unique years and institutions
  var uniqueYears = [...new Set(filteredData.map(item => item.year))];
  var uniqueInstitutions = [...new Set(filteredData.map(item => item.institution))];

  // Calculate width of each bar based on available space
  var totalBarWidth = (width - 2 * this.pad - (uniqueYears.length - 1) * this.barGap);
  var barWidth = totalBarWidth / (uniqueYears.length * uniqueInstitutions.length);

  // Calculate maximum success rate for scaling
  var maxSuccessRate = Math.max(...filteredData.map(item => item.successRate));

  // Initialize color mapping for each institution type
  var institutionColors = {};
  for (let i = 0; i < uniqueInstitutions.length; i++) {
    institutionColors[uniqueInstitutions[i]] = color(
      150 + (i * 40) % 100,  // Red component
      100 + (i * 60) % 150,  // Green component
      150 + (i * 80) % 100   // Blue component
    );
  }

  // Clear background and set stroke properties
  background(255);
  stroke(0);
  strokeWeight(1);

  // Draw bars for each institution and year
  for (var i = 0; i < uniqueInstitutions.length; i++) {
    var institution = uniqueInstitutions[i];

    for (var j = 0; j < uniqueYears.length; j++) {
      var year = uniqueYears[j];
      var x = this.pad + j * (uniqueInstitutions.length * barWidth + this.barGap) + i * barWidth;

      // Filter data for the specific institution and year
      var dataPoint = filteredData.find(item => item.year === year && item.institution === institution);

      if (dataPoint) {
        var avgSuccessRate = dataPoint.successRate; // Use the success rate directly as we are filtering correctly
        var y = map(avgSuccessRate, 0, maxSuccessRate, height - this.pad, this.pad); // Map y-coordinate based on average success rate
        var barHeight = height - this.pad - y; // Calculate bar height

        fill(institutionColors[institution]); // Set fill color based on institution type
        rect(x, y, barWidth, barHeight); // Draw rectangle (bar) for the data point
      }
    }
  }

  // Add axes, labels, and legend
  this.addAxes(uniqueYears, maxSuccessRate, uniqueInstitutions, barWidth);
  this.addLabels();
  this.addLegend(uniqueInstitutions, institutionColors);
};


  // Function to add x-axis and y-axis
  this.addAxes = function(uniqueYears, maxSuccessRate, uniqueInstitutions, barWidth) {
    stroke(200);

    // Add x-axis
    line(this.pad, height - this.pad, width - this.pad, height - this.pad);

    // Add y-axis
    line(this.pad, height - this.pad, this.pad, this.pad);

    // Add x-axis labels
    textAlign(CENTER);
    textSize(12); // Increase text size for better visibility
    fill(0); // Change to a distinct color (blue)
    noStroke(); // Ensure no outline interferes with the text

    for (var i = 0; i < uniqueYears.length; i++) {
      var x = this.pad + i * (uniqueInstitutions.length * barWidth + this.barGap) + (uniqueInstitutions.length * barWidth) / 2;
      text(uniqueYears[i], x, height - this.pad + 40); // Display year label below x-axis
    }

    // Add y-axis labels
    textAlign(RIGHT);
    textSize(12); // Increase text size for better visibility
    fill(0); // Keep black color for y-axis labels
    for (var i = 0; i <= maxSuccessRate; i += 20) {
      var y = map(i, 0, maxSuccessRate, height - this.pad, this.pad);
      text(i, this.pad - 10, y + 5); // Display success rate values along y-axis
    }
  };

  // Function to add chart title and axis labels
  this.addLabels = function() {
    // Add chart title
    textAlign(CENTER);
    textSize(24);
    fill(0);
    text(this.title, width / 2, this.pad / 2 - 50);

    // Add x-axis label
    textAlign(CENTER);
    textSize(17);
    fill(0);
    text('Year', width / 2, height - this.pad + 60);

    // Add y-axis label
    textAlign(CENTER);
    textSize(14);
    fill(0);
    push();
    translate(this.pad / 2, height / 2);
    rotate(-PI / 2);
    text('Success Rate (%)', 0, 0);
    pop();
  };

  // Function to add legend
  this.addLegend = function(uniqueInstitutions, institutionColors) {
    // Add legend
    var legendX = width - this.pad + 20;
    var legendY = this.pad;

    textAlign(LEFT);
    textSize(10);
    fill(0);

    for (var i = 0; i < uniqueInstitutions.length; i++) {
      var institution = uniqueInstitutions[i];
      fill(institutionColors[institution]);
      rect(legendX, legendY + i * 20, 10, 10); // Draw colored rectangle for each institution
      fill(0);
      text(institution, legendX + 15, legendY + 10 + i * 20); // Display institution name next to colored rectangle
    }
  };
}

// Utility function to convert strings to numbers
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the average of an array
function average(array) {
  if (array.length === 0) return 0;
  var sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}
