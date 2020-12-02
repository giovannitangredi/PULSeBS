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
// Import styles
import "./../styles/styles.css";
// Create App component
export const App = () => {
  /* https://cloford.com/resources/colours/500col.htm */
  const colors = [
    "#FFB6C1",
    "#FFAEB9",
    "#EEA2AD",
    "#CD8C95",
    "#FFC0CB",
    "#FFB5C5",
    "#EEA9B8",
    "#CD919E",
    "#DB7093",
    "#FF82AB",
    "#EE799F",
    "#CD6889",
    "#FF3E96",
    "#FF69B4",
    "#FF6EB4",
    "#FF1493",
    "#FF34B3",
    "#EE30A7",
    "#C71585",
    "#DA70D6",
    "#FF83FA",
    "#EE7AE9",
    "#CD69C9",
    "#D8BFD8",
    "#FFE1FF",
    "#EED2EE",
    "#FFBBFF",
    "#DDA0DD",
    "#EE82EE",
    "#FF00FF",
    "#EE00EE",
    "#BA55D3",
    "#E066FF",
    "#D15FEE",
    "#B452CD",
    "#7A378B",
    "#9400D3",
    "#9932CC",
    "#BF3EFF",
    "#B23AEE",
    "#8470FF",
    "#7B68EE",
    "#6A5ACD",
    "#836FFF",
    "#F8F8FF",
    "#4169E1",
    "#4876FF",
    "#436EEE",
    "#3A5FCD",
    "#6495ED",
    "#B0C4DE",
    "#CAE1FF",
    "#BCD2EE",
    "#A2B5CD",
    "#6E7B8B",
    "#778899",
    "#708090",
    "#C6E2FF",
    "#B9D3EE",
    "#9FB6CD",
    "#6C7B8B",
    "#1C86EE",
    "#F0F8FF",
    "#4682B4",
    "#63B8FF",
    "#5CACEE",
    "#4F94CD",
    "#87CEFA",
    "#B0E2FF",
    "#A4D3EE",
    "#8DB6CD",
    "#87CEFF",
    "#7EC0EE",
    "#6CA6CD",
    "#87CEEB",
    "#00BFFF",
    "#00B2EE",
    "#009ACD",
    "#33A1C9",
    "#ADD8E6",
    "#BFEFFF",
    "#B2DFEE",
    "#9AC0CD",
    "#B0E0E6",
    "#98F5FF",
    "#8EE5EE",
    "#7AC5CD",
    "#00F5FF",
    "#00E5EE",
    "#00C5CD",
    "#5F9EA0",
    "#00CED1",
    "#F0FFFF",
    "#E0FFFF",
    "#BBFFFF",
    "#AEEEEE",
    "#96CDCD",
    "#97FFFF",
    "#8DEEEE",
    "#79CDCD",
    "#00FFFF",
    "#00EEEE",
    "#00CDCD",
    "#008B8B",
    "#008080",
    "#48D1CC",
    "#20B2AA",
    "#03A89E",
    "#40E0D0",
    "#00C78C",
    "#7FFFD4",
    "#76EEC6",
    "#66CDAA",
    "#00FA9A",
    "#F5FFFA",
    "#00FF7F",
    "#00EE76",
    "#00CD66",
    "#3CB371",
    "#54FF9F",
    "#4EEE94",
    "#43CD80",
    "#BDFCC9",
    "#F0FFF0",
    "#8FBC8F",
    "#C1FFC1",
    "#B4EEB4",
    "#9BCD9B",
    "#98FB98",
    "#9AFF9A",
    "#90EE90",
    "#7CCD7C",
    "#32CD32",
    "#00FF00",
    "#00EE00",
    "#00CD00",
    "#7CFC00",
    "#7FFF00",
    "#76EE00",
    "#66CD00",
    "#458B00",
    "#ADFF2F",
    "#CAFF70",
    "#BCEE68",
    "#A2CD5A",
    "#6E8B3D",
    "#6B8E23",
    "#C0FF3E",
    "#B3EE3A",
    "#9ACD32",
    "#698B22",
    "#FFFFF0",
    "#EEEEE0",
    "#CDCDC1",
    "#F5F5DC",
    "#FFFFE0",
    "#EEEED1",
    "#FAFAD2",
    "#FFFF00",
    "#EEEE00",
    "#CDCD00",
    "#BDB76B",
    "#FFF68F",
    "#EEE685",
    "#CDC673",
    "#F0E68C",
    "#EEE8AA",
    "#FFFACD",
    "#EEE9BF",
    "#FFEC8B",
    "#EEDC82",
    "#CDBE70",
    "#E3CF57",
    "#FFD700",
    "#EEC900",
    "#CDAD00",
    "#FFF8DC",
    "#EEE8CD",
    "#CDC8B1",
    "#DAA520",
    "#FFC125",
    "#EEB422",
    "#CD9B1D",
    "#B8860B",
    "#FFB90F",
    "#EEAD0E",
    "#CD950C",
    "#FFA500",
    "#EE9A00",
    "#CD8500",
    "#FFFAF0",
    "#FDF5E6",
    "#F5DEB3",
    "#FFE7BA",
    "#EED8AE",
    "#CDBA96",
    "#FFE4B5",
    "#FFEFD5",
    "#FFEBCD",
    "#FFDEAD",
    "#EECFA1",
    "#CDB38B",
    "#FCE6C9",
    "#D2B48C",
    "#FF9912",
    "#FAEBD7",
    "#FFEFDB",
    "#EEDFCC",
    "#CDC0B0",
    "#DEB887",
    "#FFD39B",
    "#EEC591",
    "#CDAA7D",
    "#FFE4C4",
    "#EED5B7",
    "#CDB79E",
    "#E3A869",
    "#ED9121",
    "#FF8C00",
    "#FF7F00",
    "#EE7600",
    "#CD6600",
    "#FF8000",
    "#FFA54F",
    "#EE9A49",
    "#CD853F",
    "#FAF0E6",
    "#FFDAB9",
    "#EECBAD",
    "#CDAF95",
    "#8B7765",
    "#FFF5EE",
    "#EEE5DE",
    "#F4A460",
    "#C76114",
    "#D2691E",
    "#FF7F24",
    "#EE7621",
    "#CD661D",
    "#FF7D40",
    "#FF6103",
    "#FF8247",
    "#EE7942",
    "#CD6839",
    "#FFA07A",
    "#EE9572",
    "#CD8162",
    "#FF7F50",
    "#FF4500",
    "#EE4000",
    "#E9967A",
    "#FF8C69",
    "#EE8262",
    "#CD7054",
    "#FF7256",
    "#EE6A50",
    "#CD5B45",
    "#8B8989",
    "#BC8F8F",
    "#FFC1C1",
    "#EEB4B4",
    "#CD9B9B",
    "#F08080",
    "#CD5C5C",
    "#FF6A6A",
    "#EE6363",
    "#CD5555",
    "#FF4040",
    "#EE3B3B",
    "#CD3333",
    "#FF3030",
    "#EE2C2C",
    "#CD2626",
    "#FF0000",
    "#CD0000",
    "#8E388E",
    "#7171C6",
    "#7D9EC0",
    "#388E8E",
    "#71C671",
    "#8E8E38",
    "#C5C1AA",
    "#C67171",
  ];
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
            <StudentList user={authUser} userid={authUser.id} colors={colors} />
          </Route>
          <Route path="/">
            {!authUser.id && <Redirect to="/login"></Redirect>}
            {authUser.id && authUser.role === "student" && (
              <Redirect to="/student"></Redirect>
            )}
            {authUser.id && authUser.role === "teacher" && (
              <Redirect to="/teacher"></Redirect>
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
