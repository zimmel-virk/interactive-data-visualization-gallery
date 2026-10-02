
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new UKFoodAttitudes());
  gallery.addVisual(new NutrientsTimeSeries());
  gallery.addVisual(new ForestFiresLineChart());
  gallery.addVisual(new CorrelationMatrixHeatmap());  
  gallery.addVisual(new BubbleChart()); 
  gallery.addVisual(new TimeSeriesPlot()); 
  gallery.addVisual(new SuccessRatesByInstitutionTypeYear()); 
  gallery.addVisual(new DistributionOfLeaversByAgeGroup());
  gallery.addVisual(new SuccessRatesStackedBar());
  gallery.addVisual(new RadarChartSuccessRates());
  gallery.addVisual(new BoxPlotSuccessRates());
  gallery.addVisual(new SuccessRatesWaffleChart());
  gallery.addVisual(new ScatterplotOverallLeavers());
  gallery.addVisual(new WaterfallChart());
  gallery.addVisual(new successRatesHeatmap());
  gallery.addVisual(new SankeyDiagram());
  gallery.addVisual(new SunburstChart());
  gallery.addVisual(new MentalHealthViolinPlot());
  gallery.addVisual(new MetricDoughnutChart());
  gallery.addVisual(new FacetGrid());
  gallery.addVisual(new FacetGrid2());
  gallery.addVisual(new ChordDiagram());
  gallery.addVisual(new LollipopChart());
  gallery.addVisual(new PairwiseDensityPlot());
  gallery.addVisual(new HexbinPlot());
  gallery.addVisual(new EnergyConsumption());
  gallery.addVisual(new Treemap());



    
   
    
  
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
