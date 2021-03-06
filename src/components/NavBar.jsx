import React from "react";
import { Navbar, Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
export const NavBar = (props) => {
  const links = {
    teacher: [
      { title: "Home", path: "/teacher" },
      { title: "Statistics", path: "/teacher/statistics" },
    ],
    student: [{ title: "Home", path: "/student" }],
    manager: [
      { title: "Home", path: "/manager" },
      { title: "Contact Tracing", path: "/manager/contactTracing" },
    ],
    supportOfficer: [{ title: "Home", path: "/supportOfficer" }],
  };

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

  return (
    <Navbar>
      <Navbar.Brand>
        {`${props.user.name} ${props.user.surname}`} <u>{props.user.id}</u>
      </Navbar.Brand>
      <Nav>
        {props.user &&
          links[props.user.role].map((link) => (
            <NavLink key={link.title} to={link.path} exact className="nav-link">
              {link.title}
            </NavLink>
          ))}
      </Nav>

      <Navbar.Collapse className="justify-content-end">
        <Button variant="primary" onClick={(ev) => handleLogout(ev)}>
          {" "}
          Logout
        </Button>
      </Navbar.Collapse>
    </Navbar>
  );
};
