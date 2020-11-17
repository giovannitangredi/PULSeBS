// Import deps
import React, { useEffect, useState } from "react";
import { ReservationPage } from "./ReservationPage";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import {LoginPage} from "./LoginPage"
// Import styles
import "./../styles/styles.css";
// Create App component
export const App = () => {
  const [authUser,setAuthUser] = useState({});

  const login = (result)=>{
    console.log(result);
    setAuthUser(result);
  }
  return (
    <Router>
      <div className="app">
      <Switch>
        <Route path = "/login">
        <LoginPage login={login} user={authUser}></LoginPage>
        </Route>
        <Route path = "/student">
            <ReservationPage user={authUser}></ReservationPage>
        </Route>
        <Route path="/">
          {!authUser.id && <Redirect to ="/login"></Redirect>}
        </Route>
      </Switch>
      
      </div>
    </Router>
  );
};
