function successRatesHeatmap() {
    this.name = 'Success-Rates: Heatmap'; // Name for the visualization to appear in the menu bar.
    this.id = 'successRatesHeatmap'; // Unique ID with no special characters.
    this.title = 'Success Rates by Institution Type, Year, and Age'; // Title to display above the plot.
    this.xAxisLabel = 'Institution Type'; // Label for the x-axis.
    this.yAxisLabel = 'Age Group'; // Label for the y-axis.

    this.colors = [
        '#4CAF50', '#FFC107', '#FF5722', '#03A9F4', '#E91E63',
        '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4', '#009688',
        '#8BC34A', '#CDDC39'
    ]; // Array of colors to be used for different institution types.

    var marginSize = 35; // Margin size around the plot.

    this.layout = {
        marginSize: marginSize, // Set the margin size.
        leftMargin: marginSize * 2, // Set the left margin.
        rightMargin: width - marginSize * 2 - 70, // Set the right margin.
        topMargin: marginSize * 2, // Set the top margin.
        bottomMargin: height - marginSize * 2 - 50, // Set the bottom margin.
        pad: 5, // Padding around elements.
        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        }, // Calculate plot width based on margins.
        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        }, // Calculate plot height based on margins.
        grid: true, // Enable/disable grid background.
        numXTickLabels: 15, // Number of x-axis tick labels.
        numYTickLabels: 15, // Number of y-axis tick labels.
    };

    this.loaded = false; // Property to represent whether data has been loaded.

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/successrates.csv', 'csv', 'header', // Path to the CSV file with headers.
            function(table) {
                self.loaded = true; // Callback function to set 'loaded' to true after data is loaded.
            });
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log if data has not been loaded yet.
            return;
        }

        textSize(10); // Set default text size for the visualization.

        // Get unique institution types and age groups from the data.
        this.institutionTypes = [...new Set(this.data.getColumn('Institution_Type'))];
        this.ageGroups = [...new Set(this.data.getColumn('Age'))];
        this.successRates = this.data.getColumn('Overall_Success_Rate_%').map(Number); // Convert success rates to numbers.

        this.matrix = this.createMatrix(); // Create a matrix to store success rates.
    };

    this.destroy = function() {}; // Empty destroy function for cleanup if needed.

    this.createMatrix = function() {
        let matrix = {}; // Initialize an empty matrix.
        for (let i = 0; i < this.data.getRowCount(); i++) {
            let institutionType = this.data.getString(i, 'Institution_Type'); // Get institution type for the current row.
            let ageGroup = this.data.getString(i, 'Age'); // Get age group for the current row.
            let successRate = Number(this.data.getString(i, 'Overall_Success_Rate_%')); // Get success rate for the current row.

            if (!matrix[institutionType]) {
                matrix[institutionType] = {}; // Initialize an object for the institution type if it doesn't exist.
            }

            matrix[institutionType][ageGroup] = successRate; // Store the success rate in the matrix.
        }
        return matrix; // Return the completed matrix.
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log if data has not been loaded yet.
            return;
        }

        this.drawTitle(); // Draw the title of the visualization.

        let cols = this.institutionTypes.length; // Number of institution types (columns).
        let rows = this.ageGroups.length; // Number of age groups (rows).

        let cellWidth = this.layout.plotWidth() / cols; // Calculate cell width based on the number of columns.
        let cellHeight = this.layout.plotHeight() / rows; // Calculate cell height based on the number of rows.

        let maxValue = Math.max(...this.successRates); // Find the maximum success rate.

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                let institutionType = this.institutionTypes[col]; // Get the institution type for the current column.
                let ageGroup = this.ageGroups[row]; // Get the age group for the current row.
                let rate = this.matrix[institutionType][ageGroup] || 0; // Get the success rate from the matrix, or 0 if not found.

                let colorIndex = map(rate, 0, maxValue, 0, 1); // Map the success rate to a value between 0 and 1.

                fill(lerpColor(color(255), color(this.colors[col % this.colors.length]), colorIndex)); // Interpolate color based on success rate.
                rect(this.layout.leftMargin + col * cellWidth, this.layout.topMargin + row * cellHeight, cellWidth, cellHeight); // Draw the rectangle for the current cell.

                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(10);
                text(rate.toFixed(1), this.layout.leftMargin + col * cellWidth + cellWidth / 2, this.layout.topMargin + row * cellHeight + cellHeight / 2); // Display the success rate inside the cell.
            }
        }

        for (let i = 0; i < this.institutionTypes.length; i++) {
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(10);
            text(this.institutionTypes[i], this.layout.leftMargin + i * cellWidth + cellWidth / 2, this.layout.bottomMargin + this.layout.marginSize / 2); // Display the institution type below the plot.
        }

        for (let i = 0; i < this.ageGroups.length; i++) {
            fill(0);
            noStroke();
            textAlign(RIGHT, CENTER);
            textSize(10);
            text(this.ageGroups[i], this.layout.leftMargin - this.layout.pad, this.layout.topMargin + i * cellHeight + cellHeight / 2); // Display the age group to the left of the plot.
        }

        this.drawXAxisLabel(); // Draw the x-axis label.
        this.drawYAxisLabel(); // Draw the y-axis label.

        // Draw multiple horizontal gradient legends, one for each color.
        let legendWidth = 100;  // Set the width of the gradient legend.
        let legendX = this.layout.rightMargin + 20; // Set the x position of the legend.
        let legendYStart = this.layout.topMargin + 20;  // Set the starting y position of the first legend.
        let legendSpacing = 30;  // Set the space between each legend.

        for (let i = 0; i < this.colors.length - 5; i++) {
            let legendY = legendYStart + i * legendSpacing; // Calculate the y position for the current legend.

            for (let j = 0; j <= legendWidth; j++) {
                let inter = map(j, 0, legendWidth, 0, 1); // Interpolate a value between 0 and 1 for the gradient.
                let col = lerpColor(color(255), color(this.colors[i]), inter); // Interpolate the color for the current position.
                fill(col);
                rect(legendX + j, legendY, 1, 20); // Draw the gradient rectangle.
            }

            fill(0);
            textAlign(LEFT, CENTER);
            textSize(10);
            text('Low', legendX - 10, legendY + 10); // Display the 'Low' label on the left side of the legend.
            text('High', legendX + legendWidth , legendY + 10); // Display the 'High' label on the right side of the legend.
        }

        textAlign(CENTER, CENTER);
        textSize(12);
        text('Success Rate', legendX + legendWidth / 2, legendYStart - 20); // Display the 'Success Rate' label above the legends.
    };

    this.drawXAxisLabel = function() {
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);

        text(this.xAxisLabel,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.bottomMargin + (this.layout.marginSize / 1.5) + 50); // Position and draw the x-axis label.
    };

    this.drawYAxisLabel = function() {
        push();
        translate(this.layout.leftMargin - (this.layout.marginSize * 1.5),
            (this.layout.plotHeight() / 2) + this.layout.topMargin);
        rotate(-PI / 2); // Rotate the text for the y-axis label.
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);

        text(this.yAxisLabel, 0, 0); // Position and draw the y-axis label.
        pop();
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);

        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2) - 30); // Position and draw the title of the visualization.
    };

    this.drawXAxisLabel = function() {
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);

        text(this.xAxisLabel,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.bottomMargin + (this.layout.marginSize / 1.5) + 50); // Position and draw the x-axis label (duplicate function).
    };

    this.drawYAxisLabel = function() {
        push();
        translate(this.layout.leftMargin - (this.layout.marginSize * 1.5),
            (this.layout.plotHeight() / 2) + this.layout.topMargin);
        rotate(-PI / 2); // Rotate the text for the y-axis label (duplicate function).
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);

        text(this.yAxisLabel, 0, 0); // Position and draw the y-axis label.
        pop();
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);

        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2) - 30); // Position and draw the title of the visualization (duplicate function).
    };
}
