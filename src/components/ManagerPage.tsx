import React, { useEffect, useState } from "react";
import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Tab, Table, Tabs } from "react-bootstrap";

interface SystemStats {
  attendances: number;
  bookings: number;
  cancellations: number;
}

interface LectureStats {
  attendances: number;
  bookings: number;
  cancellations: number;
  course: string;
  date: Date;
  lecture: string;
};

/*
interface LectureStats {
  attendances: number;
  bookings: number;
  cancellations: number;
  course: string;
  date: Date;
  lecture: string;
};

*/

export const ManagerPage = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>();
  const [lectureStats, setLectureStats] = useState<LectureStats[]>([]);
  const [courseSumStats, setCourseSumStats] = useState<any>([]);
  const [courseLectureStats, setCourseLectureStats] = useState<any>([]);

  const getSystemStats = () => {
    //get the sum of booking, cancellations, attendance for all lectures
    axios
      .get(`/stats/systemStats`)
      .then((res) => {
        let systemStats: SystemStats = res.data;
        console.log(systemStats); 
        setSystemStats(systemStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getLectureStats = () => {
    //get a list of all lectures with booking, cancellations, attendance stats
    axios
      .get(`/stats/lecturesStats`)
      .then((res) => {
        let lectureStats: LectureStats[] = res.data;
        console.log(lectureStats);
        setLectureStats(lectureStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseSumStats = (courseId: any) => {
    //get the sum of booking, cancellations, attendance for all lecturs of a specific course
    axios
      .get(`/${courseId}/stats`)
      .then((res) => {
        let courseSumStats = res.data;
        setCourseSumStats(courseSumStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseLectureStats = (courseId: number) => {
    //get a list of all lectures of a specific course with booking, cancellations, attendance stats
    axios
      .get(`/${courseId}/lectureStats`)
      .then((res) => {
        let courseLectureStats = res.data;
        setCourseLectureStats(courseLectureStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
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
  const getLecturesPerWeek = (courseId: number, weekDate: any) => {
    //return the number of bookings for all the lectures of the course courseid scheduled for the week
    axios
      .get(`/courses/${courseId}/bookings=?week=${weekDate}`)
      .then((res) => {
        let courseLectureStats = res.data;
        setCourseLectureStats(courseLectureStats);
        setLoading(false);
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const getLecturesPerMonth = (courseId: number, monthDate: any) => {
    //return the number of bookings for all the lectures of the course courseid scheduled for the month
    axios
      .get(`/courses/${courseId}/bookings=?month=${monthDate}`)
      .then((res) => {
        setLoading(false);
        let courseLectureStats = res.data;
        setCourseLectureStats(courseLectureStats);
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
    getLectureStats();
  }, []);

  if (loading) return <div>Page is loading...</div>;
  return (
    <Container>
      <Tabs defaultActiveKey="general" id="uncontrolled-tab-example">
        <Tab eventKey="general" title="All Lectures">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course ({new Set<string>(lectureStats.map((lecture: LectureStats) => lecture.course)).size})</th>
                <th>Lecture ({lectureStats.length})</th>
                <th>Date</th>
                <th>Bookings ({systemStats?.bookings})</th>
                <th>Cancellations ({systemStats?.cancellations})</th>
                <th>Attendances ({systemStats?.attendances})</th>
              </tr>
            </thead>
            <tbody>
              {lectureStats.map((lecture: LectureStats, index: number) => (<tr key={index}>
                <td>{lecture.course}</td>
                <td>{lecture.lecture}</td>
                <td>{lecture.date}</td>
                <td>{lecture.bookings}</td>
                <td>{lecture.cancellations}</td>
                <td>{lecture.attendances}</td>
              </tr>))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="lecture" title="By Lecture"></Tab>
        <Tab eventKey="contact" title="Contact" disabled></Tab>
      </Tabs>
    </Container>
  );
};
