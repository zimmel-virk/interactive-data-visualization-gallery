# Interactive Data Visualisation & Analytics Gallery

A browser-based data-visualisation application built with **JavaScript and p5.js**. The project brings together a large collection of interactive charts for exploring datasets covering technology diversity, gender pay gaps, climate, nutrition, forest fires, institutional success rates, education, mental health, heart-attack indicators, cancer, stress and energy.

The application uses a reusable gallery architecture: each visualisation is implemented as its own JavaScript component, registered with a shared `Gallery` object, and selected through a dynamically generated navigation menu.

The original project files are preserved unchanged. Because the submitted project already contained its own `README.md`, that file has been left exactly as supplied. This document is additional technical documentation rather than a replacement.

## Project Scale

The main `sketch.js` registers **32 visualisations** in the gallery.

The preserved source contains:

- 37 JavaScript files;
- 16 CSV datasets;
- source spreadsheet files used for several datasets;
- 10 chart/icon image assets;
- the bundled p5.js library;
- the original HTML and CSS interface;
- the original coursework README.

## Application Architecture

### `sketch.js`

Creates the p5 canvas and initialises the global `Gallery` instance.

Each visualisation is registered through:

```javascript
gallery.addVisual(new VisualisationClass());
```

The main draw loop delegates rendering to the currently selected visualisation.

### `gallery.js`

Provides the shared visualisation controller.

It is responsible for:

- storing visualisation objects;
- enforcing unique visualisation IDs;
- generating menu entries;
- running visualisation-specific `preload()` methods;
- switching between visualisations;
- calling `destroy()` when a visualisation is deselected;
- calling `setup()` when a visualisation is selected;
- restoring animation through p5's `loop()` function.

### `helper-functions.js`

Contains reusable drawing and layout utilities shared across multiple visualisations.

### `index.html`

Loads:

- p5.js;
- the main sketch;
- every visualisation component;
- helper functions;
- the gallery controller;
- the project stylesheet.

## Visualisations

The gallery contains the following 32 registered visualisations:

1. Tech Diversity: Race
2. Tech Diversity: Gender
3. Pay Gap by Job: 2017
4. Pay Gap: 1997–2017
5. Climate Change
6. UK Food Attitudes 2018
7. Nutrients: 1974–2016
8. Forest Fires: Line Chart
9. Forest Fires: Correlation Matrix Heatmap
10. Forest Fires: Bubble Chart
11. Forest Fires: Time Series Plot
12. Success Rates: Institutional Type / Year Analysis
13. Success Rates: Pie Chart
14. Success Rates: Stacked Bar Chart
15. Success Rates: Radar Chart
16. Success Rates: Box Plot
17. Success Rates: Waffle Chart
18. Success Rates: Scatterplot
19. Success Rates: Waterfall Chart
20. Success Rates: Heatmap
21. Education: Sankey Diagram
22. Education: Sunburst Chart
23. Mental Health: Violin Plot
24. Mental Health: Doughnut Chart
25. Heart Attack: Facet Grid
26. Heart Attack: Facet Grid 2
27. Cancer: Chord Diagram
28. Stress: Lollipop Chart
29. Stress: Pairwise Density Plot
30. Stress: Hexbin Plot
31. Energy: Pairwise Line Plot
32. Energy: Treemap

## Data Domains

### Technology Diversity

Files:

```text
data/tech-diversity/gender-2018.csv
data/tech-diversity/race-2018.csv
data/tech-diversity/source/tech-diversity.xlsx
```

Visualisations include:

- gender representation by technology company;
- race/ethnicity distribution by company.

### Gender Pay Gap

Files:

```text
data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv
data/pay-gap/occupation-hourly-pay-by-gender-2017.csv
```

The repository also preserves the original spreadsheet source files.

Visualisations include:

- pay-gap change over time;
- pay gap by occupation;
- workforce composition and job-count relationships.

### Climate Change

Files:

```text
data/surface-temperature/surface-temperature.csv
data/surface-temperature/source/GLB.Ts+dSST.csv
```

The climate component maps historical temperature values to a time-series visualisation with colour-based temperature representation.

### Food & Nutrition

Files:

```text
data/food/attitudestoukfood-2018.csv
data/food/nutrients74-16.csv
```

Visualisations cover:

- UK food attitudes;
- nutrient trends over time.

### Forest Fires

File:

```text
data/forest_fires.csv
```

Multiple chart types are used for the same domain, including:

- line chart;
- correlation matrix heatmap;
- bubble chart;
- time-series plot.

### Institutional Success Rates

File:

```text
data/successrates.csv
```

This dataset is explored through several visual forms:

- bar chart;
- pie chart;
- stacked bars;
- radar chart;
- box plot;
- waffle chart;
- scatterplot;
- waterfall chart;
- heatmap.

This demonstrates how the same dataset can be analysed from different visual perspectives.

### Education

File:

```text
data/education.csv
```

Visualisations:

- Sankey diagram;
- sunburst chart.

### Mental Health

File:

```text
data/mentalhealth.csv
```

Visualisations:

- violin plot;
- doughnut chart.

### Heart Attack

File:

```text
data/heartattack.csv
```

The project contains two facet-grid implementations for exploring multiple relationships within the dataset.

### Cancer

File:

```text
data/cancer.csv
```

Visualisation:

- chord diagram.

### Stress

File:

```text
data/stress.csv
```

Visualisations:

- lollipop chart;
- pairwise density plot;
- hexbin plot.

### Energy

File:

```text
data/energy.csv
```

Visualisations:

- pairwise line plot;
- treemap.

## Chart Types Implemented

Across the complete project, the source implements a broad set of visualisation techniques, including:

```text
Bar charts
Stacked bar charts
Line charts
Time-series plots
Scatterplots
Bubble charts
Pie charts
Doughnut charts
Radar charts
Box plots
Waffle charts
Waterfall charts
Heatmaps
Correlation matrices
Sankey diagrams
Sunburst charts
Treemaps
Violin plots
Facet grids
Chord diagrams
Lollipop charts
Density plots
Hexbin plots
```

## Interaction and Navigation

The gallery automatically creates a menu item for every registered visualisation.

When the user selects a different item:

1. the previous menu selection is cleared;
2. the new item receives the selected state;
3. the currently active visualisation can run its cleanup logic;
4. the new visualisation becomes active;
5. its setup logic runs if required;
6. the p5 animation loop is enabled.

Individual visualisations also implement their own controls where needed, including selectors and other dynamically created p5 DOM elements.

## Repository Structure

```text
interactive-data-visualization-gallery/
├── README.md
├── PROJECT_OVERVIEW.md
├── ORIGINAL_FILES_VERIFIED.txt
├── .gitignore
├── .eslintrc
├── index.html
├── style.css
├── sketch.js
├── gallery.js
├── helper-functions.js
├── [visualisation JavaScript files]
├── data/
│   ├── cancer.csv
│   ├── education.csv
│   ├── energy.csv
│   ├── forest_fires.csv
│   ├── heartattack.csv
│   ├── mentalhealth.csv
│   ├── stress.csv
│   ├── successrates.csv
│   ├── food/
│   ├── pay-gap/
│   ├── surface-temperature/
│   └── tech-diversity/
├── icons/
└── lib/
    └── p5.min.js
```

## Running the Project

The project can be served from its directory with a simple local web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The project includes its own copy of `p5.min.js`, so no package installation is required for the main application.

## Source Validation

The JavaScript files in the preserved project were syntax-checked with Node's parser during repository preparation.

No source file was edited as part of that check.

## Original-File Preservation

The original project already included `README.md`; it has deliberately not been replaced.

All original JavaScript, HTML, CSS, CSV, spreadsheet, image, configuration and library files included in this repository were copied byte-for-byte from the supplied source.

Only the following support files were added:

```text
PROJECT_OVERVIEW.md
.gitignore
ORIGINAL_FILES_VERIFIED.txt
```

The separate `isp/` coursework subfolder was not included here because those exercises are being maintained as separate projects. IDE metadata and `.DS_Store` files were also excluded.

## Author

**Zimmel Javed Virk**  
BSc Computer Science — University of London
