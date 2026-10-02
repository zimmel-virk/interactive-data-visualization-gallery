function NutrientsTimeSeries() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Nutrients: 1974-2016';

  // Each visualisation must have a unique ID with no special characters.
  this.id = 'nutrients-timeseries';

  // Title to display above the plot.
  this.title = 'Nutrients over Time: 1974-2016';

  // Names for each axis.
  this.xAxisLabel = 'Year';
  this.yAxisLabel = 'Nutrient';

  this.colors = [];

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 130,
    topMargin: marginSize + 70,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.

    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/food/nutrients74-16.csv', 'csv', 'header',
        // Callback function to set the value this.loaded to true.
        function(table) {
          self.loaded = true;
        });
  };

  this.setup = function() {
    // Font defaults.
    textSize(12);

    console.log(this.data.columns);

    // Set min and max years: assumes data is sorted by date.
    this.startYear = Number(this.data.columns[1]);
    this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
    }

    // Find min and max percentage for mapping to canvas height.
    this.minPercentage = 80; // Adjust according to your data
    this.maxPercentage = 400; // Adjust according to your data
  };

  this.destroy = function() {};

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw the title above the plot.
    this.drawTitle();

    // Draw all y-axis labels.
    noStroke();
    drawYAxisTickLabels(this.minPercentage,
        this.maxPercentage,
        this.layout,
        this.mapPayGapToHeight.bind(this),
        0);

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
        this.yAxisLabel,
        this.layout);

    // Plot all data between startYear and endYear using the width
    // of the canvas minus margins.

    var numYears = this.endYear - this.startYear;

    // The number of x-axis labels to skip so that only
    // numXTickLabels are drawn.
    var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

    // Loop over all rows and draw a line from the previous value to
    // the current.
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var previous = null;

      var l = row.getString(0); // Label for the legend

      for (var j = 1; j <= numYears; j++) {
        // Create an object to store data for the current year.
        var current = {
          // Convert strings to numbers.
          'year': this.startYear + j - 1,
          'percentage': row.getNum(j)
        };

        if (previous != null) {
          // Draw line segment connecting previous year to current year data.
          stroke(this.colors[i]);
          strokeWeight(3);
          line(this.mapYearToWidth(previous.year),
              this.mapPayGapToHeight(previous.percentage),
              this.mapYearToWidth(current.year),
              this.mapPayGapToHeight(current.percentage));

        }

        // Draw the tick label marking the start of the previous year.
        if (j % xLabelSkip == 0) {
          noStroke();
          drawXAxisTickLabel(current.year, this.layout,
              this.mapYearToWidth.bind(this));
        }

        // Assign current year to previous year so that it is available
        // during the next iteration of this loop to give us the start
        // position of the next line segment.
        previous = current;
      }
    }

    // Draw the legend.
    this.drawLegend();
  };

  this.drawLegend = function() {
    let legendX = this.layout.rightMargin + 20;
    let legendY = this.layout.topMargin;
    let legendSize = 10;
    let legendSpacing = 20;

    textSize(10);
    textAlign(LEFT, CENTER);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      let nutrient = this.data.getRow(i).getString(0);
      fill(this.colors[i]);
      noStroke();
      rect(legendX, legendY - 5, legendSize, legendSize); // Draw the color box
      fill(0);
      text(nutrient, legendX + legendSize + 5, legendY); // Draw the nutrient name
      legendY += legendSpacing;
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textSize(20);
    textAlign('center', 'center');

    text(this.title,
        (this.layout.plotWidth() / 2) + this.layout.leftMargin,
        this.layout.topMargin - (this.layout.marginSize / 2) - 50);
  };

  this.mapYearToWidth = function(value) {
    return map(value,
        this.startYear,
        this.endYear,
        this.layout.leftMargin, // Draw left-to-right from margin.
        this.layout.rightMargin);
  };

  this.mapPayGapToHeight = function(value) {
    return map(value,
        this.minPercentage,
        this.maxPercentage,
        this.layout.bottomMargin, // Smaller pay gap at bottom.
        this.layout.topMargin); // Bigger pay gap at top.
  };
}

function drawYAxisTickLabels(min, max, layout, mapFunction, decimalPlaces) {
  var range = max - min;
  var interval = range / layout.numYTickLabels;

  for (var i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * interval);
    var y = mapFunction(value);

    textSize(10); // Make Y-axis labels smaller
    noStroke();
    fill(0);
    textAlign(RIGHT, CENTER);
    text(value.toFixed(decimalPlaces), layout.leftMargin - layout.pad, y);
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  textSize(10); // Make X-axis labels smaller
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);

  var x = mapFunction(value);
  push();
  translate(x, layout.bottomMargin + layout.marginSize / 2);
  rotate(PI / 4); // Rotate labels for better readability
  text(value, 0, 0);
  pop();
}

function drawAxis(layout) {
  stroke(0);
  line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin); // y-axis
  line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin); // x-axis
}

function drawAxisLabels(xLabel, yLabel, layout) {
  fill(0);
  noStroke();
  textAlign('center', 'center');

  // x-axis
  text(xLabel,
      (layout.plotWidth() / 2) + layout.leftMargin,
      layout.bottomMargin + (layout.marginSize * 1.5));

  // y-axis
  push();
  translate(layout.leftMargin - (layout.marginSize * 1.5), layout.topMargin + (layout.plotHeight() / 2));
  rotate(-PI / 2);
  text(yLabel, 0, 0);
  pop();
}
