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
import axios from "axios";
import {LoginPage} from "./LoginPage"
// Import styles
import "./../styles/styles.css";
// Create App component
export const App = () => {
  const [authUser,setAuthUser] = useState({});
  const [loading,setLoading]= useState(false);
  const getUser = ()=>{
    axios
    .get('/user/')
    .then(res=>{
        if(res.data.id)
          setAuthUser(res.data);
        setLoading(false);
    });
  }
  const login = (result)=>{
    console.log(result);
    setAuthUser(result);
  }
  useEffect(()=>{
    setLoading(true);
    getUser();
  },[])
  if(loading)
    return(<p>Page is Loading...</p>)
  return (
    <Router>
      <div className="app">
      <Switch>
        <Route path = "/login">
        {authUser.id && authUser.role==="student" && <Redirect to ="/student"></Redirect>}
        {authUser.id && authUser.role==="teacher" && <Redirect to ="/teacher"></Redirect>}
        <LoginPage login={login} user={authUser}></LoginPage>
        </Route>
        <Route path = "/student">
            {(!authUser.id) && <Redirect to="/login"></Redirect> }
            {(authUser.id && authUser.role=="teacher") && <Redirect to="/teacher"></Redirect> }
            <ReservationPage user={authUser}></ReservationPage>
        </Route>
        <Route path="/teacher">
        {!authUser.id && <Redirect to ="/login"></Redirect>}
          <h1>TEACHER PAGE PLACEHOLDER</h1>
        </Route>
        <Route path="/">
          {!authUser.id && <Redirect to ="/login"></Redirect>}
          {authUser.id && authUser.role==="student" && <Redirect to ="/student"></Redirect>}
          {authUser.id && authUser.role==="teacher" && <Redirect to ="/teacher"></Redirect>}
        </Route>
      </Switch>
      
      </div>
    </Router>
  );
};
