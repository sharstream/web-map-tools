import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import axios from "../utils/api";

export default function TerritoryMap() {

    const [viewport, setViewport] = useState({
        latitude: 43.6568,
        longitude: -79.4512,
        width: "100vw",
        height: "100vh",
        zoom: 13
    });

    const [data, setData] = useState({ features: []});

    useEffect(() => {//React.useEffect side effect hooks
        return async () => {
            const result = await axios.get("/features");
            console.log("features data response from the axios server:")
            setData(result)
        }
    })

    return (
        <div>
            <ReactMapGL
                {...viewport}
                mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/davekitsune/ck8jibzps05xa1inohetggy6f"
                onViewportChange={viewport => {
                    setViewport(viewport)
                }}
            >
               
            </ReactMapGL>
        </div>
    )
}