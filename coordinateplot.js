function EnergyConsumption() {
  this.name = 'Energy: Pairwise Line Plot';
  this.id = 'energy-consumption';
  this.xAxisLabel = 'Years';
  this.yAxisLabel = 'Values';
  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: false,
    numXTickLabels: 5, // Updated to match the number of years
    numYTickLabels: 8,
  };

  this.loaded = false;
  this.selectedSection = '';
  this.selectedVariable1 = '';
  this.sectionOptions = ['Elec', 'Gas']; // Elec appears first
  this.variable1Options = [];
  this.sectionSelect = null;
  this.variableSelect = null;
  this.colors = [];

  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/energy.csv', 'csv', 'header',
        function(table) {
          self.loaded = true;
          self.variable1Options = [...new Set(table.getColumn('Variable 1'))]; // Unique Variable 1 options
          console.log('Data loaded');
        }
    );
  };

  this.setup = function() {
    textSize(16);
    textAlign(CENTER, CENTER);

    if (!this.loaded) {
      console.log('Data not loaded in setup');
      return;
    }

    console.log('Creating dropdowns');
    this.createDropdowns();

    console.log('Setup complete');
  };

  this.createDropdowns = function() {
    var self = this;

    // Dropdown for selecting section (Elec or Gas)
    this.sectionSelect = createSelect();
    this.sectionSelect.position(600, 80);
    this.sectionSelect.option('Select Section');
    this.sectionOptions.forEach(option => this.sectionSelect.option(option));
    this.sectionSelect.changed(function() {
      self.selectedSection = self.sectionSelect.value();
      console.log('Selected section:', self.selectedSection);
      self.generateColors();
      self.draw();
    });

    // Dropdown for selecting Variable 1
    this.variableSelect = createSelect();
    this.variableSelect.position(750, 80);
    this.variableSelect.option('Select Variable');
    this.variable1Options.forEach(option => this.variableSelect.option(option));
    this.variableSelect.changed(function() {
      self.selectedVariable1 = self.variableSelect.value();
      console.log('Selected variable:', self.selectedVariable1);
      self.generateColors();
      self.draw();
    });
  };

  this.destroyDropdowns = function() {
    if (this.sectionSelect) this.sectionSelect.remove();
    if (this.variableSelect) this.variableSelect.remove();
  };

  this.generateColors = function() {
    this.colors = [];
    if (this.selectedSection !== 'Select Section' && this.selectedVariable1 !== 'Select Variable') {
      let data = this.data.getRows().map(row => {
        return {
          'Variable 1': row.get('Variable 1'),
          'Value': row.get(this.selectedSection + '_2015_Median') // Example for filtering on one year column
        };
      });
      let variable1Data = data.filter(d => d['Variable 1'] === this.selectedVariable1);
      for (let i = 0; i < variable1Data.length; i++) {
        this.colors.push([random(255), random(255), random(255)]);
      }
    }
  };

  this.draw = function() {
    background(255);

    // Draw title
    textSize(24);
    textAlign(CENTER, CENTER);
    text('Energy Consumption Over Time: Line Chart by Section and Variable', width / 2, 30);

    // Debugging information
    console.log('Current selections - Section:', this.selectedSection, ', Variable:', this.selectedVariable1);

    // Ensure all dropdowns have valid selections before proceeding
    if (this.selectedSection === 'Select Section' ||
        this.selectedVariable1 === 'Select Variable' ||
        !this.selectedSection ||
        !this.selectedVariable1) {

      console.log('Please select appropriate section and variable');
      textSize(20);
      textAlign(CENTER, CENTER);
      text('Select the options from the dropdown menu to generate the graph', width / 2, height / 2);
      return;
    }

    // Filter and aggregate data for the selected section and variable
    let data = this.data.getRows().map(row => {
      return {
        'Variable 1': row.get('Variable 1'),
        ...this.data.columns.reduce((acc, col) => {
          if (col.startsWith(this.selectedSection) && col.endsWith('_Median') &&
              (col.includes('2011') || col.includes('2012') || col.includes('2013') || col.includes('2014') || col.includes('2015'))) {
            acc[col] = parseFloat(row.get(col).replace(',', ''));
          }
          return acc;
        }, {})
      };
    }).filter(d => d['Variable 1'] === this.selectedVariable1);

    // Aggregate data by averaging across any subcategories
    let aggregatedData = {};
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'Variable 1') {
          if (!(key in aggregatedData)) {
            aggregatedData[key] = { sum: 0, count: 0 };
          }
          aggregatedData[key].sum += row[key];
          aggregatedData[key].count += 1;
        }
      });
    });

    let finalData = Object.keys(aggregatedData).map(key => {
      return { year: key, value: aggregatedData[key].sum / aggregatedData[key].count };
    });

    if (finalData.length === 0) {
      console.log('No data available for the selected variable');
      return;
    }

    // Find min and max values for scaling
    let minValue = min(finalData.map(d => d.value));
    let maxValue = max(finalData.map(d => d.value));

    let padding = 150;
    let plotHeight = height - 2 * padding;
    let plotWidth = width - 2 * padding;

    let xScale = (i) => map(i, 0, finalData.length - 1, padding, plotWidth + padding);
    let yScale = (val) => map(val, minValue, maxValue, plotHeight + padding, padding);

    // Draw axes
    stroke(0);
    line(xScale(0), padding, xScale(finalData.length - 1), padding); // Top line
    line(xScale(0), plotHeight + padding, xScale(finalData.length - 1), plotHeight + padding); // Bottom line

    // Draw x-axis labels and rotate them at 45 degrees
    textAlign(RIGHT, CENTER);
    textSize(12);
    finalData.forEach((d, i) => {
      let label = d.year.replace(this.selectedSection + '_', '');
      push();
      translate(xScale(i), plotHeight + padding + 10);
      rotate(-PI / 4);  // Rotate by 45 degrees
      text(label, 0, 0);
      pop();
    });

    // Draw y-axis labels
    let yTickValues = linspace(minValue, maxValue, this.layout.numYTickLabels);
    textAlign(RIGHT, CENTER);
    textSize(15);
    yTickValues.forEach(value => {
      let y = yScale(value);
      text(value.toFixed(2), padding - 10, y);
    });

    // Draw the line for the aggregated data
    stroke(0, 0, 255);  // Use a single color for simplicity
    noFill();
    beginShape();
    finalData.forEach((d, i) => {
      vertex(xScale(i), yScale(d.value));
    });
    endShape();
  };


  this.destroy = function() {
    this.destroyDropdowns();
    this.selectedSection = '';
    this.selectedVariable1 = '';
    console.log('EnergyConsumption instance destroyed');
  };
}

function linspace(start, end, num) {
  let step = (end - start) / (num - 1);
  return Array(num).fill(0).map((_, i) => start + (step * i));
}

function drawAxis(layout) {
  line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin);
  line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin);
}

function drawAxisLabels(xAxisLabel, yAxisLabel, layout) {
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(xAxisLabel, (layout.leftMargin + layout.rightMargin) / 2, layout.bottomMargin + layout.marginSize);
  textAlign(CENTER, CENTER);
  text(yAxisLabel, layout.leftMargin - layout.marginSize, (layout.topMargin + layout.bottomMargin) / 2);
}
