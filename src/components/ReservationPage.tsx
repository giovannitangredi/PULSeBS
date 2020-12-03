import React, { useEffect, useState } from "react";
import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import ReservationCalendar from "./ReservationCalendar";
import Container from "react-bootstrap/Container";
import axios from "axios";
export const ReservationPage = (props: any) => {
  const getBookedLectures = () => {
    axios
      .get("/lectures/previousbooking")
      .then((res) => {
        let lectures = [...res.data];
        let now = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        let date = new Date();
        date.setDate(date.getDate() + 14);
        let deadline = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
        let l2w = lectures.filter(
          (el: any) => el.start >= now && el.start <= deadline
        );
        setBookedLectures(lectures);
        setBookedLectures2weeks(l2w);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const getReservations = () => {
    axios
      .get(`/lectures/bookable`)
      .then((res) => {
        let lectures = res.data;
        let now = new Date()
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        let date = new Date();
        date.setDate(date.getDate() + 14);
        let deadline = date.toISOString().replace(/T/, " ").replace(/\..+/, "");
        let l2w = lectures.filter(
          (el: any) => el.start >= now && el.start <= deadline
        );
        setLectures(lectures);
        setLectures2weeks(l2w);
        getBookedLectures();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const bookLecture = (lectureID: any) => {
    setLoading(true);
    axios
      .post(`/lectures/${lectureID}/book`, { lecture_id: lectureID })
      .then((res) => {
        getReservations();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const cancelBooking = (lectureID: any) => {
    setLoading(true);
    axios
      .delete(`/lectures/${lectureID}/cancelbook`)
      .then((res) => {
        getReservations();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  /* let FacReservations = [{course : "Softwere Engeneering 2", booked_students :20,capacity: 45, id:1 ,start:  "2020-11-11:08:30:00", end : "2020-11-11:11:00:00", lecturer : "Mario Rossi", name : "Lecture 1" },
      {course : "Softwere Engeneering 2",booked_students :3, capacity: 45,id:2 ,start: "2020-11-14:08:30:00",end: "2020-11-14:11:00:00",lecturer:"Mario Rossi",name:"Lecture 2"},
      {course : "Web Application 1",booked_students :43,capacity: 61 ,id:3 ,start: "2020-11-12:08:30:00",end: "2020-11-12:11:00:00",lecturer:"Valeria Verdi",name:"Lecture 1"}];*/
  const [bookedLectures, setBookedLectures] = useState<any>([]);
  const [lectures, setLectures] = useState<any>([]);
  const [bookedLectures2weeks, setBookedLectures2weeks] = useState<any>([]);
  const [lectures2weeks, setLectures2weeks] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getReservations();
  }, []);

  if (loading) return <div>Page is loading...</div>;
  return (
    <Container>
      <h1>Book a Lecture</h1>
      {lectures2weeks.length===0 && <h2>There are no bookable in 2 weeks to show</h2>}
      { lectures2weeks.length!== 0 &&
      <BookingLectureList
        lectures={lectures2weeks}
        bookLecture={bookLecture}
      ></BookingLectureList>
    }
      <hr></hr>
      <h1>Booked Lectures</h1>
      {bookedLectures2weeks.length===0 && <h2>There are no booked in 2 weeks to show</h2>}
      { bookedLectures2weeks.length!== 0 &&
      <BookedLectureList
        lectures={bookedLectures2weeks}
        cancelBooking={cancelBooking}
      ></BookedLectureList>
      }
      <ReservationCalendar
        bookedLectures={bookedLectures}
        lectures={lectures}
        bookLecture={bookLecture}
      />
    </Container>
  );
};
