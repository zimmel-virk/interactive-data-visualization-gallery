function FacetGrid() {
    this.name = 'Heart-Attack: Facet Grid'; // Name for the visualisation to appear in the menu bar.
    this.id = 'facet-grid'; // Unique ID with no special characters.
    this.title = 'Comparative Facet Grid: Diabetes and Chest Pain Across Smoking Status and Gender'; // Title to display above the plot.

    this.layout = {
        marginSize: 35, // Margin size around the plot.
        leftMargin: 100, // Left margin for the plot.
        rightMargin: width - 100, // Right margin for the plot.
        topMargin: 50, // Top margin for the plot.
        bottomMargin: height - 50, // Bottom margin for the plot.
        plotWidth: function() { return this.rightMargin - this.leftMargin; }, // Calculate plot width based on margins.
        plotHeight: function() { return this.bottomMargin - this.topMargin; } // Calculate plot height based on margins.
    };

    this.loaded = false; // Property to represent whether data has been loaded.
    this.selectedVariable = 'Chest Pain Type'; // Default variable for the visualization.

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

        // Create the dropdown menu with only the desired options.
        this.variableDropdown = createSelect();
        this.variableDropdown.position(this.layout.leftMargin + 800, this.layout.topMargin + 20); // Position the dropdown.
        this.variableDropdown.option('Chest Pain Type'); // Add option for Chest Pain Type.
        this.variableDropdown.option('Has Diabetes'); // Add option for Has Diabetes.

        // Set the default selected variable.
        this.selectedVariable = 'Chest Pain Type';

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
        this.drawYAxis(this.selectedVariable); // Draw the Y-axis for the selected variable.
        this.drawFacetGrid(this.selectedVariable, 'Gender', 'Smoking Status'); // Draw the facet grid.

        // Draw the legend if the selected variable is categorical (Has Diabetes or Chest Pain Type).
        if (this.selectedVariable === 'Has Diabetes' || this.selectedVariable === 'Chest Pain Type') {
            this.drawLegend(); // Draw the legend for the categorical variable.
        }
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(25); // Set text size for the title.
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 10); // Position the title.
    };

    this.drawYAxis = function(variable) {
        // Always treat these variables as categorical since we've removed the numeric options.
        console.log(`Y-Axis for ${variable} (Categorical)`); // Log the selected variable for the Y-axis.
        // Add a label for categorical variables.
        push();
        textAlign(CENTER);
        textSize(14);
        translate(this.layout.leftMargin - 50, (this.layout.topMargin + this.layout.bottomMargin) / 2); // Position the Y-axis label.
        rotate(-PI / 2); // Rotate the Y-axis label.
        text(variable, 0, 0); // Draw the Y-axis label.
        pop();
    };

    this.drawFacetGrid = function(variable, rowCategory, colCategory) {
        var smokingStatuses = ['Former', 'Current', 'Never']; // Categories for Smoking Status.
        var rowCategories = [...new Set(this.data.getColumn(rowCategory))]; // Unique categories for the row variable (Gender).
        var colCategories = [...new Set(this.data.getColumn(colCategory))]; // Unique categories for the column variable (Smoking Status).

        // Increase the grid width to make grids wider.
        var gridHeight = this.layout.plotHeight() / rowCategories.length; // Calculate grid height based on the number of row categories.
        var gridWidth = this.layout.plotWidth() / (colCategories.length * smokingStatuses.length) * 1.5; // Increase width by 1.5 times.

        console.log(`Drawing Facet Grid for ${variable}`); // Log the selected variable for the facet grid.

        rowCategories.forEach((rowCat, rowIndex) => {
            // Add a label indicating whether the row represents "Male" or "Female".
            fill(0);
            noStroke();
            textAlign(RIGHT, CENTER);
            textSize(16);
            text(rowCat, this.layout.leftMargin + 40, this.layout.topMargin + rowIndex * gridHeight + gridHeight / 2 + 50); // Position the row label.

            smokingStatuses.forEach((smokingStatus, smokingIndex) => {
                colCategories.forEach((colCat, colIndex) => {
                    var x = this.layout.leftMargin + (smokingIndex * colCategories.length + colIndex) * gridWidth - 200; // Calculate x position for each grid.
                    var y = this.layout.topMargin + rowIndex * gridHeight; // Calculate y position for each grid.

                    var filteredData = this.data.getRows().filter(row => row.get(rowCategory) === rowCat && row.get(colCategory) === colCat && row.get('Smoking Status') === smokingStatus); // Filter data for the current grid.
                    var counts = {}; // Initialize an object to store the counts for each category.

                    filteredData.forEach(row => {
                        var value = row.get(variable); // Get the value for the selected variable.
                        counts[value] = (counts[value] || 0) + 1; // Increment the count for the value.
                    });

                    if (Object.keys(counts).length === 0) {
                        console.log(`No valid data points for ${rowCat} - ${colCat} (${smokingStatus})`); // Log if no valid data points are found.
                        return; // Prevent drawing if there are no valid data points.
                    }

                    var maxCount = max(Object.values(counts)); // Get the maximum count for scaling the bars.
                    console.log(`Categorical Counts for ${rowCat} - ${colCat} (${smokingStatus}):`, counts); // Log the counts for the current grid.

                    Object.keys(counts).forEach((key, i) => {
                        var barWidth = gridWidth / Object.keys(counts).length * 0.7; // Calculate the width of each bar.
                        var barHeight = (counts[key] / maxCount) * (gridHeight * 0.7); // Calculate the height of each bar based on the count.
                        var barX = x + i * (gridWidth / Object.keys(counts).length) + (gridWidth * 0.15);  // Adjusted for better spacing.
                        var barY = y + gridHeight - barHeight; // Calculate the y position for each bar.

                        console.log(`Drawing categorical bar: category = ${key}, barHeight = ${barHeight}, barX = ${barX}, barY = ${barY}`); // Log the details for the bar being drawn.

                        fill(color(map(i, 0, Object.keys(counts).length, 100, 255), 100, 150, 180));  // Adding transparency and gradient to the bar color.
                        noStroke();  // Remove border around bars.
                        rect(barX, barY, barWidth, barHeight); // Draw the bar.

                        // Add the number of people as a label on each bar.
                        fill(0);
                        noStroke();
                        textAlign(CENTER, CENTER);
                        textSize(12);
                        text(counts[key], barX + barWidth / 2, barY - 5); // Place the label above each bar.
                    });

                    // Removed grid lines to outline the grids.

                    // Add a title indicating the smoking status.
                    fill(0);
                    noStroke();
                    textAlign(CENTER, CENTER);
                    textSize(14);
                    text(smokingStatus, x + gridWidth / 2, y + 270); // Adjusted title placement above the grid.
                });
            });
        });
    };

    this.drawLegend = function() {
        var legendX = this.layout.leftMargin; // Position the legend on the left margin.
        var legendY = this.layout.topMargin + 30; // Position the legend above the grid.
        var variableCategories = [...new Set(this.data.getColumn(this.selectedVariable))]; // Get the unique categories for the selected variable.

        fill(0);
        noStroke();
        textAlign(LEFT);
        textSize(14);

        variableCategories.forEach((category, i) => {
            fill(color(map(i, 0, variableCategories.length, 100, 255), 100, 150, 180));  // Adding transparency to legend colors.
            rect(legendX + 60 + i * 115, legendY - 10, 15, 15); // Draw the color box for each category.

            fill(0);
            textSize(12);
            text(category, legendX + 80 + i * 115, legendY + 1); // Label each color box with the category name.
        });
    };

    this.destroy = function() {
        // Any cleanup code goes here.
        this.variableDropdown.remove(); // Remove the dropdown menu when the visualization is destroyed.
    };
}
s