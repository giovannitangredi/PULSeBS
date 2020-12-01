import React, { useEffect, useState } from "react";
import { Table, Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import axios from "axios";
import { DatePickerComponent } from "./DatePickerComponent";

export const CourseDetail = (props) => {
  const getReservations = (courseid) => {
    axios
      .get(`/courses/${courseid}/bookings`)
      .then((res) => {
        let result = res.data;
        setMyCourses(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getLecturesPerWeek = (courseid, weekDate) => {
    axios
      .get(`/courses/${courseid}/bookings?week=${weekDate}`)
      .then((res) => {
        let lectures = res.data;
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getLecturesPerMonth = (courseid, monthDate) => {
    axios
      .get(`/courses/${courseid}/bookings?month=${monthDate}`)
      .then((res) => {
        let lectures = res.data;
        //monthlyBooked
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getLecturesPerWeek(courseId, "2020-47");
    getLecturesPerMonth(courseId, "2020-11");
    getReservations(courseId);
  }, []);
  const [courseId, setcourseId] = useState(1);
  const [myCourses, setMyCourses] = useState([]);
  const [bookedLectures, setBookedLectures] = useState([]);
  const [weeklyBooked, setweeklyBooked] = useState([]);
  const [monthlyBooked, setmonthlyBooked] = useState([]);
  const [courseList, setCourseList] = useState([
    {
      courseId: 1,
      courseName: "Web App",
      bookingList: [
        {
          lectureId: 1,
          bookingNum: 32,
        },
        {
          lectureId: 2,
          bookingNum: 20,
        },
        {
          lectureId: 3,
          bookingNum: 30,
        },
        {
          lectureId: 4,
          bookingNum: 30,
        },
        {
          lectureId: 5,
          bookingNum: 30,
        },
        {
          lectureId: 6,
          bookingNum: 30,
        },
        {
          lectureId: 7,
          bookingNum: 30,
        },
      ],
      averageMonthBookingList: [
        {
          month: 2020 - 11,
          average: 100,
        },
        {
          month: 2020 - 12,
          average: 120,
        },
      ],
      averageWeekBookingList: [
        {
          week: 2020 - 47,
          average: 10,
        },
        {
          week: 2020 - 48,
          average: 25,
        },
      ],
    },
    {
      courseId: 2,
      courseName: "Web App 1",
      bookingList: [
        {
          lectureId: 1,
          bookingNum: 42,
        },
        {
          lectureId: 2,
          bookingNum: 31,
        },
      ],
      averageMonthBookingList: [
        {
          month: 2020 - 11,
          average: 170,
        },
        {
          month: 2020 - 12,
          average: 130,
        },
      ],
      averageWeekBookingList: [
        {
          week: 2020 - 47,
          average: 10,
        },
        {
          week: 2020 - 48,
          average: 25,
        },
      ],
    },
  ]);

  return (
    <>
      <div className="container">
        <div className="d-flex w-100 justify-content-start shadow bg-light py-3 my-3 rounded border border-secondary">
          <label className="px-3 font-weight-bold">Choose a date range: </label>
          <DatePickerComponent className="mx-3" />

          <ButtonGroup className="px-3" aria-label="Basic example">
            <Button variant="secondary">Weekly</Button>
            <Button variant="secondary">Montly</Button>
          </ButtonGroup>
          <Button variant="primary">Apply</Button>
        </div>
        <div>
          <Table size="sm" className="shadow-sm py-3 mb-5 bg-white rounded ">
            <thead>
              <tr>
                <th></th>
                <th>Course Id</th>
                <th>Course Name</th>
              </tr>
            </thead>
            <tbody>
              {courseList.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <tr>
                      <td>
                        <a
                          data-toggle="collapse"
                          href={`#collapse${item.courseId}`}
                          role="button"
                          aria-expanded="false"
                          aria-controls="collapseExample"
                        >
                          #
                        </a>
                      </td>
                      <td>{item.courseId}</td>
                      <td>{item.courseName}</td>
                    </tr>
                    <tr className="collapse" id={`collapse${item.courseId}`}>
                      <td colSpan="4">
                        <div>
                          <div className="card card-body">
                            <div style={{ marginBottom: 20 }}>
                              <a
                                style={{ marginBottom: 5 }}
                                className="btn btn-secondary"
                                data-toggle="collapse"
                                href={`#booking-collapse-${item.courseId}`}
                                role="button"
                                aria-expanded="false"
                                aria-controls="collapseExample"
                              >
                                Previous Lecture Booking Number
                              </a>
                              <div
                                className="collapse"
                                id={`booking-collapse-${item.courseId}`}
                              >
                                <div
                                  className="card card-body"
                                  style={{ padding: 10 }}
                                >
                                  {item.bookingList.map((item, index) => {
                                    return (
                                      <div key={index}>
                                        Lecture {item.lectureId}:{" "}
                                        {item.bookingNum}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <Form>
                              <Row>
                                <Col>
                                  <Form.Control size="sm" as="select">
                                    {item.averageMonthBookingList.map(
                                      (item, index) => {
                                        return (
                                          <option key={index}>
                                            Month {item.month}
                                          </option>
                                        );
                                      }
                                    )}
                                  </Form.Control>
                                  <div style={{ margin: "5px 0px" }}>
                                    <div
                                      className="alert alert-success"
                                      role="alert"
                                    >
                                      Average number per month:{" "}
                                      {item.averageMonthBookingList[0].average}
                                    </div>
                                  </div>
                                </Col>
                                <Col>
                                  <Form.Control size="sm" as="select">
                                    {item.averageWeekBookingList.map(
                                      (item, index) => {
                                        return (
                                          <option key={index}>
                                            Week {item.week}
                                          </option>
                                        );
                                      }
                                    )}
                                  </Form.Control>
                                  <div style={{ margin: "5px 0px" }}>
                                    <div
                                      className="alert alert-success"
                                      role="alert"
                                    >
                                      Average number per week:{" "}
                                      {item.averageWeekBookingList[0].average}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Form>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};
