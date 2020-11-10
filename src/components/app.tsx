// Import deps
import React, { useEffect, useState } from "react";
import {ReservationPage} from "./ReservationPage"
// Import styles
import "./../styles/styles.css";

// Create App component
export const App = () => {
  let FacReservations = [{course : "Softwere Engeneering 2", booked_students :20,capacity: 45, id:1 ,start:  "2020-11-11:08:30:00", end : "2020-11-11:11:00:00", lecturer : "Mario Rossi", name : "Lecture 1" },
{course : "Softwere Engeneering 2",booked_students :3, capacity: 45,id:2 ,start: "2020-11-14:08:30:00",end: "2020-11-14:11:00:00",lecturer:"Mario Rossi",name:"Lecture 2"},
{course : "Web Application 1",booked_students :43,capacity: 61 ,id:3 ,start: "2020-11-12:08:30:00",end: "2020-11-12:11:00:00",lecturer:"Valeria Verdi",name:"Lecture 1"}];
  const [bookedLectures,setBookedLectures] = useState<any>([]);
  const [lectures,setLectures] = useState<any>([]);
  const [loading,setLoading]= useState(false);
  const getReservations = ()=>{
    setLoading(true);
    setLectures(FacReservations);
    setBookedLectures(FacReservations);
    setLoading(false)
  }
  const bookLecture = (lectureID : any,studentID : any) =>{
    //TO DO
    console.log(lectureID);
  }
  if(loading)
    return(<div>Page is loading...</div>)
  return <div className="app">
    <ReservationPage bookedLectures = {bookedLectures} lectures={lectures} getReservations={getReservations} bookLecture = {bookLecture}></ReservationPage>
  </div>;
};
