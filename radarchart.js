function RadarChartSuccessRates() {
  this.name = 'Success-Rates: Radar Chart';
  this.title = 'Radar Chart: Comparison of Success Rates Across Different Categories';
  this.id = 'radar-chart-success-rates';
  this.loaded = false;
  this.pad = 50;

  // Default selected feature to 'Institution_Type'
  this.selectedFeature = 'Institution_Type';

  // Define colors for different features
  this.colors = {
    'Institution_Type': color(150, 200, 255, 150),  // Light Blue
    'Age': color(255, 182, 193, 150),  // Light Pink
    'Apprenticeship_Level': color(240, 230, 140, 150),  // Light Yellow
    'Hybrid_End_Year': color(144, 238, 144, 150),  // Light Green
    'Apprenticeship_Type': color(221, 160, 221, 150),  // Light Purple
    'Overall_Leavers': color(255, 160, 122, 150)  // Light Salmon
  };

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
        './data/successrates.csv', 'csv', 'header',
        function(table) {
          self.loaded = true;
        },
        function(error) {
          console.error('Error loading data:', error);
        }
    );
  };

  // Setup function to initialize canvas settings
  this.setup = function() {
    angleMode(RADIANS);
    noLoop();  // Prevent draw function from looping

    // Create a dropdown menu for selecting different features
    this.featureSelect = createSelect();
    this.featureSelect.position(320, 70);

    // Add specific columns (excluding success rate) as options in the dropdown
    this.featureSelect.option('Institution_Type');
    this.featureSelect.option('Age');
    this.featureSelect.option('Apprenticeship_Level');
    this.featureSelect.option('Hybrid_End_Year');
    this.featureSelect.option('Apprenticeship_Type');
    this.featureSelect.option('Overall_Leavers');

    // Set up the dropdown to change the feature and redraw the chart
    this.featureSelect.changed(() => {
      this.selectedFeature = this.featureSelect.value();
      redraw();
    });
  };

  this.destroy = function() {
    this.featureSelect.remove();  // Clean up dropdown when switching visualizations
  };

  // Draw function to render the radar chart
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(255); // Clear background

    // Add chart title
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(this.title, width / 2, this.pad / 2);

    // Extract columns based on the selected feature
    var categories = this.data.getColumn(this.selectedFeature);
    var successRates = this.data.getColumn('Overall_Success_Rate_%');
    successRates = stringsToNumbers(successRates);

    // Group data by selected feature and calculate average success rates
    var groupedData = {};
    for (var i = 0; i < categories.length; i++) {
      if (!groupedData[categories[i]]) {
        groupedData[categories[i]] = [];
      }
      groupedData[categories[i]].push(successRates[i]);
    }

    var categoryKeys = Object.keys(groupedData);
    var avgSuccessRates = categoryKeys.map(category => {
      var rates = groupedData[category];
      return average(rates);
    });

    // Calculate angles for each category
    var angles = TWO_PI / categoryKeys.length;
    var maxRadius = min(width, height) / 2 - this.pad;

    // Offset to move the chart down from the center
    var yOffset = 25;
    translate(width / 2, height / 2 + yOffset);

    stroke(0);
    fill(this.colors[this.selectedFeature] || color(150, 200, 255, 150)); // Use specific color for the selected feature

    // Draw radar shape
    beginShape();
    for (var i = 0; i < avgSuccessRates.length; i++) {
      var radius = map(avgSuccessRates[i], 0, 100, 0, maxRadius);
      var x = cos(angles * i - HALF_PI) * radius;
      var y = sin(angles * i - HALF_PI) * radius;
      vertex(x, y);
    }
    endShape(CLOSE);

    // Draw axes and labels
    for (var i = 0; i < categoryKeys.length; i++) {
      var x = cos(angles * i - HALF_PI) * maxRadius;
      var y = sin(angles * i - HALF_PI) * maxRadius;
      line(0, 0, x, y);

      // Display category labels
      noStroke();
      fill(0);
      textAlign(CENTER, CENTER);
      var labelOffset = 15;
      var labelX = cos(angles * i - HALF_PI) * (maxRadius + labelOffset);
      var labelY = sin(angles * i - HALF_PI) * (maxRadius + labelOffset);

      textSize(this.selectedFeature === 'Overall_Leavers' ? 5 : 15); // Smaller font size for 'Overall_Leavers'
      push();
      translate(labelX, labelY);
      if (this.selectedFeature === 'Overall_Leavers') {
        rotate(0);  // Do not rotate text for Overall_Leavers
      } else {
        rotate(angles * i - HALF_PI + PI / 2);  // Rotate text for other features
      }
      text(categoryKeys[i], 0, 0);
      pop();
    }

    // Draw concentric circles for reference
    stroke(200);
    noFill();
    for (var r = maxRadius / 5; r <= maxRadius; r += maxRadius / 5) {
      ellipse(0, 0, r * 2, r * 2);
    }

    // Add axis labels for percentage scales
    textSize(15);
    fill(0);
    for (var i = 1; i <= 5; i++) {
      var r = (maxRadius / 5) * i;
      textAlign(CENTER, CENTER);
      text((i * 20) + '%', 0, -r);
    }
  };
}

// Utility function to convert strings to numbers
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the average of an array
function average(array) {
  var sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}
