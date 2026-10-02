function LollipopChart() {
    this.name = 'Stress: Lollipop Chart'; // Name for the visualization to appear in the menu bar.
    this.id = 'lollipop-chart'; // Unique ID for the visualization.
    this.title = 'Lollipop Chart: Comparative Analysis of Stress and Anxiety Levels'; // Title to display above the plot.

    var marginSize = 35; // Define the size of the margins around the plot.

    this.layout = {
        marginSize: marginSize, // Set the size of the margin.
        leftMargin: marginSize * 2 + 180, // Define the left margin with additional space for axes and labels.
        rightMargin: width - marginSize - 170, // Define the right margin with additional space for legend.
        topMargin: marginSize + 90, // Define the top margin with additional space for title.
        bottomMargin: height - marginSize * 1.5, // Define the bottom margin.
        pad: 5, // Padding around elements in the layout.
        plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate the plot width based on margins.
        plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate the plot height based on margins.
    };

    this.loaded = false; // Property to indicate whether data has been loaded.
    this.jitteredPoints = []; // Array to store points with applied jittering.

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/stress.csv', // Path to the CSV file containing the data.
            'csv', 'header', // Specify the file type and that it contains a header row.
            function(table) {
                self.loaded = true; // Callback to set 'loaded' to true after data is successfully loaded.
                console.log('Data loaded successfully:', self.data.getRowCount(), 'rows'); // Log the number of rows loaded.
                console.log('Columns:', self.data.columns); // Log the columns in the data.
            }
        );
    };

    this.setup = function() {
        textSize(16); // Set the default text size for the visualization.
        this.applyJittering();  // Apply jittering to the points during setup to avoid overlap.
    };

    this.applyJittering = function() {
        // Calculate the maximum and minimum values for stress and anxiety levels.
        let maxStressVal = max(this.data.getColumn('stress_level').map(n => parseFloat(n)));
        let maxAnxietyVal = max(this.data.getColumn('anxiety_level').map(n => parseFloat(n)));
        let minAnxietyVal = min(this.data.getColumn('anxiety_level').map(n => parseFloat(n)));

        let pointMap = {}; // Initialize a map to keep track of point occurrences.

        for (let i = 0; i < this.data.getRowCount(); i++) {
            // Retrieve stress and anxiety levels for the current row.
            let stressValue = this.data.getNum(i, 'stress_level');
            let anxietyValue = this.data.getNum(i, 'anxiety_level');

            // Create a unique key for each stress-anxiety combination.
            let key = `${stressValue}-${anxietyValue}`;
            if (!pointMap[key]) {
                // If the key does not exist, create a new entry with count 1.
                pointMap[key] = {
                    stressValue,
                    anxietyValue,
                    count: 1
                };
            } else {
                // If the key exists, increment the count.
                pointMap[key].count += 1;
            }
        }

        // Apply jittering to the points based on their counts.
        for (let key in pointMap) {
            let dataPoint = pointMap[key];
            let jitterX = random(-1, 1); // Random jitter for x-coordinate.
            let jitterY = random(-1, 1); // Random jitter for y-coordinate.

            // Map anxiety values to x-coordinates.
            let x = this.layout.leftMargin + map(dataPoint.anxietyValue, minAnxietyVal, maxAnxietyVal, 0, this.layout.plotWidth()) + jitterX;
            // Map stress values to y-coordinates, with base y adjusted by jitter.
            let yBase = this.layout.topMargin + map(dataPoint.stressValue, 0, maxStressVal, this.layout.plotHeight(), 0);

            // Adjust y-coordinate based on count to avoid overlap.
            let y = yBase - jitterY - (dataPoint.count - 1) * 4;
            y = constrain(y, this.layout.topMargin, this.layout.bottomMargin - 15); // Constrain y to within the plot area.

            // Store jittered points for drawing later.
            for (let j = 0; j < dataPoint.count; j++) {
                this.jitteredPoints.push({ x, y: y + j * 4, anxietyValue: dataPoint.anxietyValue, stressValue: dataPoint.stressValue });
            }
        }
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log if data has not been loaded.
            return;
        }

        this.drawTitle(); // Draw the title of the plot.
        this.drawAxes(); // Draw the axes of the plot.
        this.drawLollipops(); // Draw the lollipops on the plot.
        this.drawLegend();  // Draw the legend explaining the colors used.
        noLoop(); // Stop looping as we only need to draw the plot once.
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(25); // Set the text size for the title.
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin - 40, this.layout.topMargin - (this.layout.marginSize / 2) - 80); // Position and draw the title.
    };

    this.drawAxes = function() {
        textAlign(CENTER, CENTER);
        textSize(16);
        fill(0);
        text("Stress Level", this.layout.leftMargin - 50, (this.layout.plotHeight() / 2) + this.layout.topMargin); // Draw Y-axis label.

        textAlign(CENTER, CENTER);
        textSize(16);
        fill(0);
        text("Anxiety Level", this.layout.leftMargin + this.layout.plotWidth() / 2, this.layout.bottomMargin + 40); // Draw X-axis label.

        let maxStressVal = max(this.data.getColumn('stress_level').map(n => parseFloat(n))); // Calculate maximum stress level.

        let numTicks = 5; // Define the number of ticks on the Y-axis.
        let tickSpacing = this.layout.plotHeight() / numTicks; // Calculate spacing between ticks.
        let tickValueSpacing = maxStressVal / numTicks; // Calculate spacing between tick values.

        // Draw Y-axis ticks and labels.
        for (let i = 0; i <= numTicks; i++) {
            let y = this.layout.topMargin + i * tickSpacing; // Calculate y-coordinate for each tick.
            let value = maxStressVal - i * tickValueSpacing; // Calculate value for each tick.

            stroke(0);
            line(this.layout.leftMargin - 10, y, this.layout.leftMargin, y); // Draw the tick mark.

            noStroke();
            fill(0);
            textAlign(RIGHT, CENTER);
            text(value.toFixed(1), this.layout.leftMargin - 15, y); // Draw the tick label.
        }

        let maxAnxietyVal = max(this.data.getColumn('anxiety_level').map(n => parseFloat(n))); // Calculate maximum anxiety level.
        let minAnxietyVal = min(this.data.getColumn('anxiety_level').map(n => parseFloat(n))); // Calculate minimum anxiety level.

        let xTicks = 5; // Define the number of ticks on the X-axis.
        let xTickSpacing = this.layout.plotWidth() / xTicks; // Calculate spacing between ticks.
        let xTickValueSpacing = (maxAnxietyVal - minAnxietyVal) / xTicks; // Calculate spacing between tick values.

        // Draw X-axis ticks and labels.
        for (let i = 0; i <= xTicks; i++) {
            let x = this.layout.leftMargin + i * xTickSpacing; // Calculate x-coordinate for each tick.
            let value = minAnxietyVal + i * xTickValueSpacing; // Calculate value for each tick.

            stroke(0);
            line(x, this.layout.bottomMargin, x, this.layout.bottomMargin + 10); // Draw the tick mark.

            noStroke();
            fill(0);
            textAlign(CENTER, TOP);
            text(value.toFixed(1), x, this.layout.bottomMargin + 15); // Draw the tick label.
        }
    };

    this.drawLollipops = function() {
        let lollipopSize = 6; // Define the size of the lollipop heads.
        let lineWidth = 1; // Define the width of the lines.

        strokeWeight(lineWidth); // Set the stroke weight for the lines.

        // Draw each lollipop based on jittered points.
        for (let i = 0; i < this.jitteredPoints.length; i++) {
            let x = this.jitteredPoints[i].x; // Get the x-coordinate of the point.
            let y = this.jitteredPoints[i].y; // Get the y-coordinate of the point.
            let stressValue = this.jitteredPoints[i].stressValue; // Get the stress value of the point.

            // Choose color based on stress level.
            let colorValue;
            if (stressValue === 0) {
                colorValue = color(255, 102, 0); // Vibrant Orange for 0 stress level.
            } else if (stressValue === 1) {
                colorValue = color(255, 165, 0); // Vibrant Purple for 1 stress level.
            } else if (stressValue === 2) {
                colorValue = color(51, 102, 255); // Vibrant Blue for 2 stress level.
            } else {
                colorValue = color(255, 0, 255); // Vibrant Magenta for any other value.
            }

            stroke(0, 150); // Set the stroke color with slight transparency.
            line(x, this.layout.topMargin + this.layout.plotHeight(), x, y); // Draw the line from the bottom to the y-coordinate of the lollipop.
            fill(colorValue); // Set the fill color for the lollipop head.
            noStroke(); // Remove the stroke for the lollipop head.
            ellipse(x, y, lollipopSize, lollipopSize); // Draw the lollipop head.
        }
    };

    // New function to draw the legend explaining the colors used.
    this.drawLegend = function() {
        let legendX = this.layout.rightMargin + 20;  // Positioning legend on the right of the chart.
        let legendY = this.layout.topMargin + 130;   // Start near the top of the plot.

        // Define the items to display in the legend.
        let legendItems = [
            { label: 'Stress Level 0', color: color(255, 102, 0) },  // Vibrant Orange for Stress Level 0.
            { label: 'Stress Level 1', color: color(255, 165, 0)}, // Vibrant Purple for Stress Level 1.
            { label: 'Stress Level 2', color: color(51, 102, 255) }, // Vibrant Blue for Stress Level 2.
            { label: 'Other', color: color(255, 0, 255) }            // Vibrant Magenta for any other values.
        ];

        textAlign(LEFT, CENTER);
        textSize(14); // Set the text size for the legend labels.

        // Draw each item in the legend.
        legendItems.forEach((item, index) => {
            fill(item.color); // Set the fill color for the legend box.
            noStroke();
            rect(legendX, legendY + index * 20, 15, 15);  // Draw the colored box.

            fill(0);
            noStroke();
            text(item.label, legendX + 20, legendY + index * 20 + 8);  // Add the label text next to the box.
        });
    };

    this.destroy = function() {
        // Any cleanup code goes here when the visualization is destroyed.
    };
}
