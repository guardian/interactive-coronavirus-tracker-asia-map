import * as d3B from 'd3'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import { $ } from "./util"
import asiaMap from '../assets/asia_china_extent.json'
import loadJson from '../components/load-json'

const d3 = Object.assign({}, d3B, topojson, geo);

const atomEl = $('.interactive-wrapper')

const isMobile = window.matchMedia('(max-width: 600px)').matches;

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

const chinaCentroid = path.centroid(asiaChinaExtent)
const chinaLatLon = projection.invert(chinaCentroid)


/*projection.center(chinaLatLon)
.translate([width/2, height/2])
.scale(isMobile ? 200 : 500)*/




const map = d3.select('.interactive-wrapper')
.append('svg')
.attr('width', width)
.attr('height', height);


projection.fitExtent([[0, 20], [width, height - 20]], asiaChinaExtent);


map.selectAll('path')
.data(topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.filter(d => d.properties.code != 'extent'))
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'country ' + d.properties.code.split(' ').join(''))


const parseData = (data) => {

	let max = d3.max(data.data, d => +d.cases );

	radius.domain([0, max])

	data.data.map(d => {

		let area = d3.select('.' + d.code.split(' ').join(''))
		.classed(' selected', true);

		let feature = topojson.feature(asiaMap, asiaMap.objects.asia_china_extent).features.find(c => c.properties.code.split(' ').join('') === d.code.split(' ').join(''))

		let centroid = path.centroid(feature)

		//console.log(feature, centroid, d.code)
		
/*		data.style.filter(s => s.feature === "selected-country").map(s => {

			area
			.style(s.style, s.value);

		})*/

		if(centroid[0])
		{
			map
			.append('circle')
			.attr("class", "bubble")
			.attr("r", radius(+d.cases))
			.attr("cx", centroid[0])
			.attr("cy", centroid[1])
		}

		
	})

}



loadJson('https://interactive.guim.co.uk/docsdata-test/1MHrA0nz6HVp7aJw5_KZkE90_PzzDUR5XTelkhyg_yOg.json')
.then( fileRaw => {
	//fillFurniture(fileRaw.sheets.furniture);
	
	parseData (fileRaw.sheets);
	//window.resize();
})
