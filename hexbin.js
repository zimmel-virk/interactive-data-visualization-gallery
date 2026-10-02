function HexbinPlot() {
    this.name = 'Stress: Hexbin Plot'; // Name for the visualization to appear in the menu bar.
    this.id = 'hexbin-plot'; // Unique ID for the visualization.
    this.title = 'Hexbin Plot of Stress Data Across Selected Variables: Analyzing Distribution Patterns'; // Title to display above the plot.

    var marginSize = 35; // Define the size of the margins around the plot.

    this.layout = {
        marginSize: marginSize, // Set the size of the margin.
        leftMargin: marginSize * 2 + 180, // Define the left margin with additional space for axes and labels.
        rightMargin: width - marginSize - 150, // Define the right margin.
        topMargin: marginSize + 100, // Define the top margin with additional space for title.
        bottomMargin: height - marginSize * 2, // Define the bottom margin.
        pad: 5, // Padding around elements in the layout.
        plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate the plot width based on margins.
        plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate the plot height based on margins.
    };

    this.loaded = false; // Property to indicate whether data has been loaded.

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/stress.csv', // Path to the CSV file.
            'csv', 'header', // Specify the file type and header presence.
            function(table) {
                self.loaded = true; // Callback to set 'loaded' to true after data is successfully loaded.
                console.log('Data loaded successfully:', self.data.getRowCount(), 'rows'); // Log the number of rows loaded.
            }
        );
    };

    this.setup = function() {
        textSize(16); // Set the default text size for the visualization.

        // Create dropdown menus for selecting variables to compare.
        this.variableDropdown1 = createSelect();
        this.variableDropdown1.position(this.layout.leftMargin + 80 , this.layout.topMargin - 90); // Position the first dropdown.
        this.variableDropdown1.option('Select Variable'); // Default option.

        this.variableDropdown2 = createSelect();
        this.variableDropdown2.position(this.layout.leftMargin + 80, this.layout.topMargin - 60 ); // Position the second dropdown.
        this.variableDropdown2.option('Select Variable'); // Default option.

        // Populate dropdowns with the names of the columns from the data.
        this.data.columns.forEach(column => {
            this.variableDropdown1.option(column); // Add each column name as an option in the first dropdown.
            this.variableDropdown2.option(column); // Add each column name as an option in the second dropdown.
        });

        // Initialize selected variables as null.
        this.selectedVariable1 = null;
        this.selectedVariable2 = null;

        // Event listener to update selected variable and redraw the plot when the first dropdown changes.
        this.variableDropdown1.changed(() => {
            this.selectedVariable1 = this.variableDropdown1.value() === 'Select Variable' ? null : this.variableDropdown1.value(); // Update selected variable or reset to null.
            this.draw(); // Redraw the plot.
        });

        // Event listener to update selected variable and redraw the plot when the second dropdown changes.
        this.variableDropdown2.changed(() => {
            this.selectedVariable2 = this.variableDropdown2.value() === 'Select Variable' ? null : this.variableDropdown2.value(); // Update selected variable or reset to null.
            this.draw(); // Redraw the plot.
        });
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log if the data has not been loaded.
            return;
        }

        clear(); // Clear the canvas before drawing.
        this.drawTitle(); // Draw the title of the plot.

        // Check if both variables are selected.
        if (this.selectedVariable1 && this.selectedVariable2) {
            this.drawAxes(); // Draw the X and Y axes based on the selected variables.
            this.drawHexbin(); // Draw the hexbin plot based on the selected variables.
            this.drawLegend(); // Draw the legend to explain the color coding.
        } else {
            this.drawPromptMessage(); // Draw a message prompting the user to select variables.
        }
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(25); // Set the text size for the title.
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin - 40, this.layout.topMargin - (this.layout.marginSize / 2) - 100); // Position and draw the title.
    };

    this.drawAxes = function() {
        stroke(0); // Set stroke color for axes.
        strokeWeight(1); // Set stroke weight for axes.

        // Draw the X-axis.
        line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.rightMargin, this.layout.bottomMargin);

        // Draw the Y-axis.
        line(this.layout.leftMargin, this.layout.topMargin, this.layout.leftMargin, this.layout.bottomMargin);

        // Get the range and ticks for the X-axis based on the selected variable.
        let xVals = this.data.getColumn(this.selectedVariable1).map(n => parseFloat(n)); // Convert values to float.
        let xMin = min(xVals); // Find the minimum value.
        let xMax = max(xVals); // Find the maximum value.
        let xTicks = 5;  // Set the number of ticks on the X-axis.

        // Draw the X-axis ticks and labels.
        for (let i = 0; i <= xTicks; i++) {
            let xPos = map(i, 0, xTicks, this.layout.leftMargin, this.layout.rightMargin); // Calculate position of tick.
            let xVal = map(i, 0, xTicks, xMin, xMax).toFixed(2); // Calculate value for tick label.
            line(xPos, this.layout.bottomMargin, xPos, this.layout.bottomMargin + 5); // Draw the tick mark.
            noStroke();
            fill(0);
            textAlign('center');
            textSize(12);
            text(xVal, xPos, this.layout.bottomMargin + 20); // Draw the tick label.
        }

        // Get the range and ticks for the Y-axis based on the selected variable.
        let yVals = this.data.getColumn(this.selectedVariable2).map(n => parseFloat(n)); // Convert values to float.
        let yMin = min(yVals); // Find the minimum value.
        let yMax = max(yVals); // Find the maximum value.
        let yTicks = 5;  // Set the number of ticks on the Y-axis.

        // Draw the Y-axis ticks and labels.
        for (let i = 0; i <= yTicks; i++) {
            let yPos = map(i, 0, yTicks, this.layout.bottomMargin, this.layout.topMargin); // Calculate position of tick.
            let yVal = map(i, 0, yTicks, yMin, yMax).toFixed(2); // Calculate value for tick label.
            line(this.layout.leftMargin - 5, yPos, this.layout.leftMargin, yPos); // Draw the tick mark.
            noStroke();
            fill(0);
            textAlign('right');
            textSize(12);
            text(yVal, this.layout.leftMargin - 10, yPos + 5); // Draw the tick label.
        }

        // Draw the X-axis label.
        textAlign('center', 'center');
        textSize(16);
        text(this.selectedVariable1, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.bottomMargin + 40); // Position and draw the X-axis label.

        // Draw the Y-axis label.
        push();
        translate(this.layout.leftMargin - 60, (this.layout.plotHeight() / 2) + this.layout.topMargin); // Position and rotate the Y-axis label.
        rotate(-HALF_PI);
        text(this.selectedVariable2, 0, 0); // Draw the Y-axis label.
        pop();
    };

    this.drawHexbin = function() {
        let xVals = this.data.getColumn(this.selectedVariable1).map(n => parseFloat(n)); // Get and convert X values.
        let yVals = this.data.getColumn(this.selectedVariable2).map(n => parseFloat(n)); // Get and convert Y values.

        let xMin = min(xVals); // Find the minimum X value.
        let xMax = max(xVals); // Find the maximum X value.
        let yMin = min(yVals); // Find the minimum Y value.
        let yMax = max(yVals); // Find the maximum Y value.

        var hexRadius = 30; // Set the radius of each hexbin.
        var hexWidth = sqrt(3) * hexRadius; // Calculate the width of each hexbin.
        var hexHeight = 2 * hexRadius; // Calculate the height of each hexbin.

        // Determine the number of columns and rows of hexagons based on plot dimensions.
        var cols = floor(this.layout.plotWidth() / hexWidth); // Number of hexagon columns.
        var rows = floor(this.layout.plotHeight() / hexHeight); // Number of hexagon rows.

        // Initialize an array to store counts for each hexbin.
        var hexbinCounts = Array(cols * rows).fill(0);

        // Populate hexbin counts based on data points.
        for (let i = 0; i < xVals.length; i++) {
            let xMapped = map(xVals[i], xMin, xMax, this.layout.leftMargin, this.layout.rightMargin); // Map X values to plot coordinates.
            let yMapped = map(yVals[i], yMin, yMax, this.layout.bottomMargin, this.layout.topMargin); // Map Y values to plot coordinates.

            let col = floor((xMapped - this.layout.leftMargin) / hexWidth); // Determine column index.
            let row = floor((yMapped - this.layout.topMargin) / (hexHeight * 0.75)); // Determine row index.

            // Increment count for the corresponding hexbin.
            if (col >= 0 && col < cols && row >= 0 && row < rows) {
                let index = row * cols + col; // Calculate the index in the array.
                hexbinCounts[index]++;
            }
        }

        let maxCount = max(hexbinCounts); // Find the maximum count for color mapping.

        // Draw each hexbin based on counts.
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x = this.layout.leftMargin + col * hexWidth + (row % 2) * (hexWidth / 2); // Calculate x position of the hexbin.
                let y = this.layout.topMargin + row * (hexHeight * 0.75); // Calculate y position of the hexbin.

                let index = row * cols + col; // Calculate the index in the array.
                let count = hexbinCounts[index]; // Get the count for the hexbin.

                // Set color based on count and draw the hexbin.
                fill(map(count, 0, maxCount, 100, 255), 100, 150, 180);
                stroke(0);
                beginShape();
                for (let i = 0; i < 6; i++) {
                    let angle = TWO_PI / 6 * i; // Calculate angle for each vertex.
                    vertex(x + hexRadius * cos(angle), y + hexRadius * sin(angle)); // Calculate position of each vertex.
                }
                endShape(CLOSE);
            }
        }
    };

    this.drawLegend = function() {
        let legendWidth = 20; // Width of the color bar.
        let legendHeight = 100; // Height of the color bar.
        let legendX = this.layout.rightMargin + 40; // X position of the legend.
        let legendY = this.layout.topMargin + 40; // Y position of the legend.

        // Draw the color bar representing density.
        for (let i = 0; i <= legendHeight; i++) {
            let inter = map(i, 0, legendHeight, 0, 1); // Interpolate a value for color mapping.
            let c = lerpColor(color(100, 100, 150, 180), color(255, 100, 150, 180), inter); // Map to a color.
            stroke(c);
            line(legendX, legendY + i, legendX + legendWidth, legendY + i); // Draw each line of the color bar.
        }

        // Draw the labels for the color bar.
        noStroke();
        fill(0);
        textSize(12);
        textAlign(LEFT, CENTER);
        text("Low", legendX + legendWidth + 10, legendY); // Label for low density.
        text("High", legendX + legendWidth + 10, legendY + legendHeight); // Label for high density.

        // Draw a border around the legend.
        noFill();
        stroke(0);
        rect(legendX, legendY, legendWidth, legendHeight); // Draw the rectangle around the color bar.

        // Label the legend with 'Density'.
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(14);
        text("Density", legendX + legendWidth / 2, legendY - 10); // Position and draw the legend label.
    };

    this.drawPromptMessage = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);
        text("Please select variables to render the hexbin plot.", width / 2, height / 2); // Prompt message for when variables are not selected.
    };

    this.destroy = function() {
        this.variableDropdown1.remove(); // Remove the first dropdown menu.
        this.variableDropdown2.remove(); // Remove the second dropdown menu.
        // Any additional cleanup code can be added here.
    };
}
