import React, { useEffect, useState } from "react";
import { Navbar, Button } from "react-bootstrap";
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
    <Navbar>
        <Navbar.Brand >Welcome, {props.user.name + " " + props.user.surname}</Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
             <Button variant="primary" onClick={(ev)=> handleLogout(ev)}> Logout</Button>
        </Navbar.Collapse>
    </Navbar>
  );
};
