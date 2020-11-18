import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import axios from "axios";
export const NavBar = (props: any) => {
  const handleLogout = (ev: any) => {
    ev.preventDefault();
    axios
      .post("/auth/logout")
      .then((res) => {
        console.log("logout succefully");
        props.logout();
      })
      .catch((err) => {
        console.log("error in logout:" + err);
      });
  };
  const styles = {
    navbar: {
      backgroundColor: "#47FF4E",
    },
  };

  return (
    <Row style={styles.navbar}>
      <Col>
        <h1>Welcome , {props.user.name + " " + props.user.surname}</h1>
      </Col>
      <Col>
        <Button variant="primary" onClick={(ev) => handleLogout(ev)}>
          {" "}
          Logout
        </Button>
      </Col>
    </Row>
  );
};
