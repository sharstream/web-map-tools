import React from "react";
import ReactDOM from "react-dom";
import './index.css';
import App from "./App.js";
import { BrowserRouter as Router, Route } from "react-router-dom";

ReactDOM.render(
    <Router>
        <Route component={App} />
    </Router>,
    document.getElementById("app")
);
