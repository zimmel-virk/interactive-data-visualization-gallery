function WaterfallChart() {
  this.name = 'Success-Rates: Waterfall Chart'; // Name of the chart to appear in the menu
  this.title = 'Waterfall Chart Displaying Overall Leavers by Institution Type'; // Title to display above the chart
  this.id = 'waterfall-chart-overall-leavers'; // Unique identifier for the chart
  this.loaded = false; // Flag to track if data has been loaded
  this.pad = 70; // Padding for the chart from the edges
  this.textColor = '#333'; // Color for the text on the chart
  this.barColor = '#69b3a2'; // Default color for the bars in the chart
  this.institutionTypes = []; // Array to store the unique institution types
  this.selectedInstitution = 'All Institution Types'; // Default selected institution type
  this.data = null; // Variable to hold the loaded data
  this.dropdown = null; // Dropdown menu for selecting institution type

  // Preload function to load the CSV data before setup and draw
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/successrates.csv', // Path to the CSV file
        'csv', 'header', // Specify that the file is a CSV and it has a header row
        function(table) {
          self.loaded = true; // Set loaded flag to true when data is loaded
          self.institutionTypes = self.data.getColumn('Institution_Type'); // Get the unique institution types from the data
          self.institutionTypes = [...new Set(self.institutionTypes)]; // Remove duplicates
          self.institutionTypes.unshift('All Institution Types'); // Add "All Institution Types" option at the beginning
          console.log('Data loaded successfully:', self.data.rows.length, 'rows'); // Log success message with row count
        },
        function(error) {
          console.error('Error loading the CSV file:', error); // Log error message if data fails to load
        }
    );
  };

  // Setup function to initialize the chart components
  this.setup = function() {
    var self = this;
    if (this.dropdown === null) {
      this.dropdown = createSelect(); // Create a dropdown menu for institution selection
      this.dropdown.position(this.pad + 980, this.pad / 2 + 10); // Position the dropdown on the canvas
      this.institutionTypes.forEach(function(type) {
        if (type !== 'All Institution Type') { // Add options to the dropdown except "All Institution Type"
          self.dropdown.option(type);
        }
      });
      this.dropdown.selected('All Institution Types'); // Set default selection to "All Institution Types"
      this.selectedInstitution = 'All Institution Types'; // Initialize selectedInstitution variable

      // Add an event listener to update the chart when the dropdown value changes
      this.dropdown.changed(function() {
        self.selectedInstitution = self.dropdown.value(); // Update the selected institution
        console.log('Selected institution changed to:', self.selectedInstitution); // Log the new selection
        self.draw(); // Redraw the chart with the new selection
      });
    }
  };

  // Destroy function to remove dropdown and reset selections
  this.destroy = function() {
    if (this.dropdown) {
      this.dropdown.remove(); // Remove the dropdown from the DOM
      this.dropdown = null; // Set the dropdown reference to null
    }
    this.selectedInstitution = 'All Institution Types'; // Reset the selected institution to default
  };

  // Draw function to render the waterfall chart
  this.draw = function() {
    if (!this.loaded || !this.data) {
      console.log('Data not yet loaded'); // Log a message if data is not loaded
      return;
    }

    if (this.dropdown === null) {
      this.setup(); // Initialize the dropdown if it hasn't been created
    } else {
      this.dropdown.show(); // Show the dropdown if it already exists
    }

    background(255); // Set the background color to white

    var institutionTypes = this.data.getColumn('Institution_Type'); // Get the institution types from the data
    var overallLeavers = this.data.getColumn('Overall_Leavers').map(value => {
      let num = parseFloat(value.replace(/[^0-9.-]/g, '')); // Parse overall leavers as numbers
      return isNaN(num) ? null : num; // Return null if parsing fails
    });

    var filteredData = []; // Array to hold filtered data based on the selected institution

    // Aggregate data when "All Institution Types" is selected
    if (this.selectedInstitution === 'All Institution Types') {
      let aggregation = {}; // Object to hold the aggregated data
      for (var i = 0; i < institutionTypes.length; i++) {
        if (overallLeavers[i] !== null) {
          if (!aggregation[institutionTypes[i]]) {
            aggregation[institutionTypes[i]] = 0; // Initialize the aggregation for the institution type
          }
          aggregation[institutionTypes[i]] += overallLeavers[i]; // Aggregate the overall leavers
        }
      }
      for (let institutionType in aggregation) {
        filteredData.push({ institutionType: institutionType, overallLeavers: aggregation[institutionType] }); // Push aggregated data to filteredData array
      }
    } else {
      // Filter data for the selected institution
      for (var i = 0; i < institutionTypes.length; i++) {
        if (institutionTypes[i] === this.selectedInstitution && overallLeavers[i] !== null) {
          filteredData.push({ institutionType: institutionTypes[i], overallLeavers: overallLeavers[i] }); // Push filtered data to filteredData array
        }
      }
    }

    var maxOverallLeavers = Math.max(...filteredData.map(d => d.overallLeavers)); // Get the maximum value of overall leavers
    var barWidth = (width - 2 * this.pad) / filteredData.length; // Calculate the width of each bar

    stroke(this.textColor); // Set stroke color for the bars

    filteredData.forEach((dataPoint, index) => {
      var x = this.pad + index * barWidth; // Calculate the x position of the bar
      var y = height - this.pad; // Set the y position to the bottom of the chart area
      var barHeight = map(dataPoint.overallLeavers, 0, maxOverallLeavers, 0, height - 2 * this.pad); // Map the overall leavers to the bar height

      fill(dataPoint.overallLeavers >= 0 ? 'green' : 'red'); // Set bar color based on positive or negative value
      rect(x, y - barHeight, barWidth - 10, barHeight); // Draw the bar

      // Draw the label only if it's the first occurrence or different from the previous label
      if (index === 0 || filteredData[index - 1].institutionType !== dataPoint.institutionType) {
        textAlign(CENTER); // Center align the text
        fill(this.textColor); // Set text color
        textSize(8); // Set text size
        text(dataPoint.institutionType, x + barWidth / 2, height - this.pad + 30); // Draw the institution type label below the bar
      }
    });

    this.addAxes(maxOverallLeavers); // Call function to add axes to the chart
    this.addLabels(); // Call function to add labels to the chart
  };

  // Function to add axes to the chart
  this.addAxes = function(maxValue) {
    stroke(this.textColor); // Set stroke color for the axes
    line(this.pad, height - this.pad, width - this.pad, height - this.pad); // Draw the x-axis
    line(this.pad, height - this.pad, this.pad, this.pad); // Draw the y-axis

    let numTicks = 10; // Number of ticks on the y-axis
    textAlign(RIGHT, CENTER); // Align text to the right for y-axis labels
    for (let i = 0; i <= numTicks; i++) {
      let y = map(i, 0, numTicks, height - this.pad, this.pad); // Calculate the y position of the tick
      let value = map(i, 0, numTicks, 0, maxValue); // Calculate the value for the tick label
      text(nf(value, 0, 0), this.pad - 10, y); // Draw the tick label on the y-axis
    }
  };

  // Function to add labels to the chart
  this.addLabels = function() {
    fill(this.textColor); // Set fill color for the text
    noStroke(); // Disable stroke for the text

    textAlign(CENTER); // Center align the text
    textSize(15); // Set text size for the x-axis label
    text('Institution Type', width / 2, height - 10); // Draw the x-axis label

    textAlign(CENTER); // Center align the text
    push(); // Save the current drawing settings
    translate(this.pad / 2, height / 2); // Translate to the position for the y-axis label
    rotate(-PI / 2); // Rotate the text to display vertically
    text('Overall Leavers', 0, -10); // Draw the y-axis label
    pop(); // Restore the original drawing settings

    textAlign(CENTER); // Center align the text
    textSize(18); // Set text size for the chart title
    text(this.title, width / 2, this.pad / 2 - 10); // Draw the chart title at the top
  };
}
