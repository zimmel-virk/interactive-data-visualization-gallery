function FacetGrid2() {
    this.name = 'Heart-Attack: Facet Grid'; // Name for the visualisation to appear in the menu bar.
    this.id = 'facet-grid2'; // Unique ID with no special characters.
    this.title = 'Facet Grid of Blood Pressure and Cholesterol by Smoking Status'; // Title to display above the plot.

    this.layout = {
        marginSize: 35, // Margin size around the plot.
        leftMargin: 100, // Left margin for the plot.
        rightMargin: width - 100, // Right margin for the plot.
        topMargin: 130, // Top margin for the plot.
        bottomMargin: height - 50, // Bottom margin for the plot.
        plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate plot width based on margins.
        plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate plot height based on margins.
    };

    this.loaded = false; // Property to represent whether data has been loaded.
    this.selectedVariable = 'Blood Pressure (mmHg)'; // Default variable for the visualization.

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/heartattack.csv', // Path to the CSV file.
            'csv', 'header', // File type and presence of header row.
            function(table) {
                self.loaded = true; // Callback function to set 'loaded' to true after data is loaded.
                console.log('Data loaded successfully:', self.data.getRowCount(), 'rows'); // Log the number of rows loaded.
            }
        );
    };

    this.setup = function() {
        textSize(16); // Set default text size for the visualization.

        // Create the dropdown menu with only the correct options.
        this.variableDropdown = createSelect();
        this.variableDropdown.position(this.layout.leftMargin + 880, this.layout.topMargin - 50); // Position the dropdown.
        this.variableDropdown.option('Blood Pressure (mmHg)'); // Add option for Blood Pressure.
        this.variableDropdown.option('Cholesterol (mg/dL)'); // Add option for Cholesterol.

        // Set the default selected variable.
        this.selectedVariable = 'Blood Pressure (mmHg)';

        // When the dropdown selection changes, update the selected variable and redraw the visualization.
        this.variableDropdown.changed(() => {
            this.selectedVariable = this.variableDropdown.value(); // Update the selected variable.
            this.draw(); // Redraw the visualization with the new variable.
        });
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log if data has not been loaded yet.
            return;
        }

        clear(); // Clear the previous drawings.
        this.drawTitle(); // Draw the title of the visualization.
        this.drawLegend(); // Draw the legend for the smoking status categories.
        this.drawFacetGrid(this.selectedVariable, 'Gender', 'Smoking Status'); // Draw the facet grid based on the selected variable.
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(25); // Set text size for the title.
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 80); // Position the title.
    };

    this.getYAxisRange = function(variable) {
        // Calculate the maximum value in the data for the selected variable.
        var values = this.data.getColumn(variable).map(v => parseFloat(v)).filter(v => !isNaN(v)); // Get numeric values and filter out NaN.
        var maxDataValue = max(values); // Find the maximum value.
        var minVal = 0; // Minimum value for the Y-axis.
        var maxVal = maxDataValue * 1.1; // Add 10% margin above the maximum data value.

        return { minVal, maxVal }; // Return the calculated Y-axis range.
    };

    this.drawYAxis = function(variable, x, y, gridHeight, showLabel) {
        var range = this.getYAxisRange(variable); // Get the range for the Y-axis.
        var minVal = range.minVal; // Minimum value on the Y-axis.
        var maxVal = range.maxVal; // Maximum value on the Y-axis.
        var numTicks = 5; // Number of ticks on the Y-axis.

        console.log(`Y-Axis for ${variable} (Numeric): minVal = ${minVal}, maxVal = ${maxVal}`); // Log the Y-axis range.

        for (var i = 0; i <= numTicks; i++) {
            var yTick = map(i, 0, numTicks, y + gridHeight, y + 30); // Calculate the Y position for each tick.
            var tickValue = map(i, 0, numTicks, minVal, maxVal).toFixed(0); // Calculate the value for each tick.

            stroke(0);
            line(x - 10, yTick, x, yTick); // Draw the tick mark.

            noStroke();
            fill(0);
            textAlign(RIGHT, CENTER);
            textSize(12);
            text(tickValue, x - 15, yTick); // Draw the tick label.
        }

        // Add Y-axis label (only once).
        if (showLabel) {
            push();
            textAlign(CENTER);
            textSize(14);
            translate(x - 50, y + gridHeight / 2 + 80); // Position the Y-axis label.
            rotate(-PI / 2); // Rotate the Y-axis label.
            text(variable, 0, 0); // Draw the Y-axis label.
            pop();
        }
    };

    this.getColorForCategory = function(smokingStatus) {
        if (smokingStatus === 'Never') {
            return color(100, 150, 255, 180); // Blue for Never smokers.
        } else if (smokingStatus === 'Current') {
            return color(255, 100, 100, 180); // Red for Current smokers.
        } else if (smokingStatus === 'Former') {
            return color(100, 255, 100, 180); // Green for Former smokers.
        }
        return color(200, 200, 200, 180); // Default color.
    };

    this.drawFacetGrid = function(variable, rowCategory, colCategory) {
        var rowCategories = [...new Set(this.data.getColumn(rowCategory))]; // Get unique categories for the row variable (Gender).
        var colCategories = [...new Set(this.data.getColumn(colCategory))]; // Get unique categories for the column variable (Smoking Status).

        var gridHeight = this.layout.plotHeight() / rowCategories.length; // Calculate grid height based on the number of row categories.
        var gridWidth = this.layout.plotWidth() / colCategories.length; // Calculate grid width based on the number of column categories.

        console.log(`Drawing Facet Grid for ${variable}`); // Log the selected variable for the facet grid.

        rowCategories.forEach((rowCat, rowIndex) => {
            colCategories.forEach((colCat, colIndex) => {
                var x = this.layout.leftMargin + colIndex * gridWidth; // Calculate x position for each grid.
                var y = this.layout.topMargin + rowIndex * gridHeight; // Calculate y position for each grid.

                var filteredData = this.data.getRows().filter(row => row.get(rowCategory) === rowCat && row.get(colCategory) === colCat); // Filter data for the current grid.
                var values = filteredData.map(row => parseFloat(row.get(variable))).filter(v => !isNaN(v)); // Get numeric values and filter out NaN.
                var smokingStatus = filteredData.length > 0 ? filteredData[0].get(colCategory) : ''; // Get smoking status.

                console.log(`Facet (${rowCat} - ${colCat}): ${values.length} data points`); // Log the number of data points for the current facet.

                if (values.length === 0) {
                    console.log(`No valid data points for ${rowCat} - ${colCat}`); // Log if no valid data points are found.
                    return; // Prevent drawing if there are no valid data points.
                }

                var range = this.getYAxisRange(variable); // Get the range for the Y-axis.
                var minVal = range.minVal; // Minimum value on the Y-axis.
                var maxVal = range.maxVal; // Maximum value on the Y-axis.
                console.log(`Numeric Range for ${rowCat} - ${colCat}: minVal = ${minVal}, maxVal = ${maxVal}`); // Log the Y-axis range for the current facet.

                var barWidth = (gridWidth / values.length) * 0.8; // Adjusted width for better spacing.
                var barSpacing = (gridWidth - barWidth * values.length) / (values.length + 1); // Spacing between bars.

                values.forEach((value, i) => {
                    var barHeight = map(value, minVal, maxVal, 0, gridHeight * 0.7); // Calculate the height of each bar based on the value.
                    var barX = x + (i + 1) * barSpacing + i * barWidth;  // Adjusted for better spacing.
                    var barY = y + gridHeight - barHeight; // Calculate the y position for each bar.

                    console.log(`Drawing bar: value = ${value}, barHeight = ${barHeight}, barX = ${barX}, barY = ${barY}`); // Log the details for the bar being drawn.

                    fill(this.getColorForCategory(smokingStatus));  // Color based on smoking status.
                    stroke(0);  // Adding border around bars.
                    rect(barX, barY, barWidth, barHeight); // Draw the bar.
                });

                // Draw Y-axis on the left for each row (Male and Female), label only once.
                if (colIndex === 0) {
                    this.drawYAxis(variable, x, y, gridHeight, rowIndex === 0); // Draw the Y-axis.
                }

                fill(0);
                noStroke();
                textAlign(CENTER);
                textSize(14);
                text(rowCat + ' - ' + colCat, x + gridWidth / 2, y + gridHeight + 40); // Adjusted facet title placement below the bars.
            });
        });
    };

    this.drawLegend = function() {
        var legendX = this.layout.leftMargin + 120; // Position the legend on the left margin.
        var legendY = this.layout.topMargin - 50; // Position above the plot.

        var categories = ['Never Smoked', 'Current Smoker', 'Former Smoker']; // Categories for Smoking Status.

        fill(0);
        noStroke();
        textAlign(LEFT);
        textSize(14);

        categories.forEach((category, i) => {
            // Use category names to get corresponding colors.
            let colorName;
            if (category === 'Never Smoked') colorName = 'Never';
            if (category === 'Current Smoker') colorName = 'Current';
            if (category === 'Former Smoker') colorName = 'Former';

            fill(this.getColorForCategory(colorName)); // Get color for the category.
            rect(legendX + i * 120, legendY, 15, 15); // Draw the color box for each category.

            fill(0);
            textSize(12);
            text(category, legendX + 20 + i * 120, legendY + 12); // Label each color box with the category name.
        });
    };

    this.destroy = function() {
        // Any cleanup code goes here.
        this.variableDropdown.remove(); // Remove the dropdown menu when the visualization is destroyed.
    };
}
