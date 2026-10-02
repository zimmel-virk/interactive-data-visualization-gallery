function PairwiseDensityPlot() {
    this.name = 'Stress: Pairwise Density Plot';
    this.id = 'pairwise-density-plot';
    this.title = 'Pairwise Density Plot: Visualizing Stress Data Relationships';

    var marginSize = 35;

    this.layout = {
        marginSize: marginSize,
        leftMargin: marginSize * 2 + 180,
        rightMargin: width - marginSize - 150,
        topMargin: marginSize + 100,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        plotWidth: function() { return this.rightMargin - this.leftMargin; },
        plotHeight: function() { return this.bottomMargin - this.topMargin; }
    };

    this.loaded = false;

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/stress.csv',
            'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log('Data loaded successfully:', self.data.getRowCount(), 'rows');
            }
        );
    };

    this.setup = function() {
        textSize(16);

        // Create dropdown menus for pairwise comparison
        this.variableDropdown1 = createSelect();
        this.variableDropdown1.position(this.layout.leftMargin + 80 , this.layout.topMargin - 90);
        this.variableDropdown1.option('Select Variable');
        this.variableDropdown2 = createSelect();
        this.variableDropdown2.position(this.layout.leftMargin + 80, this.layout.topMargin - 60);
        this.variableDropdown2.option('Select Variable');

        // Populate dropdowns with column names
        this.data.columns.forEach(column => {
            this.variableDropdown1.option(column);
            this.variableDropdown2.option(column);
        });

        // Set default selected variables to null
        this.selectedVariable1 = null;
        this.selectedVariable2 = null;

        // Array to store colors
        this.pointColors = [];

        // Update variables and redraw on change
        this.variableDropdown1.changed(() => {
            this.selectedVariable1 = this.variableDropdown1.value() === 'Select Variable' ? null : this.variableDropdown1.value();
            this.generateColors(); // Regenerate colors when variables change
            this.draw();
        });
        this.variableDropdown2.changed(() => {
            this.selectedVariable2 = this.variableDropdown2.value() === 'Select Variable' ? null : this.variableDropdown2.value();
            this.generateColors(); // Regenerate colors when variables change
            this.draw();
        });
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        clear(); // Clear the canvas before drawing
        this.drawTitle();

        if (this.selectedVariable1 && this.selectedVariable2) {
            this.drawAxes();
            this.drawDensityPlot();
        } else {
            this.drawPromptMessage();
        }
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(25);
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin - 40, this.layout.topMargin - (this.layout.marginSize / 2) - 100);
    };

    this.drawAxes = function() {
        stroke(0);
        strokeWeight(1);

        // X-axis
        line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.rightMargin, this.layout.bottomMargin);

        // Y-axis
        line(this.layout.leftMargin, this.layout.topMargin, this.layout.leftMargin, this.layout.bottomMargin);

        // Draw X-axis ticks and labels based on selected variable range
        let xVals = this.data.getColumn(this.selectedVariable1).map(n => parseFloat(n));
        let xMin = min(xVals);
        let xMax = max(xVals);
        let xTicks = 5;  // Number of ticks on the x-axis
        for (let i = 0; i <= xTicks; i++) {
            let xPos = map(i, 0, xTicks, this.layout.leftMargin, this.layout.rightMargin);
            let xVal = map(i, 0, xTicks, xMin, xMax).toFixed(2);
            line(xPos, this.layout.bottomMargin, xPos, this.layout.bottomMargin + 5);
            noStroke();
            fill(0);
            textAlign('center');
            textSize(12);
            text(xVal, xPos, this.layout.bottomMargin + 20);
        }

        // Draw Y-axis ticks and labels based on selected variable range
        let yVals = this.data.getColumn(this.selectedVariable2).map(n => parseFloat(n));
        let yMin = min(yVals);
        let yMax = max(yVals);
        let yTicks = 5;  // Number of ticks on the y-axis
        for (let i = 0; i <= yTicks; i++) {
            let yPos = map(i, 0, yTicks, this.layout.bottomMargin, this.layout.topMargin);
            let yVal = map(i, 0, yTicks, yMin, yMax).toFixed(2);
            line(this.layout.leftMargin - 5, yPos, this.layout.leftMargin, yPos);
            noStroke();
            fill(0);
            textAlign('right');
            textSize(12);
            text(yVal, this.layout.leftMargin - 10, yPos + 5);
        }

        // X-axis label
        textAlign('center', 'center');
        textSize(16);
        text(this.selectedVariable1, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.bottomMargin + 40);

        // Y-axis label
        push();
        translate(this.layout.leftMargin - 60, (this.layout.plotHeight() / 2) + this.layout.topMargin);
        rotate(-HALF_PI);
        text(this.selectedVariable2, 0, 0);
        pop();
    };

    this.drawDensityPlot = function() {
        let xVals = this.data.getColumn(this.selectedVariable1).map(n => parseFloat(n));
        let yVals = this.data.getColumn(this.selectedVariable2).map(n => parseFloat(n));

        let xMin = min(xVals);
        let xMax = max(xVals);
        let yMin = min(yVals);
        let yMax = max(yVals);

        for (let i = 0; i < this.data.getRowCount(); i++) {
            let x = this.layout.leftMargin + map(xVals[i], xMin, xMax, 0, this.layout.plotWidth());
            let y = this.layout.topMargin + map(yVals[i], yMin, yMax, this.layout.plotHeight(), 0);

            fill(this.pointColors[i]); // Use precomputed color
            noStroke();
            ellipse(x, y, 8, 8);
        }
    };

    this.drawPromptMessage = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);
        text("Please select variables to render the graph.", width / 2, height / 2);
    };

    this.generateColors = function() {
        // Generate random colors for each point once
        this.pointColors = [];
        for (let i = 0; i < this.data.getRowCount(); i++) {
            this.pointColors.push(color(random(255), random(255), random(255), 150));
        }
    };

    this.destroy = function() {
        this.variableDropdown1.remove();
        this.variableDropdown2.remove();
        // Any cleanup code goes here
    };
}
