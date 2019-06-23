import * as d3 from "d3";

const w = 1000;
const h = 700;
const counties = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const education = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const margin = {
  top: 20,
  bottom: 100,
  left: 62,
  right: 20
}
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const tooltip = d3.select('body')
        .append('div')
        .attr("id", "tooltip")
        .classed('tooltip', true);

const svg = d3.select('.container').append('svg')
        .attr('id', 'chart')
        .attr('width', w)
        .attr('height', h);

const chart = svg.append('g')
        .classed('display', true)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

const colors = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];
const cLength = colors.length;

var path = d3.geoPath();

d3.select('#title')
    .append("h3")
    .attr('id', 'description')
    .html("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

const x = d3.scaleLinear()
        .domain([2.6, 75.1])
        .rangeRound([600, 860]);

const legendThreshold = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(colors);

const legendXAxis = d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(x => Math.round(x) + '%')
    .tickValues(legendThreshold.domain())

const legendData = legendThreshold.range().map(elm => legendThreshold.invertExtent(elm))
legendData[0][0] = x.domain()[0];
legendData[legendData.length-1][1] = x.domain()[1];

const legend = chart.append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", d => x(d[0]))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("fill", d => legendThreshold(d[0]));

legend.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")

legend.call(legendXAxis)
    .select(".domain")
    .remove();


init.call(chart)

async function init() {
  try {
    const jsonData = await d3.json(education);
    const jsonMap = await d3.json(counties);
    
    const [data, map] = await Promise.all([jsonData, jsonMap]);
      
    
    const topoJson = topojson.feature(map, map.objects.counties).features;
    let results = topoJson.map(m => data.filter( d=> d.fips === m.id));
    
    const geoPath = d3.geoPath( );
    
    this.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topoJson)
      .enter().append("path")
      .attr("class", "county")
      .attr("data-fips", d => d.id)
      .attr("data-education", (d,i) => {
        if(results[i][0]) return results[i][0].bachelorsOrHigher
        return 0
       })
      .attr("fill", (d,i) => { 
        if(results[i][0]) return legendThreshold(results[i][0].bachelorsOrHigher)
        return legendThreshold(0)
       })
      .attr("d", path)
      .on('mouseover', showTooltip)
      .on('touchstart', showTooltip)
      .on('mouseout', hideTooltip)
      .on('touchend', hideTooltip);
    
    this.append("path")
      .datum(topojson.mesh(map, map.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
    

    function showTooltip(d,i) {
      tooltip
        .style('opacity', 1)
        .style('left', d3.event.x -(tooltip.node().offsetWidth / 2) + 'px')
        .style('top', d3.event.y + -90 + 'px')
        .attr("data-education", function() {
          if(results[i][0])return results[i][0].bachelorsOrHigher
          return 0
         })
        .html(function() {
          if(results[i][0]){
            return results[i][0]['area_name'] + ', ' + results[i][0]['state'] + ': ' + results[i][0].bachelorsOrHigher + '%'
          }
          return 0
        })
      
 }
  
     function hideTooltip() {
       tooltip
         .style('opacity', 0)
     }
    
} catch(e) {
    console.log(e)
  }
}