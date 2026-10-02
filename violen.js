function MentalHealthViolinPlot() {
    this.name = 'Mental-Health: Violin Plot'; // Chart name for the menu
    this.title = 'Mental Health Matrix: Age and Gender Analysis Across Institutions'; // Title to display on the chart
    this.id = 'mental-health-violin-plot'; // Unique identifier for the chart
    this.loaded = false; // Flag to check if data has been loaded
    this.pad = 100; // Padding for the axes and chart elements

    // Preload function to load CSV data before the chart is drawn
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/mentalhealth.csv', // Path to the CSV file
            'csv', 'header', // File format and header specification
            function(table) {
                self.loaded = true; // Set loaded flag to true when data is loaded successfully
                console.log('Data loaded successfully');
            }
        );
    };

    // Setup function to initialize and draw the chart
    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log message if data is not loaded
            return;
        }

        // Create dropdown menus for Institution and Metric selection
        this.createDropdowns();

        // Initially, only draw the title, and wait for metric selection to draw the plot
        this.drawTitle();
    };

    // Function to create dropdown menus for user selection
    this.createDropdowns = function() {
        var self = this;

        // Dropdown for selecting Institution
        this.institutionDropdown = createSelect();
        this.institutionDropdown.position(450, 60); // Position of the dropdown on the canvas
        this.institutionDropdown.option('All Institutions'); // Default option for all institutions
        var institutions = this.data.getColumn('3. University').filter((v, i, a) => a.indexOf(v) === i); // Unique institutions
        institutions.forEach(inst => this.institutionDropdown.option(inst)); // Populate dropdown with institutions

        // Dropdown for selecting Metric
        this.metricDropdown = createSelect();
        this.metricDropdown.position(850, 60); // Position of the dropdown on the canvas
        this.metricDropdown.option('Select Metric'); // Default placeholder option
        this.metricDropdown.option('Stress Value'); // Option for selecting Stress Value
        this.metricDropdown.option('Anxiety Value'); // Option for selecting Anxiety Value
        this.metricDropdown.option('Depression Value'); // Option for selecting Depression Value

        // Event listeners to redraw chart when a dropdown selection is changed
        this.institutionDropdown.changed(() => self.draw());
        this.metricDropdown.changed(() => self.draw());
    };

    // Draw function to render the Violin Plot
    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded'); // Log message if data is not loaded
            return;
        }

        // Clear the canvas before drawing
        clear();

        // Draw the title first
        this.drawTitle();

        // Get the selected metric from the dropdown
        var selectedMetric = this.metricDropdown.value();

        // Display a message if the default metric ("Select Metric") is selected
        if (selectedMetric === 'Select Metric') {
            console.log('No metric selected, not drawing the chart');
            this.drawNoMetricMessage(); // Display message prompting user to select a metric
            return;
        }

        // Get the selected institution from the dropdown
        var selectedInstitution = this.institutionDropdown.value();

        // Extract relevant columns from the data
        var age = this.data.getColumn('1. Age');
        var gender = this.data.getColumn('2. Gender');
        var metricValue = this.data.getColumn(selectedMetric);

        // Filter data based on the selected institution
        if (selectedInstitution !== 'All Institutions') {
            var filteredData = this.data.findRows(selectedInstitution, '3. University');
            age = filteredData.map(row => row.get('1. Age')); // Filtered age data
            gender = filteredData.map(row => row.get('2. Gender')); // Filtered gender data
            metricValue = filteredData.map(row => row.get(selectedMetric)); // Filtered metric data
        }

        // Convert metric values to numbers and group data by age and gender
        metricValue = stringsToNumbers(metricValue);
        var ageGenderGroups = this.groupByAgeGender(age, gender, metricValue);

        // Draw the axes based on the age categories and selected metric
        this.drawAxes(Object.keys(ageGenderGroups), selectedMetric);

        // Draw the violin plots for each age group and gender
        var ageCategories = Object.keys(ageGenderGroups);
        for (var i = 0; i < ageCategories.length; i++) {
            if (ageGenderGroups[ageCategories[i]]['Male'].length > 0) {
                this.drawViolin(ageGenderGroups[ageCategories[i]]['Male'], ageCategories[i], i + 1, color(0, 100, 255, 100)); // Blue color for Male
            }
            if (ageGenderGroups[ageCategories[i]]['Female'].length > 0) {
                this.drawViolin(ageGenderGroups[ageCategories[i]]['Female'], ageCategories[i], i + 1, color(255, 100, 100, 100), true); // Red color for Female
            }
        }

        // Draw the legend for the chart
        this.drawLegend();
    };

    // Helper function to draw the title above the chart
    this.drawTitle = function() {
        textAlign(CENTER); // Center align the text
        textSize(24); // Set text size for the title
        fill(0); // Set text color to black
        text(this.title, width / 2, this.pad - 70); // Position the title on the canvas
    };

    // Helper function to display a message when no metric is selected
    this.drawNoMetricMessage = function() {
        textAlign(CENTER); // Center align the text
        textSize(20); // Set text size for the message
        fill(0); // Set text color to black
        text("Select a metric to render the graph", width / 2, height / 2); // Position the message in the middle of the canvas
    };

    // Helper function to draw axes and labels
    this.drawAxes = function(ageCategories, selectedMetric) {
        // Y-axis
        stroke(0); // Set stroke color to black
        line(this.pad, this.pad, this.pad, height - this.pad); // Draw the Y-axis line
        // X-axis
        line(this.pad, height - this.pad, width - this.pad, height - this.pad); // Draw the X-axis line

        // Y-axis labels
        textAlign(RIGHT); // Align text to the right
        textSize(12); // Set text size for labels
        fill(0); // Set text color to black
        for (let i = 0; i <= 40; i += 5) { // Assuming the values range between 0 and 40
            let y = map(i, 0, 40, height - this.pad, this.pad); // Map the values to the Y-axis
            text(i, this.pad - 10, y); // Draw the Y-axis labels
        }

        // X-axis labels (Age categories)
        textAlign(CENTER); // Center align the text
        textSize(12); // Set text size for labels
        fill(0); // Set text color to black
        for (var i = 0; i < ageCategories.length; i++) {
            text(ageCategories[i], (i + 1) * (width / (ageCategories.length + 1)), height - this.pad + 30); // Draw the X-axis labels for age categories
        }

        // X-axis label
        textAlign(CENTER); // Center align the text
        textSize(14); // Set text size for the X-axis label
        text('AGE GROUP', width / 2, height - this.pad + 60); // Draw the X-axis label

        // Y-axis label
        textAlign(CENTER); // Center align the text
        textSize(14); // Set text size for the Y-axis label
        push(); // Push current drawing settings to the stack
        translate(this.pad - 50, height / 2); // Translate to the position for the Y-axis label
        rotate(-PI / 2); // Rotate the text to display vertically
        text(selectedMetric.replace(' Value', ''), 0, 0); // Dynamically update Y-axis label based on the selected metric
        pop(); // Pop the current drawing settings from the stack
    };

    // Helper function to draw a violin plot for each age group and gender with a specified color
    this.drawViolin = function(values, label, index, fillColor, offset = false) {
        var xCenter = (index) * (width / (Object.keys(this.groupByAgeGender(this.data.getColumn('1. Age'), this.data.getColumn('2. Gender'), this.data.getColumn('Depression Value'))).length + 1)); // Calculate the X position for the violin plot
        if (offset) xCenter += 20; // Offset for overlapping male and female violins
        var yBase = height - this.pad; // Base Y position for the violin plot
        var yScale = (height - 2 * this.pad) / 40; // Scale for Y values to fit the plot area

        // Calculate KDE (Kernel Density Estimation) for a smoother violin plot
        var kde = this.kernelDensityEstimation(values);

        stroke(0); // Set stroke color to black
        fill(fillColor); // Set fill color to the specified color
        beginShape(); // Start drawing the shape

        // Draw the left side of the violin plot
        for (var i = 0; i < kde.length; i++) {
            var y = yBase - kde[i].x * yScale; // Calculate the Y position based on KDE values
            var xOffset = kde[i].y * 75; // Adjusted width for better overlap
            vertex(xCenter - xOffset, y); // Draw the vertex on the left side
        }

        // Draw the right side of the violin plot
        for (var i = kde.length - 1; i >= 0; i--) {
            var y = yBase - kde[i].x * yScale; // Calculate the Y position based on KDE values
            var xOffset = kde[i].y * 75; // Adjusted width for better overlap
            vertex(xCenter + xOffset, y); // Draw the vertex on the right side
        }

        endShape(CLOSE); // Close the shape to complete the violin plot
    };

    // KDE function for a smoother violin plot
    this.kernelDensityEstimation = function(values) {
        var kernel = (v) => Math.exp(-0.5 * v * v) / Math.sqrt(2 * Math.PI); // Gaussian kernel function
        var domain = Array.from(new Array(100), (x, i) => i / 100 * Math.max(...values)); // Create a domain for KDE
        var kde = [];

        for (var x of domain) {
            var sum = 0;
            for (var value of values) {
                sum += kernel((x - value) / 1); // Bandwidth of 1 for smoothing
            }
            kde.push({ x: x, y: sum / (values.length * 1) }); // Store the KDE result for each domain point
        }

        return kde; // Return the calculated KDE values
    };

    // Helper function to group data by age categories and gender
    this.groupByAgeGender = function(ageArray, genderArray, valueArray) {
        // Only include the age groups that are present in the CSV: 18-22 and 23-26
        var ageGenderGroups = {
            '18-22': { 'Male': [], 'Female': [] }, // Group for ages 18-22
            '23-26': { 'Male': [], 'Female': [] }  // Group for ages 23-26
        };

        for (var i = 0; i < ageArray.length; i++) {
            var age = parseInt(ageArray[i]); // Parse age as an integer
            var gender = genderArray[i].trim().toLowerCase(); // Clean and normalize gender data

            // Map cleaned gender to proper case for accessing the groups
            if (gender === 'male') gender = 'Male';
            else if (gender === 'female') gender = 'Female';

            // Ensure gender is valid and age falls into the correct category before accessing
            if (gender === 'Male' || gender === 'Female') {
                if (age >= 18 && age <= 22) {
                    ageGenderGroups['18-22'][gender].push(valueArray[i]); // Add value to the corresponding group
                } else if (age >= 23 && age <= 26) {
                    ageGenderGroups['23-26'][gender].push(valueArray[i]); // Add value to the corresponding group
                }
            } else {
                // Debugging: Log cases where gender doesn't match expected values
                console.warn(`Unexpected gender value encountered: ${gender} for age ${age}`);
            }
        }

        return ageGenderGroups; // Return the grouped data
    };

    // Helper function to draw the legend for the chart
    this.drawLegend = function() {
        textSize(12); // Set text size for the legend
        fill(0); // Set text color to black
        textAlign(LEFT); // Align text to the left

        // Legend position
        var x = width - this.pad - 100; // X position for the legend
        var y = this.pad ; // Y position for the legend

        // Draw legend for Male
        fill(0, 100, 255, 100); // Blue color for Male
        rect(x, y, 20, 20); // Draw the color box for Male
        fill(0);
        text('Male', x + 30, y + 15); // Label for Male

        // Draw legend for Female
        fill(255, 100, 100, 100); // Red color for Female
        rect(x, y + 30, 20, 20); // Draw the color box for Female
        fill(0);
        text('Female', x + 30, y + 45); // Label for Female
    };

    // Function to destroy dropdowns when the plot is closed
    this.destroy = function() {
        if (this.institutionDropdown) {
            this.institutionDropdown.remove(); // Remove the institution dropdown from the DOM
            this.institutionDropdown = null;  // Set reference to null to avoid memory leaks
        }

        if (this.metricDropdown) {
            this.metricDropdown.remove(); // Remove the metric dropdown from the DOM
            this.metricDropdown = null;  // Set reference to null to avoid memory leaks
        }
    };
}
