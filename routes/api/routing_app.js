const router = require('express').Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const request = require('request')
const osrmTextInstructions = require('osrm-text-instructions')('v5')
const polyline = require('@mapbox/polyline')

const route_error = {message: 'No route could be found'}

const deployed = process.env.DEPLOYED;
const tile_url = deployed
	? 'http://tileserver.tools.svc.cluster.local/world_roads'
	: 'http://localhost:8001/api/v1/namespaces/tools/services/tileserver:tileport/proxy/world_roads'

const locator_url = deployed
	? 'http://locator.dev.svc.cluster.local/'
	: 'http://localhost:8001/api/v1/namespaces/dev/services/locator/proxy/'
const options = {
	target: tile_url,
	pathRewrite: {
		'^/tile': ''
	},
    logLevel: 'silent'
};
// create the proxy (with context)
const tileProxy = createProxyMiddleware(options);

router.use('/tile', tileProxy);
router.get('/', (req, res) => res.send('test'))
router.get(['/osrm/:traffic/:lon1%2C:lat1%3B:lon2%2C:lat2.json', '/osrm/:traffic/:lon1,:lat1;:lon2,:lat2.json'], (req, res) => {
	const options = {
		uri: locator_url,
		method: 'POST',
		json: {
			"vehicle": { "type": "car" },
			"locations": [{ "longitude": parseFloat(req.params.lon1), "latitude": parseFloat(req.params.lat1), "location_id": "0" }]
		}
	}

	request(options, function (error, response, body) {
		let url = body.routing_server.url
		if (!deployed) {
			const server = url.match('//(.*).osrm')[1]
			url = 'http://localhost:8001/api/v1/namespaces/osrm/services/' + server + '/proxy'
		}
		url += '/route/v1' + req.originalUrl.replace(/osrm\/\d/, 'driving')
		request(url, function (e, r, b) {
			var j = JSON.parse(b)
			if (!j.routes) {
				res.status(404).send(route_error)
				return
			}
			j.routes.forEach(function (route) {
				route.duration = route.durations[req.params.traffic]
				route.legs.forEach(function (leg) {
					leg.duration = leg.durations[req.params.traffic]
					leg.steps.forEach(function (step) {
						step.duration = step.durations[req.params.traffic]
						step.maneuver.instruction = osrmTextInstructions.compile('en', step)
					})
				})
			})
			res.send(j)
		})
	})
})
router.get(['/google/:traffic/:lon1%2C:lat1%3B:lon2%2C:lat2.json', '/google/:traffic/:lon1,:lat1;:lon2,:lat2.json'], (req, res) => {
	let url = 'https://maps.googleapis.com/maps/api/directions/json?'
	url += 'origin=' + req.params.lat1 + '%2C' + req.params.lon1
	url += '&destination=' + req.params.lat2 + '%2C' + req.params.lon2
	url += '&key=AIzaSyDJxozOHJ1uC7cOHhQBvxOId-01NW80kLs'
	request(url, function (error, response, body) {
		const j = JSON.parse(body)
		if (!j.routes) {
			res.status(404).send(route_error)
			return
		}
		const leg = j.routes[0].legs[0]
		j.waypoints = [
			{ location: [leg.start_location.lng, leg.start_location.lat] },
			{ location: [leg.end_location.lng, leg.end_location.lat] }
		]
		j.routes.forEach(function (route) {
			route.geometry = route.overview_polyline.points
			route.distance = route.legs[0].distance.value
			route.duration = route.legs[0].duration.value
			route.legs.forEach(function (leg) {
				leg.steps.forEach(function (step) {
					step.maneuver = {
						modifier: step.maneuver ? step.maneuver.replace('turn-', '') : null,
						type: step.maneuver ? 'turn' : '',
						location: [step.start_location.lng, step.start_location.lat],
						instruction: step.html_instructions
					}
					step.distance = step.distance.value
				})
				leg.steps[0].maneuver.type = 'depart'
			})
		})
		res.send(j)
	})
})
router.get(['/:mode/:traffic/:lon1%2C:lat1%3B:lon2%2C:lat2.json', '/:mode/:traffic/:lon1,:lat1;:lon2,:lat2.json'], (req, res) => {
	const modifier = ['', '', 'right', 'left', '', 'right', 'left', 'straight', 'straight', 'slight-right', 'right', 'sharp-right', 'uturn', 'uturn', 'sharp-left', 'left', 'slight-left', 'straight', 'right', 'left', 'right', 'left', 'straight', 'right', 'left', 'straight']
	let mode = req.params.mode
	if (mode === 'truck')
		mode = 'truck_traffic'
	const options = {
		uri: locator_url,
		method: 'POST',
		json: {
			"vehicle": { "type": req.params.mode },
			"locations": [{ "longitude": parseFloat(req.params.lon1), "latitude": parseFloat(req.params.lat1), "location_id": "0" }]
		}
	}

	request(options, function (error, response, body) {
		let url = body.routing_server.url
		if (!deployed) {
			const server = url.match('//(.*).osrm')[1]
			url = 'http://localhost:8001/api/v1/namespaces/osrm/services/' + server + '/proxy'
		}

		url += '/route?json={%22locations%22:['
			+ "{%22lon%22:" + req.params.lon1 + ",%22lat%22:" + req.params.lat1 + "},"
			+ "{%22lon%22:" + req.params.lon2 + ",%22lat%22:" + req.params.lat2 + "}],"
			+ "%22costing%22:%22" + mode + "%22,"
			+ "%22intervals%22:[" + req.params.traffic + "]}"
		request(url, function (e, r, b) {
			const j = JSON.parse(b)
			if (!j.trip) {
				res.status(404).send(route_error)
				return
			}
			j.routes = [j.trip]
			j.waypoints = [
				{ location: [j.trip.locations[0].lon, j.trip.locations[0].lat] },
				{ location: [j.trip.locations[1].lon, j.trip.locations[1].lat] }
			]
			j.routes[0].duration = j.trip.summary.time
			j.routes[0].distance = j.trip.summary.length * 1000
			const leg = j.routes[0].legs[0]
			let coords = polyline.decode(leg.shape, 6)
			j.routes[0].geometry = polyline.encode(coords, 5)
			leg.steps = leg.maneuvers
			leg.steps.forEach(function (step) {
				step.duration = step.time
				step.distance = step.length * 1000
				step.maneuver = {
					modifier: modifier[step.type],
					type: 'turn',
					location: [coords[step.begin_shape_index][1], coords[step.begin_shape_index][0]],
					instruction: step.instruction
				}
			})
			res.send(j)
		})
	})
})

module.exports = router;



