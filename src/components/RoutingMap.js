import React from 'react';
import ReactDOM from 'react-dom';
import './RoutingMap.css';
import mapboxgl from 'mapbox-gl';
import Tooltip from './RoadTooltip.js'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGNhcm5lcyIsImEiOiI4SnZsSU93In0.-HxSBuQgYtltYG86SvN2mg';
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const STYLE_ROAD_MAP = 'mapbox://styles/mapbox/streets-v11';

export default class RoutingMap extends React.Component {
  
  mapRef = React.createRef()

  constructor(props) {
    super(props);
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

    const map = new mapboxgl.Map({
      hash: 'map',
      container: this.mapRef.current,
      style: STYLE_ROAD_MAP,
      center: [this.state.lng, this.state.lat],
      zoom: 13
    });

    const road_link_info = new mapboxgl.Marker(this.tooltipContainer,{
      offset: [-120, 0]
    }).setLngLat([0,0]).addTo(map);

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      road_link_info.setLngLat(e.lngLat);
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      this.setTooltip(features);
    })

    const MapboxDirections = window.MapboxDirections
    map.addControl(
      new MapboxDirections({
        accessToken: MAPBOX_ACCESS_TOKEN
      }),
      'top-left'
    );
  };

  render() {
    return (
      <div>
        <div ref={this.mapRef} className="map absolute top right left bottom" />
        <div className="roadInfo">
          <div className="information">
            <h2>Road Link Information</h2>
            <div className='info'>
              <p>Zoom in and hover over a road link for info</p>
            </div>
          </div>
          <div className='traffic'>
            <h3>Traffic</h3>
            <input type="range" className="traffic-window" name="traffic-window" min="0" max="7" list="tickmarks" value="0"
              oninput="change_traffic(this.value)" />
            <label for="traffic-window">0</label>
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