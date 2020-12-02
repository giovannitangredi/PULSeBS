// Import deps
import React, { useEffect, useState } from "react";
import { ReservationPage } from "./ReservationPage";
import StudentList from "./StudentList";
import { NavBar } from "./NavBar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import axios from "axios";
import { LoginPage } from "./LoginPage";
import { CourseDetail } from './CourseDetail'
// Import styles
import "./../styles/styles.css";
// Create App component
export const App = () => {
  const [authUser, setAuthUser] = useState({});
  const [loading, setLoading] = useState(false);
  const getUser = () => {
    axios
      .get("/user/")
      .then((res) => {
        if (res.data.id) setAuthUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setAuthUser({});
        setLoading(false);
      });
  };
  const login = (result) => {
    console.log(result);
    setAuthUser(result);
  };
  const logout = () => {
    setLoading(true);
    setAuthUser({});
    setLoading(false);
  };
  useEffect(() => {
    setLoading(true);
    getUser();
  }, []);
  if (loading) return <p>Page is Loading...</p>;
  return (
    <Router>
      <div className="app">
        {authUser.id && <NavBar user={authUser} logout={logout}></NavBar>}
        <hr></hr>
        <Switch>
          <Route path="/login">
            {authUser.id && authUser.role === "student" && (
              <Redirect to="/student"></Redirect>
            )}
            {authUser.id && authUser.role === "teacher" && (
              <Redirect to="/teacher"></Redirect>
            )}
            <LoginPage login={login} user={authUser}></LoginPage>
          </Route>
          <Route path="/student">
            {!authUser.id && <Redirect to="/login"></Redirect>}
            {authUser.id && authUser.role === "teacher" && (
              <Redirect to="/teacher"></Redirect>
            )}
            <ReservationPage user={authUser}></ReservationPage>
          </Route>
          <Route path="/teacher">
            {!authUser.id && <Redirect to="/login"></Redirect>}
            <StudentList user={authUser} userid={authUser.id} />
          </Route>
          <Route path="/" exact>
            {!authUser.id && <Redirect to="/login"></Redirect>}
            {authUser.id && authUser.role === "student" && (
              <Redirect to="/student"></Redirect>
            )}
            {authUser.id && authUser.role === "teacher" && (
              <Redirect to="/teacher"></Redirect>
            )}
          </Route>
          <Route path="/courseId/detail">
          { !authUser.id && <Redirect to="/login"></Redirect>}
            {authUser.id && authUser.role !== "teacher" && (
              <Redirect to="/"></Redirect>
            )}
            <CourseDetail> user={authUser} userid={authUser.id} </CourseDetail>
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
