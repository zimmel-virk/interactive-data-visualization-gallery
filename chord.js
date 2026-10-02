function ChordDiagram() {
    this.name = 'Cancer: Chord Diagram';
    this.id = 'chord-diagram';
    this.title = 'Chord Diagram: Gender-Based Cancer Risk Relationships';

    this.layout = {
        marginSize: 35,
        leftMargin: 100,
        rightMargin: width - 100,
        topMargin: 130,
        bottomMargin: height - 50,
        plotWidth: function() { return this.rightMargin - this.leftMargin; },
        plotHeight: function() { return this.bottomMargin - this.topMargin; }
    };

    this.loaded = false;
    this.selectedOption = 'Risk of Development'; // Default option

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/cancer.csv',
            'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log('Data loaded successfully:', self.data.getRowCount(), 'rows');
            }
        );
    };

    this.setup = function() {
        textSize(16);

        // Create the dropdown menu for selecting data type
        this.dropdown = createSelect();
        this.dropdown.position(this.layout.leftMargin + 190, this.layout.topMargin + 70);
        this.dropdown.option('Risk of Development');
        this.dropdown.option('Risk of Death');
        this.dropdown.changed(() => {
            this.selectedOption = this.dropdown.value();
            this.draw();
        });
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        clear(); // Clear the previous drawings
        this.drawTitle();
        translate(0, 20); // Move the entire chart down
        this.drawChordDiagram();
        this.drawLegend();
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);
        text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 100);
    };

    this.drawChordDiagram = function() {
        let cancerTypes = this.data.getColumn('Cancer Type');

        let maleRisk, femaleRisk;
        let maxRadius = 50;  // Maximum radius of the circles
        let minRadius = 5;    // Minimum radius of the circles

        if (this.selectedOption === 'Risk of Development') {
            maleRisk = this.data.getColumn('Male Risk Development Percentage');
            femaleRisk = this.data.getColumn('Female Risk Development Percentage');
        } else if (this.selectedOption === 'Risk of Death') {
            maleRisk = this.data.getColumn('Male Risk Dying Percentage');
            femaleRisk = this.data.getColumn('Female Risk Dying Percentage');
        }

        let numTypes = cancerTypes.length;
        let maxRiskValue = Math.max(...maleRisk, ...femaleRisk);

        let angleStep = TWO_PI / numTypes;
        let radius = this.layout.plotWidth() / 4;

        translate(width / 2, height / 2);

        for (let i = 0; i < numTypes; i++) {
            let angle = i * angleStep;
            let xMale = cos(angle) * radius;
            let yMale = sin(angle) * radius;
            let xFemale = cos(angle + PI) * radius;
            let yFemale = sin(angle + PI) * radius;

            let maleRadius = map(maleRisk[i], 0, maxRiskValue, minRadius, maxRadius);
            let femaleRadius = map(femaleRisk[i], 0, maxRiskValue, minRadius, maxRadius);

            stroke(0);
            fill(200, 100, 100, 180);
            ellipse(xMale, yMale, maleRadius * 2, maleRadius * 2);

            fill(100, 100, 255, 180);
            ellipse(xFemale, yFemale, femaleRadius * 2, femaleRadius * 2);

            stroke(0);
            line(xMale, yMale, xFemale, yFemale);

            // Add labels for cancer types
            fill(0);
            textSize(10);
            noStroke();
            textAlign(CENTER, CENTER);
            text(cancerTypes[i], xMale * 1.2, yMale * 1.2);  // Offset to avoid overlap
        }
    };


    this.drawLegend = function() {
        let legendX = this.layout.leftMargin - 550;
        let legendY = this.layout.topMargin - 350;

        textAlign(LEFT);
        textSize(12);
        fill(0);
        noStroke();

        // Male legend
        fill(200, 100, 100, 180);
        ellipse(legendX + 10, legendY + 20, 10, 10);
        fill(0);
        text('Male Risk', legendX + 20, legendY + 20);

        // Female legend
        fill(100, 100, 255, 180);
        ellipse(legendX + 10, legendY + 40, 10, 10);
        fill(0);
        text('Female Risk', legendX + 20, legendY + 40);
    };

    this.destroy = function() {
        // Any cleanup code goes here
        this.dropdown.remove(); // Remove the dropdown when the visualization is destroyed
    };
}
