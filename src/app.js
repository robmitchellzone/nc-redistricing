import './main.css';
import {select} from 'd3-selection';
import {geoMercator, geoPath} from 'd3-geo';
import {json, csv} from 'd3-fetch';
import {scaleQuantize} from 'd3-scale';
import {schemeRdBu} from 'd3-scale-chromatic';
import {range} from 'd3-array';

function myViz(data) {
  const datasetMap = [
    {year: '2002-01-01', chamber: 'house', map: 0},
    {year: '2002-01-01', chamber: 'senate', map: 6},
    {year: '2004-01-01', chamber: 'house', map: 1},
    {year: '2004-01-01', chamber: 'senate', map: 7},
    {year: '2006-01-01', chamber: 'house', map: 1},
    {year: '2006-01-01', chamber: 'senate', map: 7},
    {year: '2008-01-01', chamber: 'house', map: 1},
    {year: '2008-01-01', chamber: 'senate', map: 7},
    {year: '2010-01-01', chamber: 'house', map: 2},
    {year: '2010-01-01', chamber: 'senate', map: 7},
    {year: '2012-01-01', chamber: 'house', map: 3},
    {year: '2012-01-01', chamber: 'senate', map: 8},
    {year: '2014-01-01', chamber: 'house', map: 3},
    {year: '2014-01-01', chamber: 'senate', map: 8},
    {year: '2016-01-01', chamber: 'house', map: 3},
    {year: '2016-01-01', chamber: 'senate', map: 8},
    {year: '2018-01-01', chamber: 'house', map: 4},
    {year: '2018-01-01', chamber: 'senate', map: 9},
    {year: '2020-01-01', chamber: 'house', map: 5},
    {year: '2020-01-01', chamber: 'senate', map: 10},
  ];
  const results = data[11];
  let width = 700;
  let height = 300;
  let projection = geoMercator();
  projection.fitSize([width, height], data[0]);
  let geoGenerator = geoPath().projection(projection);
  const color = scaleQuantize([0, 1], schemeRdBu[10]);
  const legendKeys = [
    '+45%',
    '+35%',
    '+25%',
    '+15%',
    '+5%',
    '+5%',
    '+15%',
    '+25%',
    '+35%',
    '+45%',
  ];
  const legendValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  let svg = select('#app')
    .append('svg')
    .attr('class', 'map')
    .attr('width', width)
    .attr('height', height);

  function myMap(values) {
    // draw the actual map
    const newData = data[values['map']];
    const thisYear = results.filter(
      row =>
        row['year'] === values['year'] && row['chamber'] === values['chamber'],
    );
    const colorArray = thisYear.map(row => color(row['dem_percent']));
    svg
      .append('g')
      .selectAll('path')
      .data(newData.features)
      .join('path')
      .attr('d', geoGenerator)
      .attr('fill', d => colorArray[d['properties']['District'] - 1])
      .attr('stroke', '#000');
  }

  // legend is the same so no need to update
  const legendHeight = 20;
  const legendWidth = 40;
  svg
    .append('g')
    .selectAll('legendBars')
    .data(legendValues)
    .join('rect')
    .attr('x', (_, i) => i * legendWidth)
    .attr('y', 250)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('fill', d => color(d));
  svg
    .append('g')
    .selectAll('legendLabels')
    .data(legendKeys)
    .join('text')
    .attr('x', (_, i) => i * legendWidth)
    .attr('y', 240)
    .text(d => d)
    .attr('text-anchor', 'left')
    .attr('class', 'legend-text');

  myMap(datasetMap[0]);

  // credit to stephenspann https://stackoverflow.com/a/24225000
  select('#year-chamber').on('change', function() {
    const values = datasetMap[eval(select(this).property('value'))];
    myMap(values);
  });
}

Promise.all([
  json('./data/final/h02.json'),
  json('./data/final/h04-08.json'),
  json('./data/final/h10.json'),
  json('./data/final/h12-16.json'),
  json('./data/final/h18.json'),
  json('./data/final/h20.json'),
  json('./data/final/s02.json'),
  json('./data/final/s04-10.json'),
  json('./data/final/s12-16.json'),
  json('./data/final/s18.json'),
  json('./data/final/s20.json'),
  csv('./data/final/full_df.csv'),
]).then(maps => {
  const [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11] = maps;
  myViz(maps);
});
