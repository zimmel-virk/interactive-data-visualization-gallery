function BubbleChart() {
  // Chart properties
  this.name = 'Forest-Fires: Bubble Chart'; // Name of the chart
  this.id = 'bubble-chart'; // Unique identifier
  this.title = 'Bubble Chart: Correlation of ISI with Temperature and Wind Speed in Forest Fires'; // Chart title
  this.xAxisLabel = 'Temperature (°C)'; // X-axis label
  this.yAxisLabel = 'Wind Speed (km/h)'; // Y-axis label
  this.zAxisLabel = 'Initial Spread Index (ISI)'; // Z-axis label
  this.loaded = false; // Data loaded flag

  // Layout settings
  this.layout = {
    leftMargin: 100,
    rightMargin: width - 100,
    topMargin: 100,
    bottomMargin: height - 100,
    marginSize: 50,
    // Function to calculate plot width based on margins
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    // Function to calculate plot height based on margins
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

  // Draw function to render the bubble chart
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    console.log('Drawing...');

    background(255); // Clear background

    this.drawTitle(); // Draw chart title
    drawAxis(this.layout); // Draw x and y axes
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout); // Draw axis labels

    // Iterate through each row of data
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i); // Get current row
      var temp = row.getNum('temp'); // Get temperature value
      var wind = row.getNum('wind'); // Get wind speed value
      var isi = row.getNum('ISI'); // Get ISI value
      console.log('Data:', temp, wind, isi); // Log data values

      // Map data values to screen coordinates
      var x = map(temp, 0, 35, this.layout.leftMargin, this.layout.rightMargin); // Map temperature to x-axis
      var y = map(wind, 0, 30, this.layout.bottomMargin, this.layout.topMargin); // Map wind speed to y-axis
      var size = map(isi, 0, max(this.data.getColumn('ISI')), 5, 50); // Map ISI to bubble size
      console.log('Mapped:', x, y, size); // Log mapped coordinates

      // Draw bubbles
      noStroke(); // No stroke for bubbles
      fill(255, 0, 255, 150); // Fill color for bubbles (semi-transparent pink)
      ellipse(x, y, size, size); // Draw bubble at mapped coordinates with size based on ISI
    }
  };

  // Function to draw chart title
  this.drawTitle = function() {
    fill(0); // Fill color for text (black)
    noStroke(); // No stroke for text
    textAlign(CENTER, CENTER); // Text alignment
    text(this.title, width / 2 , this.layout.topMargin - (this.layout.marginSize / 2) - 50); // Display title at the top margin
  };
}
