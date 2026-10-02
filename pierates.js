function DistributionOfLeaversByAgeGroup() {
  this.name = 'Success-Rates: Pie Chart'; // Name for the visualization to appear in the menu bar.
  this.id = 'distribution-of-leavers-by-age-group'; // Unique ID for the visualization.
  this.loaded = false; // Property to indicate whether data has been loaded.

  // Map institution types to specific colors to maintain consistency across the chart.
  this.institutionColors = {
    'General FE and Tertiary College': color(255, 0, 0),    // Red
    'Other Public Funded': color(0, 255, 0),                // Green
    'Private Sector Public Funded': color(0, 0, 255),       // Blue
    'Schools': color(255, 165, 0),                          // Orange
    'Sixth Form College': color(75, 0, 130),                // Indigo
    'Specialist College': color(255, 255, 0)                // Yellow
  };

  // Preload the data from the CSV file.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/successrates.csv', 'csv', 'header', // Path to the CSV file and its format.
        function(table) {
          self.loaded = true; // Set 'loaded' to true once the data is successfully loaded.
          console.log('Data loaded successfully'); // Log successful data loading.
        }
    );
  };

  // Setup function to initialize the visualization.
  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded'); // Log a message if the data has not been loaded yet.
      return;
    }

    // Create a dropdown menu for selecting age groups.
    this.select = createSelect();
    this.select.position(500, 450); // Position the dropdown on the canvas.
    this.select.option('ALL'); // Default option to show all age groups.

    // Populate the dropdown with unique age groups from the data.
    var uniqueAges = [...new Set(this.data.getColumn('Age'))];
    for (let age of uniqueAges) {
      this.select.option(age); // Add each unique age as an option.
    }

    this.select.selected('ALL'); // Set the default selected option to 'ALL'.
    this.select.changed(() => this.draw()); // Redraw the chart when the selection changes.

    this.draw(); // Draw the chart initially.
  };

  // Destroy function to remove the dropdown menu when the visualization is destroyed.
  this.destroy = function() {
    this.select.remove(); // Remove the dropdown menu from the canvas.
  };

  // Create a PieChart instance to handle drawing the pie chart.
  this.pie = new PieChart(width / 2, height / 2, width * 0.4); // Position and size the pie chart.

  // Function to get the color associated with an institution type.
  this.getInstitutionColor = function(institution) {
    return this.institutionColors[institution] || color(128, 128, 128); // Default to gray if the institution type is not mapped.
  };

  // Main draw function to render the pie chart and legend.
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded'); // Log a message if the data has not been loaded yet.
      return;
    }

    background(255); // Clear the canvas with a white background.

    var selectedAge = this.select.value(); // Get the selected age group from the dropdown.
    var filteredData;
    if (selectedAge === 'ALL') {
      filteredData = this.data.getRows(); // Use all rows if 'ALL' is selected.
    } else {
      filteredData = this.data.findRows(selectedAge, 'Age'); // Filter rows based on the selected age group.
    }

    // Map to accumulate the number of leavers for each institution type.
    var institutionLeaversMap = {};
    for (var row of filteredData) {
      var institution = row.get('Institution_Type');

      // Skip the row if the institution type is 'All Institution Type'.
      if (institution === 'All Institution Type') continue;

      // Parse the number of leavers, converting '-' to '0'.
      var leavers = parseFloat(row.get('Overall_Leavers').replace('-', '0'));
      if (!institutionLeaversMap[institution]) {
        institutionLeaversMap[institution] = 0; // Initialize the count if not already present.
      }
      institutionLeaversMap[institution] += leavers; // Accumulate the number of leavers.
    }

    var institutions = Object.keys(institutionLeaversMap); // Get the list of institution types.
    var leavers = institutions.map(institution => institutionLeaversMap[institution]); // Get the corresponding leavers count.

    if (institutions.length === 0) {
      console.error('No data available for the selected age group'); // Log an error if no data is available.
      return;
    }

    // Map the institution types to their corresponding colors.
    var colours = institutions.map(institution => this.getInstitutionColor(institution));
    var title = 'Distribution of Overall Leavers by Age Group Across Institution Types: ' + (selectedAge === 'ALL' ? 'All Ages' : selectedAge);

    // Draw the pie chart with the collected data.
    this.pie.draw(leavers, institutions, colours, title);
    this.drawLegend(institutions, colours); // Draw the legend next to the pie chart.
  };

  // Function to draw the legend on the canvas.
  this.drawLegend = function(labels, colours) {
    var legendX = width - 250; // X position for the legend.
    var legendY = 170; // Y position for the legend.
    var boxSize = 20; // Size of the color boxes in the legend.
    var lineHeight = 25; // Spacing between legend items.

    fill(0);
    textSize(14);
    textAlign(LEFT, CENTER);
    text('Legend:', legendX, legendY - 20); // Draw the 'Legend' label.

    // Loop through each label and color to draw the legend items.
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var color = colours[i];

      fill(color);
      rect(legendX, legendY + i * lineHeight, boxSize, boxSize); // Draw the color box.

      fill(0);
      text(label, legendX + boxSize + 10, legendY + i * lineHeight + boxSize / 2); // Draw the label next to the color box.
    }
  };
}

// Utility function to convert strings to numbers, converting '-' to 0.
function stringsToNumbers(array) {
  return array.map(item => item === '-' ? 0 : Number(item));
}

// Utility function to sum the values in an array.
function sum(array) {
  return array.reduce((acc, val) => acc + val, 0);
}

// Utility function to generate a consistent hash index for strings within a given range.
function hashStringToIndex(str, range) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % range);
}

// Class to handle the drawing of pie charts.
class PieChart {
  constructor(x, y, diameter) {
    this.x = x; // X position of the pie chart center.
    this.y = y; // Y position of the pie chart center.
    this.diameter = diameter; // Diameter of the pie chart.
    this.minAngle = 0.1;  // Minimum angle to ensure small slices are visible.
  }

  draw(values, labels, colours, title) {
    if (values.length !== labels.length || values.length !== colours.length) {
      console.error(`Values, labels, and colours lengths do not match.`); // Log an error if lengths do not match.
      return;
    }

    var total = sum(values); // Calculate the total value to determine slice sizes.
    var angles = values.map(value => max(map(value, 0, total, 0, TWO_PI), this.minAngle)); // Calculate angles for each slice.

    var angleStart = 0; // Initialize the starting angle.

    // Loop through each value to draw the corresponding pie slice.
    for (let i = 0; i < values.length; i++) {
      fill(colours[i]);
      arc(this.x, this.y, this.diameter, this.diameter, angleStart, angleStart + angles[i]); // Draw the pie slice.

      // Calculate the midpoint angle to position the percentage text.
      var angleMid = angleStart + angles[i] / 2;
      var textX = this.x + (this.diameter / 2 + 20) * cos(angleMid); // Calculate the x position for the percentage text.
      var textY = this.y + (this.diameter / 2 + 20) * sin(angleMid); // Calculate the y position for the percentage text.

      fill(0);
      textSize(12);
      textAlign(CENTER, CENTER);

      // Ensure text does not overlap and display the percentage.
      text(nf((values[i] / total) * 100, 0, 1) + '%', textX, textY);

      angleStart += angles[i]; // Increment the starting angle for the next slice.
    }

    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(title, this.x, this.y - this.diameter / 2 - 50); // Draw the title above the pie chart.
  }
}
