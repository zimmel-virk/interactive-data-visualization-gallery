# Interactive Data Visualisation & Analytics Gallery

A browser-based data visualisation application built with **JavaScript and p5.js**. The project provides a single interactive gallery for exploring multiple real-world datasets through a wide range of chart types and analytical views.

The application contains **32 registered visualisations** covering technology diversity, gender pay gaps, climate change, food and nutrition, forest fires, institutional success rates, education, mental health, heart-attack indicators, cancer, stress and energy.

Each visualisation is implemented as a separate JavaScript component and registered with a shared gallery controller, allowing users to switch between datasets and chart types from a dynamically generated navigation menu.

## Project Overview

The project demonstrates how different visual encodings can be used to explore relationships, distributions, trends and category comparisons across heterogeneous datasets.

Rather than using one chart type for every problem, the application implements a broad collection of techniques including:

- bar and stacked bar charts;
- line and time-series charts;
- scatter and bubble plots;
- pie and doughnut charts;
- radar charts;
- box plots;
- waffle charts;
- waterfall charts;
- heatmaps and correlation matrices;
- Sankey diagrams;
- sunburst charts;
- treemaps;
- violin plots;
- facet grids;
- chord diagrams;
- lollipop charts;
- density plots;
- hexbin plots.

## Application Architecture

### `sketch.js`

`sketch.js` is the main application entry point.

It:

- creates the p5 canvas;
- creates the global `Gallery` object;
- registers all visualisation classes;
- forwards rendering to the currently selected visualisation.

Visualisations are added using:

```javascript
gallery.addVisual(new VisualisationClass());
```

The main draw loop checks which visualisation is selected and calls its `draw()` function.

## Gallery Controller

### `gallery.js`

`gallery.js` manages the complete visualisation collection.

It is responsible for:

- storing visualisation objects;
- preventing duplicate IDs;
- generating menu entries dynamically;
- running each visualisation's `preload()` function;
- switching between visualisations;
- calling `destroy()` when a visualisation is deselected;
- calling `setup()` when a visualisation becomes active;
- restoring the p5 animation loop when required.

This keeps navigation and lifecycle management separate from the individual chart implementations.

## Shared Helper Functions

### `helper-functions.js`

Reusable drawing and layout utilities are placed in `helper-functions.js`.

These functions support common operations used by multiple charts, reducing repetition between visualisation components.

## Visualisations Included

The application registers the following 32 visualisations:

1. **Tech Diversity: Race**
2. **Tech Diversity: Gender**
3. **Pay Gap by Job: 2017**
4. **Pay Gap: 1997–2017**
5. **Climate Change**
6. **UK Food Attitudes 2018**
7. **Nutrients: 1974–2016**
8. **Forest Fires: Line Chart**
9. **Forest Fires: Correlation Matrix Heatmap**
10. **Forest Fires: Bubble Chart**
11. **Forest Fires: Time Series Plot**
12. **Success Rates: Institutional Type / Year Analysis**
13. **Success Rates: Pie Chart**
14. **Success Rates: Stacked Bar Chart**
15. **Success Rates: Radar Chart**
16. **Success Rates: Box Plot**
17. **Success Rates: Waffle Chart**
18. **Success Rates: Scatterplot**
19. **Success Rates: Waterfall Chart**
20. **Success Rates: Heatmap**
21. **Education: Sankey Diagram**
22. **Education: Sunburst Chart**
23. **Mental Health: Violin Plot**
24. **Mental Health: Doughnut Chart**
25. **Heart Attack: Facet Grid**
26. **Heart Attack: Facet Grid 2**
27. **Cancer: Chord Diagram**
28. **Stress: Lollipop Chart**
29. **Stress: Pairwise Density Plot**
30. **Stress: Hexbin Plot**
31. **Energy: Pairwise Line Plot**
32. **Energy: Treemap**

## Technology Diversity Analysis

The project includes gender and race diversity datasets for major technology companies.

Files include:

```text
data/tech-diversity/gender-2018.csv
data/tech-diversity/race-2018.csv
data/tech-diversity/source/tech-diversity.xlsx
```

The visualisations compare workforce composition between companies and use interactive selection where appropriate.

The gender view uses stacked proportional bars, while the race view uses company-specific categorical composition.

## Gender Pay Gap Analysis

Files include:

```text
data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv
data/pay-gap/occupation-hourly-pay-by-gender-2017.csv
```

The project examines:

- long-term gender pay-gap changes;
- pay-gap differences across occupations;
- relationships between workforce composition and pay difference;
- job-count information through point-size encoding.

## Climate Change Visualisation

Files include:

```text
data/surface-temperature/surface-temperature.csv
data/surface-temperature/source/GLB.Ts+dSST.csv
```

The climate component visualises historical surface-temperature change using a time-series representation combined with temperature-based colour mapping.

This makes both the numerical trend and the long-term warming pattern visually apparent.

## Food and Nutrition Analysis

Files include:

```text
data/food/attitudestoukfood-2018.csv
data/food/nutrients74-16.csv
```

The gallery contains visualisations for:

- UK food attitudes;
- nutrient-consumption changes over time.

## Forest Fire Analysis

Dataset:

```text
data/forest_fires.csv
```

The same forest-fire dataset is explored using multiple analytical views:

- line chart;
- correlation matrix heatmap;
- bubble chart;
- time-series plot.

Using several chart types for the same dataset makes it possible to inspect trends, relationships and variable interactions from different perspectives.

## Institutional Success Rate Analysis

Dataset:

```text
data/successrates.csv
```

This is one of the most extensively visualised datasets in the project.

It is represented through:

- institutional/year analysis;
- pie chart;
- stacked bar chart;
- radar chart;
- box plot;
- waffle chart;
- scatterplot;
- waterfall chart;
- heatmap.

This section demonstrates how one dataset can support multiple analytical questions depending on the chosen visual encoding.

## Education Analysis

Dataset:

```text
data/education.csv
```

Visualisations:

- **Sankey diagram**
- **Sunburst chart**

These charts are suited to hierarchical and flow-based relationships within the education data.

## Mental Health Analysis

Dataset:

```text
data/mentalhealth.csv
```

Visualisations:

- **Violin plot**
- **Doughnut chart**

The violin plot emphasises distribution shape, while the doughnut chart provides categorical comparison.

## Heart Attack Analysis

Dataset:

```text
data/heartattack.csv
```

The project contains two facet-grid implementations for examining multiple variables and subgroup relationships within the same dataset.

## Cancer Analysis

Dataset:

```text
data/cancer.csv
```

Visualisation:

- **Chord diagram**

The chord representation is used to show relationships between connected categories.

## Stress Analysis

Dataset:

```text
data/stress.csv
```

Visualisations:

- **Lollipop chart**
- **Pairwise density plot**
- **Hexbin plot**

These provide complementary views of category comparison, density and multivariable relationships.

## Energy Analysis

Dataset:

```text
data/energy.csv
```

Visualisations:

- **Pairwise line plot**
- **Treemap**

The treemap represents proportional structure, while the line-based view supports trend comparison.

## Data Sources

The project contains **16 CSV datasets**, together with several source spreadsheets and supporting files.

The main data directories are:

```text
data/
├── food/
├── pay-gap/
├── surface-temperature/
└── tech-diversity/
```

Additional standalone CSV datasets include:

```text
cancer.csv
education.csv
energy.csv
forest_fires.csv
heartattack.csv
mentalhealth.csv
stress.csv
successrates.csv
```

## Interaction and Navigation

The application dynamically creates menu entries for every registered visualisation.

When the user selects a new visualisation:

1. the previous selection is cleared;
2. the new menu item becomes active;
3. the previous visualisation can execute cleanup logic;
4. the selected visualisation becomes the active object;
5. its setup logic runs if required;
6. rendering resumes through the p5 animation loop.

Some individual visualisations also create their own controls, selectors and interactive DOM elements.

## Repository Structure

```text
interactive-data-visualization-gallery/
├── README.md
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
├── lib/
│   └── p5.min.js
└── docs/
    └── original_coursework_README.md
```

## Technologies

- JavaScript
- p5.js
- HTML
- CSS
- CSV data processing
- interactive data visualisation
- browser-based graphics
- object-oriented JavaScript
- dynamic DOM controls

## Running the Project

No package installation is required because the repository includes its own p5.js library.

From the project directory, start a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

in a browser.

A local web server is recommended because the project loads CSV data and other assets from relative paths.

## Original Project Preservation

All original JavaScript, HTML, CSS, CSV, spreadsheet, image, configuration and library files remain unchanged.

The original coursework README has been preserved byte-for-byte at:

```text
docs/original_coursework_README.md
```

The root `README.md` now documents the completed application itself.

The separate Intelligent Signal Processing exercises from the original source folder are maintained independently and are not part of this repository.

## Author

**Zimmel Javed Virk**  
BSc Computer Science — University of London
