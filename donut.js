function MetricDoughnutChart() {
    this.name = 'Mental-Health: Doughnut Chart'; // Chart title
    this.title = 'Mental Health Metric Distribution: Analysis by Academic Year and Age Group'; // Chart title
    this.id = 'metric-doughnut-chart'; // Unique identifier
    this.loaded = false; // Data loaded flag

    // Preload function to load CSV data
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/mentalhealth.csv', 'csv', 'header',
            function(table) {
                self.loaded = true; // Set loaded flag to true when data is loaded
                console.log('Data loaded successfully');
            }
        );
    };

    // Setup function to initialize and draw the charts
    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Display chart title above dropdowns
        textAlign(CENTER);
        textSize(24);
        text(this.title, width / 2, 20); // Draw the chart title

        // Create dropdowns for metric and academic year selection
        this.metricDropdown = createSelect();
        this.metricDropdown.position(1180, 80);
        this.metricDropdown.option('Select Metric'); // Default option
        this.metricDropdown.option('Stress Label');
        this.metricDropdown.option('Depression Label');
        this.metricDropdown.option('Anxiety Label'); // Add as needed

        this.yearDropdown = createSelect();
        this.yearDropdown.position(1180, 110);
        this.yearDropdown.option('Select Year'); // Default option
        const uniqueYears = [...new Set(this.data.getColumn('5. Academic Year'))];
        uniqueYears.forEach(year => this.yearDropdown.option(year));

        // Draw the Doughnut Charts
        this.draw();
    };

    // Draw function to render the Doughnut Charts
    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Clear the canvas
        clear();

        // Draw the chart title again after clearing the canvas
        textAlign(CENTER);
        textSize(24);
        fill(0);
        text(this.title, width / 2, 20);

        // Get selected metric and academic year
        var selectedMetric = this.metricDropdown.value();
        var selectedYear = this.yearDropdown.value();

        // Display a prompt if either metric or academic year is not selected
        if (selectedMetric === 'Select Metric' || selectedYear === 'Select Year') {
            textAlign(CENTER);
            textSize(18);
            fill(0);
            text('Select the Metric and Academic Year to render the chart', width / 2, height / 2);
            return;
        }

        // Define correct age groups
        var ageGroups = ['18-22', '23-26'];

        // Loop through the age groups to draw two doughnut charts side by side
        for (var j = 0; j < ageGroups.length; j++) {
            var ageGroup = ageGroups[j];

            // Filter data based on the selected academic year and age group
            var filteredData = this.data.findRows(selectedYear, '5. Academic Year').filter(row => row.get('1. Age') === ageGroup);

            // Debugging: Check if filtered data exists
            console.log(`Filtered Data for Age Group ${ageGroup}:`, filteredData);

            // Initialize labelCounts object and handle no data scenario
            var labelCounts = {};
            if (filteredData.length === 0) {
                labels = ['No Data'];
                labelCounts = {'No Data': 1};
            } else {
                var labels = filteredData.map(row => row.get(selectedMetric));
                labels.forEach(label => {
                    if (labelCounts[label]) {
                        labelCounts[label]++;
                    } else {
                        labelCounts[label] = 1;
                    }
                });
            }

            // Convert counts to percentages
            var total = Object.values(labelCounts).reduce((sum, count) => sum + count, 0);
            var percentages = [];
            for (var label in labelCounts) {
                percentages.push((labelCounts[label] / total) * 100);
            }

            // Debugging: Log the percentages
            console.log(`Percentages for Age Group ${ageGroup}:`, percentages);

            // Draw the doughnut chart
            var radius = Math.min(width, height) / 4; // Increased size
            var lastAngle = 0;

            var colors = [];
            for (var i = 0; i < percentages.length; i++) {
                var angle = map(percentages[i], 0, 100, 0, TWO_PI);
                var col = j === 0
                    ? color(100 + i * 50, 100 + i * 30, 255) // Original colors for first donut
                    : color(150 + i * 50, 100 + i * 30, 200); // Blue and red pastels for second donut
                fill(col);
                colors.push(col);
                arc(
                    (j === 0 ? width / 4 : (3 * width) / 4),
                    height / 2,
                    radius * 2,
                    radius * 2,
                    lastAngle,
                    lastAngle + angle
                );
                lastAngle += angle;
            }

            // Draw the inner circle
            fill(255);
            ellipse(j === 0 ? width / 4 : (3 * width) / 4, height / 2, radius, radius);

            // Add age group label above each chart
            textAlign(CENTER);
            textSize(16);
            fill(0); // Ensure text is visible
            text(`Age Group: ${ageGroup}`, j === 0 ? width / 4 : (3 * width) / 4, height / 2 - radius - 30);

            // Draw legend for each chart
            textAlign(LEFT);
            textSize(12);
            var legendY = height / 2 + radius + 20;
            Object.keys(labelCounts).forEach((label, index) => {
                fill(colors[index]);
                rect(j === 0 ? 10 : width / 2 + 10, legendY + index * 20, 10, 10);
                fill(0);
                text(`${label}: ${labelCounts[label]} (${percentages[index].toFixed(2)}%)`, j === 0 ? 25 : width / 2 + 25, legendY + index * 20 + 10);
            });
        }
    };

    // Destroy function to remove dropdowns
    this.destroy = function() {
        this.metricDropdown.remove();
        this.yearDropdown.remove();
        clear(); // Clear the canvas
    };
}
