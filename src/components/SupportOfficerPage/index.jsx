import React from "react";
import { Col, Row, Tab, ListGroup, Container } from "react-bootstrap";
import { DataSetup } from "./DataSetup";
import { Schedule } from "./Schedule";
import { UpdateBookable } from "./UpdateBookable";
export const SupportOfficerPage = () => {
  return (
    <Tab.Container defaultActiveKey="#system-setup">
      <Container className="py-3 col-3 mx-0 px-3 d-flex justify-content-center">
        <h1>System setup</h1>
      </Container>
      <Row className="px-3 m-0">
        <Col sm={3}>
          <ListGroup>
            <ListGroup.Item action href="#system-setup">
              Students, Teachers, Courses, Enrollments
            </ListGroup.Item>
            <ListGroup.Item action href="#schedule">
              Schedule
            </ListGroup.Item>
            <ListGroup.Item action href="#update-bookable">
              Update Bookable Lectures
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            <Tab.Pane eventKey="#system-setup">
              <DataSetup />
            </Tab.Pane>
            <Tab.Pane eventKey="#schedule">
              <Schedule />
            </Tab.Pane>
            <Tab.Pane eventKey="#update-bookable">
              <UpdateBookable />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
};
