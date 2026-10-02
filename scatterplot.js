function ScatterplotOverallLeavers() {
  this.name = 'Success-Rates: Scatterplot'; // Chart title
  this.title = 'Institution Type vs. Overall Leavers: A Yearly Scatterplot Analysis'; // Chart title
  this.id = 'scatterplot-overall-leavers'; // Unique identifier
  this.xAxisLabel = 'Institution Type';
  this.yAxisLabel = 'Overall Leavers';

  this.years = []; // Array to hold years
  this.selectedYear = ''; // Selected year, '' means "All"
  this.colors = [];
  this.filteredData = []; // Array to hold filtered valid data
  this.institutionTypes = []; // Array to hold institution types

  var marginSize = 35; // Size of the margins around the plot

  // Layout configuration
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 100,
    topMargin: marginSize + 60,
    bottomMargin: height - marginSize * 2,
    pad: 5, // Padding between plot and margins
    plotWidth: function() { return this.rightMargin - this.leftMargin; },
    plotHeight: function() { return this.bottomMargin - this.topMargin; },
    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false; // Flag to check if data is loaded

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/successrates.csv', 'csv', 'header',
        function(table) {
          self.loaded = true;
          self.filterData(); // Filter data immediately after loading
          self.populateYears(); // Populate years
          self.populateInstitutionTypes(); // Populate institution types
        }
    );
  };

  // Function to filter out invalid data
  this.filterData = function() {
    var institutionTypes = this.data.getColumn('Institution_Type');
    var overallLeavers = this.data.getColumn('Overall_Leavers');
    var years = this.data.getColumn('Hybrid_End_Year');

    this.filteredData = [];

    for (var i = 0; i < institutionTypes.length; i++) {
      var institutionType = institutionTypes[i];
      var leavers = parseFloat(overallLeavers[i].replace(/[^0-9.-]/g, '')); // Handle non-numeric values
      var year = years[i];

      // Ensure only valid data points are included
      if (!isNaN(leavers) && overallLeavers[i] !== "-" &&
          (this.selectedYear === '' || this.selectedYear === year)) {
        this.filteredData.push({
          institutionType: institutionType,
          overallLeavers: leavers,
          year: year,
          color: this.getColor(institutionType) // Generate color based on institution type
        });
      }
    }
  };


  // Function to populate years
  this.populateYears = function() {
    this.years = this.data.getColumn('Hybrid_End_Year').filter((v, i, a) => a.indexOf(v) === i);
  };

  // Function to populate institution types
  this.populateInstitutionTypes = function() {
    this.institutionTypes = this.data.getColumn('Institution_Type').filter((v, i, a) => a.indexOf(v) === i);
  };

  // Function to get color based on institution type
  this.getColor = function(institutionType) {
    if (!this.colors[institutionType]) {
      this.colors[institutionType] = color(random(0, 255), random(0, 255), random(0, 255));
    }
    return this.colors[institutionType];
  };

  // Setup function to initialize plot properties
  this.setup = function() {
    textSize(16); // Set text size for the plot

    // Create a dropdown for years
    this.yearDropdown = createSelect();
    this.yearDropdown.position(380, 50);
    this.yearDropdown.option('All Years');
    for (var i = 0; i < this.years.length; i++) {
      this.yearDropdown.option(this.years[i]);
    }
    this.yearDropdown.selected('All Years'); // Set default to 'All'
    this.selectedYear = ''; // Ensure 'All' is selected

    var self = this;
    this.yearDropdown.changed(function() {
      self.selectedYear = self.yearDropdown.value() === 'All Years' ? '' : self.yearDropdown.value();
      self.filterData(); // Re-filter data based on selected year
      self.draw(); // Redraw the graph with the filtered data
    });
  };

  // Destroy function
  this.destroy = function() {
    // Remove the dropdown if it exists
    if (this.yearDropdown) {
      this.yearDropdown.remove();
    }
    this.selectedYear = ''; // Reset the selected year to 'All'
    this.filterData(); // Re-filter data to show all years
  };

  // Draw function to plot the data
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawTitle(); // Draw plot title

    textSize(10);
    drawYAxisTickLabels(0, max(this.filteredData.map(d => d.overallLeavers)), this.layout, this.mapOverallLeaversToHeight.bind(this), 0); // Draw Y axis tick labels
    textSize(16);
    drawAxis(this.layout); // Draw X and Y axes
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout); // Draw axis labels

    // Iterate through filtered data
    for (var i = 0; i < this.filteredData.length; i++) {
      var entry = this.filteredData[i];

      var x = this.mapInstitutionTypeToWidth(entry.institutionType); // Map institution type to X position
      var y = this.mapOverallLeaversToHeight(entry.overallLeavers); // Map overall leavers to Y position

      fill(entry.color); // Set fill color for the point
      ellipse(x, y, 10, 10); // Draw the data point
    }

    this.drawLegend(); // Draw the legend
  };

  // Draw the plot title
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textSize(20);
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 60);
  };

  // Map institution type to X position
  this.mapInstitutionTypeToWidth = function(institutionType) {
    var index = this.institutionTypes.indexOf(institutionType);
    return map(index, 0, this.institutionTypes.length - 1, this.layout.leftMargin, this.layout.rightMargin);
  };


  // Map overall leavers to Y position
  this.mapOverallLeaversToHeight = function(value) {
    return map(value, 0, max(this.filteredData.map(d => d.overallLeavers)), this.layout.bottomMargin, this.layout.topMargin);
  };


  // Draw the legend
  this.drawLegend = function() {
    var legendX = this.layout.rightMargin + 20;
    var legendY = this.layout.topMargin + 50;
    var legendSize = 10;
    var legendSpacing = 20;

    for (var institutionType in this.colors) {
      fill(this.colors[institutionType]);
      rect(legendX, legendY - 5, legendSize, legendSize);
      fill(0);
      textAlign(LEFT, CENTER);
      textSize(10);
      text(institutionType, legendX + legendSize + 5, legendY);
      legendY += legendSpacing;
    }
  };
}
