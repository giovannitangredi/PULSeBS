import React, { useEffect, useState } from "react";
import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
export const ReservationPage = (props: any) => {
  const getReservations = () => {
    setLoading(true);
    setLectures(FacReservations);
    setBookedLectures(FacReservations);
    setLoading(false);
  };
  let FacReservations = [
    {
      course: "Softwere Engeneering 2",
      booked_students: 20,
      capacity: 45,
      id: 1,
      start: "2020-11-11:08:30:00",
      end: "2020-11-11:11:00:00",
      lecturer: "Mario Rossi",
      name: "Lecture 1",
    },
    {
      course: "Softwere Engeneering 2",
      booked_students: 3,
      capacity: 45,
      id: 2,
      start: "2020-11-14:08:30:00",
      end: "2020-11-14:11:00:00",
      lecturer: "Mario Rossi",
      name: "Lecture 2",
    },
    {
      course: "Web Application 1",
      booked_students: 43,
      capacity: 61,
      id: 3,
      start: "2020-11-12:08:30:00",
      end: "2020-11-12:11:00:00",
      lecturer: "Valeria Verdi",
      name: "Lecture 1",
    },
  ];
  const [bookedLectures, setBookedLectures] = useState<any>([]);
  const [lectures, setLectures] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const bookLecture = (lectureID: any, studentID: any) => {
    //TO DO
    console.log(lectureID);
  };
  useEffect(() => {
    getReservations();
  }, []);

  if (loading) return <div>Page is loading...</div>;
  return (
    <Container>
      <h1>Book a Lecture</h1>
      <BookingLectureList
        lectures={lectures}
        bookLecture={bookLecture}
      ></BookingLectureList>
      <h1>Booked Lectures</h1>
      <BookedLectureList lectures={bookedLectures}></BookedLectureList>
    </Container>
  );
};
