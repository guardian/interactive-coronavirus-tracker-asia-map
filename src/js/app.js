import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geoProjection from 'd3-geo-projection'
import { $ } from "./util"
import asiaMap from '../assets/asia_china_extent.json'
import loadJson from '../components/load-json'

const d3 = Object.assign({}, d3B, topojson, geoProjection);

const atomEl = $('.interactive-wrapper')

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let isPreview = document.referrer && document.referrer.indexOf('gutools') > -1;

if(window)
{
	if(window.location)
	{
		if(window.location.ancestorOrigins)
		{
			if(window.location.ancestorOrigins['0'].indexOf('gutools') > -1)isPreview = true;
			
		}
	}
	
}

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? width : width * 3.5 / 5;

let projection = d3.geoMiller()

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.range([0, 70]);


topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features

const asiaChinaExtent = topojson.feature(asiaMap, {
	type: "GeometryCollection",
	geometries: asiaMap.objects.asia_china_extent.geometries.filter(d => d.properties.NAME_0 == 'China' || d.properties.code == 'JPN' || d.properties.code == 'MYS')
});

const map = d3.select('.interactive-wrapper')
.append('svg')
.attr('width', width)
.attr('height', height);


const geo = map.append('g');
const bubbles = map.append('g');
const labels = map.append('g');


projection.fitExtent([[0, 10], [width, height - 20]], asiaChinaExtent);


geo.selectAll('path')
.data(topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.filter(d => d.properties.code != 'extent'))
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'country ' + d.properties.code.split(' ').join(''))


const parseData = (sheet) => {

	d3.select('.headline').html(sheet.furniture[0].text)
	d3.select('.timestamp').html(sheet.furniture[2].text)
	d3.select('.source').html(sheet.furniture[1].text)

	let data;

	if (isPreview) {
		data = sheet.preview;


		console.log("=================== PREVIEW VERSION ==================")


	} else {
		data = sheet.data;


		console.log("=================== LIVE VERSION ==================")
	}


	let max = d3.max(data, d => +d.cases );

	radius.domain([0, max])

	data.map(d => {

		let area = d3.select('.' + d.code.split(' ').join(''))
		.classed(' selected', true);

		let feature = topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.find(c => c.properties.code.split(' ').join('') === d.code.split(' ').join(''))

		let centroid = path.centroid(feature);
		if(d.lat) centroid = projection([d.lon, d.lat]);

		bubbles
		.append('circle')
		.attr("class", "bubble")
		.attr("r", radius(+d.cases))
		.attr("cx", centroid[0])
		.attr("cy", centroid[1])

		if(d.display == 'block')
		{
			let label = labels.append('text')
			.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

			label
			.append("tspan")
			.attr('class','country-label')
			.text(d.NAME)
			.attr('x', d.offset_horizontal || 0) 
			.attr('y', -(d.offset_vertical) )

			label
			.append('tspan')
			.attr('class','country-cases')
			.text(d.text)
			.attr('x', d.offset_horizontal || 0)
			.attr('dy', '15' )
		}

		

		
	})

}



loadJson('https://interactive.guim.co.uk/docsdata-test/1MHrA0nz6HVp7aJw5_KZkE90_PzzDUR5XTelkhyg_yOg.json')
.then( fileRaw => {
	//fillFurniture(fileRaw.sheets.furniture);
	
	parseData(fileRaw.sheets);
	//window.resize();
})
