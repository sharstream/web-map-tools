import React from "react";
import { Route } from "react-router-dom";
import Home from "./components/Home";
import Nav from "./components/Nav";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, ListGroup, Tab } from "react-bootstrap";
import RoutingMap from "./components/RoutingMap";
import TerritoryMap from "./components/TerritoryMap";

export default class App extends React.Component {
    render() {
        return (
            <>
                <Container fluid style={{ paddingLeft: "0px", paddingRight:"0px"}}>
                    <Row>
                        <Col>
                            <Nav />
                            <Route path="/" exact component={Home} />
                        </Col>
                    </Row>
                </Container>
                <Container fluid style={{ paddingLeft: "0px", paddingRight:"0px", display: "grid"}}>

                    <Tab.Container
                        fluid
                        id="list-group-tabs-example"
                        defaultActiveKey="#link1"
                    >
                        <Row>
                            <Col sm={4}>
                                <ListGroup>
                                    <ListGroup.Item action href="#link1">
                                        Routing Optimization
                                    </ListGroup.Item>
                                    <ListGroup.Item action href="#link2">
                                        Territory Optimization
                                    </ListGroup.Item>
                                    <ListGroup.Item action href="#link3">
                                        Map Coverage
                                    </ListGroup.Item>
                                    <ListGroup.Item action href="#link4">
                                        Upload GeoJSON
                                    </ListGroup.Item>
                                    <ListGroup.Item action href="#link5">
                                        Route Inspector
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col sm={8} style={{ marginLeft: "inherit" }}>
                                <Tab.Content style={{}}>
                                    <Tab.Pane eventKey="#link1">
                                        <Route
                                            path="/"
                                            component={RoutingMap}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="#link2">
                                        <Route
                                            path="/"
                                            component={TerritoryMap}
                                        ></Route>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Container>
            </>
        );
    }
}
