import React, { useEffect, useState } from "react";
import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";

export const ManagerPage = (props: any) => {

    const [loading, setLoading] = useState(false);
    const [systemStats, setsystemStats] = useState<any>([]);
    const [lectureStats, setLectureStats] = useState<any>([]);
    const [courseSumStats, setcourseSumStats] = useState<any>([]);
    const [courseLectureStats, setcourseLectureStats] = useState<any>([]);
    

    const getSystemStats = () => {  //get the sum of booking, cancellations, attendance for all lectures
        axios
        .get(`/stats/systemStats`)
        .then((res) => {
            let systemStats = res.data;
            setsystemStats(systemStats);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
          });
    }

    const getLectureStats = () => { //get a list of all lectures with booking, cancellations, attendance stats
        axios
        .get(`/stats/lecturesStats`)
        .then((res) => {
            let lectureStats = res.data;
            setLectureStats(lectureStats);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
          });
    }

    const getCourseSumStats = (courseId: any) => {  //get the sum of booking, cancellations, attendance for all lecturs of a specific course
        axios
        .get(`/${courseId}/stats`)
        .then((res) => {      
            let courseSumStats = res.data;
            setcourseSumStats(courseSumStats);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
          });
    }

    const getCourseLectureStats = (courseId: any) => {  //get a list of all lectures of a specific course with booking, cancellations, attendance stats
        axios
        .get(`/${courseId}/lectureStats`)
        .then((res) => {
            let courseLectureStats = res.data;
            setcourseLectureStats(courseLectureStats);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
            setLoading(false);
          });
    }
/*
    const getBookingStats = (courseId: any) => {    //similar to getCourseLectureStats -> return the number of bookings for all the lectures of the course courseid
        axios
          .get(`/courses/${courseId}/bookings`)
          .then((res) => {
            let lectures = res.data; 
            setLoading(false);
            //bookedLectures
          })
          .catch((err) => {
            console.log(err);  
            setLoading(false);   
          });
      };*/
      const getLecturesPerWeek = (courseId: any,weekDate: any) => { //return the number of bookings for all the lectures of the course courseid scheduled for the week
        axios
          .get(`/courses/${courseId}/bookings=?week=${weekDate}`)
          .then((res) => {
            let courseLectureStats = res.data;
            setcourseLectureStats(courseLectureStats);
            setLoading(false);
           // weeklyBooked
          })
          .catch((err) => {
            console.log(err); 
            setLoading(false); 
          });
      };
      const getLecturesPerMonth = (courseId: any,monthDate: any) => {   //return the number of bookings for all the lectures of the course courseid scheduled for the month
        axios
          .get(`/courses/${courseId}/bookings=?month=${monthDate}`)
          .then((res) => {
            setLoading(false);
            let courseLectureStats = res.data;
            setcourseLectureStats(courseLectureStats);
            //monthlyBooked
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      };

    useEffect(() => {
      setLoading(true);
      getSystemStats();
    }, []);
  
    if (loading) return <div>Page is loading...</div>;
    return (
        <Container></Container>
    );
}