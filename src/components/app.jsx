// Import deps
import React, { useEffect, useState } from "react";
import { ReservationPage } from "./ReservationPage";
import StudentList from "./StudentList";
import { ManagerPage } from "./ManagerPage";
import { NavBar } from "./NavBar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { CourseDetail } from './TeacherStatistics'
import { LoginPage } from "./LoginPage";
// Import styles
import "./../styles/styles.css";
// Create App component

export const App = (props) => {
  const [authUser, setAuthUser] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();
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

  const redirectToIfLoggedIn = () => {
    const redirect = authUser.id ? `/${authUser.role}` : "/login";
    if (!location.pathname.startsWith(redirect))
      return <Redirect to={redirect}></Redirect>;
    return null;
  };

  if (loading) return <p>Page is Loading...</p>;
  return (
    <Router>
      <div className="app">
        {authUser.id && <NavBar user={authUser} logout={logout}></NavBar>}
        <hr></hr>
        <Switch>
          <Route path="/login">
            {redirectToIfLoggedIn()}
            <LoginPage login={login} user={authUser}></LoginPage>
          </Route>
          <Route path="/student">
            {redirectToIfLoggedIn()}
            <ReservationPage user={authUser}></ReservationPage>
          </Route>
          <Route exact path="/teacher">
            {redirectToIfLoggedIn()}
            <StudentList user={authUser} userid={authUser.id} />
          </Route>
          <Route exact path="/teacher/statistics">
            {redirectToIfLoggedIn()}
            <CourseDetail user={authUser} userid={authUser.id}/>
          </Route>
          <Route path="/manager">
            {redirectToIfLoggedIn()}
            <ManagerPage />
          </Route>
          <Route path="/">{redirectToIfLoggedIn()}</Route>
        </Switch>
      </div>
    </Router>
  );
};
