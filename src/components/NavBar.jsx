import React from "react";
import { Navbar, Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
export const NavBar = (props) => {
  const handleLogout = (ev) => {
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
    <Navbar>
        <Navbar.Brand >Welcome, {props.user.name + " " + props.user.surname}</Navbar.Brand>
        <Nav >
        {props.user.role === "teacher"? <NavLink to="/teacher" className="nav-link" >Home</NavLink>: <NavLink to="/student">Home</NavLink>}

        </Nav>
        <Nav>
        {props.user.role === "teacher" && <NavLink to="/courseId/detail" className="nav-link">Statistics</NavLink>}</Nav>
        <Navbar.Collapse className="justify-content-end">
             <Button variant="primary" onClick={(ev)=> handleLogout(ev)}> Logout</Button>
        </Navbar.Collapse>
    </Navbar>
  );
};
