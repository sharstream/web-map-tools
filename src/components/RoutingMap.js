import React from 'react';
import ReactDOM from 'react-dom';
import './RoutingMap.css';
import mapboxgl from 'mapbox-gl';
import Tooltip from './RoadTooltip.js'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGNhcm5lcyIsImEiOiI4SnZsSU93In0.-HxSBuQgYtltYG86SvN2mg';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const STYLE_ROAD_MAP = 'mapbox://styles/mapbox/streets-v11';

export default class RoutingMap extends React.Component {
  
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      lng: -79.4512,
      lat: 43.6568,
      zoom: 13,
      minzoom: 5,
      maxzoom: 12
    };
  }

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
  }

  componentDidMount() {

    //container to put React generated content in
    this.tooltipContainer = document.createElement('div');
    const mapContainer = this.mapRef.current;
    this.map = new mapboxgl.Map({
      hash: 'map',
      container: mapContainer,
      style: STYLE_ROAD_MAP,
      center: [this.state.lng, this.state.lat],
      zoom: this.zoom
    });

    const road_link_info = new mapboxgl.Marker(this.tooltipContainer,{
      offset: [-120, 0]
    }).setLngLat([0,0]).addTo(this.map);

    this.map.on('mousemove', (e) => {
      const features = this.map.queryRenderedFeatures(e.point);
      road_link_info.setLngLat(e.lngLat);
      this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      this.setTooltip(features);
    })

    const MapboxDirections = window.MapboxDirections
    this.map.addControl(
      new MapboxDirections({
        accessToken: MAPBOX_ACCESS_TOKEN
      }),
      'top-left'
    );
  };

  __change_traffic(value) {

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
              className="traffic-window"
              name="traffic-window"
              min="0"
              max="7"
              list="tickmarks"
              defaultValue="0"
              onInput={this.__change_traffic(this.value)}
            />
            <label htmlFor="traffic-window">0</label>
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
  }
}