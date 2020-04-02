import React from 'react';
import PropTypes from 'prop-types';

export default class TrafficPanel extends React.Component {
    static propTypes = {
        features: PropTypes.array.isRequired,
        map: PropTypes.object
    };

    getInitialState = () => ({ hover: null })

    _onMouseMove(evt) {
        evt.preventDefault();
        // clasify an event when mousemove or hover
        // fire the event
        // capture the class attribute 'road-network'
        // return true or false to finish the evt call

        //mouseMove event function
        if (this.state.hover) {
            this.props.map.on('mousemove', 'road-network', (e) => {
                if (e.features.length > 0) {
                    this.props.map.getCanvas().style.cursor = 'pointer'
        
                    let road = e.features[0]
                    let info = '<p><strong>id:</strong> ' + road.id + '</p>'
                    for (const p in road.properties) {
                        info += '<p><strong>' + p + ':</strong> ' + road.properties[p] + '</p>'
                    }
                    document.getElementById('info').innerHTML = info
        
                    if (this.state.hover) {
                        this.props.map.setFeatureState(
                            { source: 'roads', sourceLayer: 'roads', id: this.state.hover },
                            { hover: false }
                        )
                    }
                    this.setState({ hover: road.id });
                    this.props.map.setFeatureState(
                        { source: 'roads', sourceLayer: 'roads', id: this.state.hover },
                        { hover: true }
                    )
                }
            })
        }
    }

    _onMouseLeave(evt) {
        evt.preventDefault();
        //mouseLeave event function

        this.props.map.on('mouseleave', 'road-network', function () {
            this.props.map.getCanvas().style.cursor = '';
            if (this.state.hover) {
                this.props.map.setFeatureState(
                    { source: 'roads', sourceLayer: 'roads', id: this.state.hover },
                    { hover: false }
                )
            }
            this.setState({ hover: null })
        })
    }

    // update the component's state to reflect whether the mouse is inside the component 
    // then use the state value to conditionally render a 
    // <div className="info">Traffic Network Panel</div> component
    render() {
        const { features } = this.props;
        const renderInfo = (feature, index) => {
            return (
                <div key={index} onMouseMove = {(event) => this._onMouseMove(event, this.state.hover)}>
                    <p><strong>{'id:'}</strong>{feature}</p>
                </div>
            )
        }
        
        return (
            <>
                {
                    this.state.hover 
                    ?   features.map(renderInfo)
                    :   <div>onMouseLeave = {(event) => this._onMouseLeave(event, this.state.hover)}></div>
                }
            </>
        )
    }
}