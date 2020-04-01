import React from 'react';
import ReactDOM from 'react-dom';
import './RoutingMap.css';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import Tooltip from './RoadTooltip.js'

const MAPBOX_ACCESS_TOKEN = '';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const STYLE_ROAD_MAP = 'mapbox://styles/mapbox/streets-v11';

export default class RoutingMap extends React.Component {
  
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.rangeInput = React.createRef();
    this.map = {};
    this.tooltipContainer = {};
    this.state = {
      lng: -79.4512,
      lat: 43.6568,
      zoom: 13,
      minzoom: 5,
      maxzoom: 12,
      trafficLevel: 0
    };
  };

  setTooltip(features) {
    if(features.length) {
      ReactDOM.render(
        React.createElement(
          Tooltip,
          {features}
        ),
        this.tooltipContainer
      );
    } else {
      ReactDOM.unmountComponentAtNode(this.tooltipContainer);
    }
  };

  handleChange(evt) {
    evt.preventDefault();
    const value = evt.target.value;
    this.setState({ trafficLevel: value });

    const servers = ['traffic', 'driving', 'pedestrian', 'cycling'];
    const profiles = document.querySelectorAll(
      'input[type="radio"]'
    )
    profiles[0].parentElement.style.width = (74 * servers.length + 4) + 'px';
    const trafficDispatch = this.rangeInput.current;
    profiles.forEach((profile, index) => {
      if (index < servers.length) {
        profile.labels[0].innerHTML = servers[index];
        profile.value = servers[index] + '/' + trafficDispatch.value;
        profile.labels[0].style.width = '74px';
      } else {
        profile.labels[0].remove();
        profile.remove();
      }
    });
    profiles[0].checked = true;

    const dispatchEvent = new Event('change');
    trafficDispatch.dispatchEvent(dispatchEvent);

    this.map.setPaintProperty('road-network', 'line-color', [
      'interpolate',
      ['linear'],
      ['to-number', ['coalesce', ['get', 'maxspeed' + evt + ':forward'], ['get', 'maxspeed' + evt + ':backward']]],
      0,
      'red',
      24,
      'yellow',
      48,
      'lime',
      72,
      'cyan',
      96,
      'royalblue',
      120,
      'blue'
    ])
  }

  componentDidMount() {
    const host_url = window.location.href.replace(/#.*/, '')

    //container to put React generated content in
    this.tooltipContainer = document.createElement('div');

    this.map = new mapboxgl.Map({
      hash: 'map',
      container: this.mapRef.current,
      style: STYLE_ROAD_MAP,
      center: [-79.4512, 43.6568],
      zoom: 13
    });

    this.map.on('load', () => {
      
			this.map.addSource('roads', {
				type: 'vector',
				tiles: [host_url + "tile/{z}/{x}/{y}.pbf"],
				minzoom: 5,
				maxzoom: 12
      })

			this.map.addLayer({
				'id': 'road-network',
				'type': 'line',
				'source': 'roads',
				'source-layer': 'roads',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': [
						'case',
						['boolean', ['feature-state', 'hover'], false],
						'black',
						[
							'interpolate',
							['linear'],
							['to-number', ['coalesce', ['get', 'maxspeed0:forward'], ['get', 'maxspeed0:backward']]],
							0,
							'red',
							24,
							'yellow',
							48,
							'lime',
							72,
							'cyan',
							96,
							'royalblue',
							120,
							'blue'
						]
					],
					'line-width': 5,
					'line-blur': 1,
					'line-opacity': 0.8
				}
      }, 'road-label')

    })
    
    const tooltip = new mapboxgl.Marker(this.tooltipContainer, {
      offset: [-120, 0]
    }).setLngLat([0,0]).addTo(this.map);

    this.map.on('mousemove', (e) => {
      const features = this.map.queryRenderedFeatures(e.point);
      tooltip.setLngLat(e.lngLat);
      this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      this.setTooltip(features);
    });

    this.map.addControl(
      new MapboxDirections({
        accessToken: MAPBOX_ACCESS_TOKEN
      }),
      'top-left'
    );
  };
  
  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    return (
      <div>
        <div ref={this.mapRef} className="map absolute top right left bottom" />
        <div className="roadInfo">
          <div className="information">
            <h2>Road Link Information</h2>
            <div className="info">
              <p>Zoom in and hover over a road link for info</p>
            </div>
          </div>
          <div className="traffic">
            <h3>Traffic</h3>
            <input
              type="range"
              ref={this.rangeInput}
              className="traffic-window"
              name="traffic-window"
              min="0"
              max="7"
              list="tickmarks"
              defaultValue="0"
              onChange={event => this.handleChange(event)}
            />
            <label htmlFor="traffic-window">{this.state.trafficLevel}</label>
          </div>
        </div>
        <datalist id="tickmarks">
          <option value="0"></option>
          <option value="1"></option>
          <option value="2"></option>
          <option value="3"></option>
          <option value="4"></option>
          <option value="5"></option>
          <option value="6"></option>
          <option value="7"></option>
        </datalist>
      </div>
    );
  };
}