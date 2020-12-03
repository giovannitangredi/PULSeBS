import React, { ChangeEvent, useEffect, useState } from "react";
// import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Col, Form, Row, Tab, Table, Tabs } from "react-bootstrap";
import { CourseDetail } from "./TeacherStatistics";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

interface GeneralStats {
  attendances: number;
  bookings: number;
  cancellations: number;
}

interface LectureStats {
  attendances: number;
  bookings: number;
  cancellations: number;
  course: string;
  courseId: number;
  date: Date;
  lecture: string;
}

interface CourseLectureStats {
  attendances: number;
  bookings: number;
  cancellations: number;
  course: string;
  date: Date;
  lecture: string;
}

class WeekDate {
  year: number;
  week: number;
  constructor(week: number, year: number) {
    this.year = year;
    this.week = week;
  }

  format() {
    return `${this.year}-${this.week}`;
  }
}

class MonthDate {
  year: number;
  month: number;
  constructor(month: number, year: number) {
    this.year = year;
    this.month = month;
  }

  format() {
    return this.month > 9
      ? `${this.year}-${this.month}`
      : `${this.year}-0${this.month}`;
  }
}

interface CourseWeekStats {
  courseId: number;
  name: string;
  weekDate: WeekDate;
  avgBookings: number;
}

interface CourseMonthStats {
  courseId: number;
  name: string;
  monthDate: MonthDate;
  avgBookings: number;
}
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

const DateRangePicker = (props: {
  initStartDate: Date;
  initEndDate: Date;
  handleChange: (startDate: Date, endDate: Date) => any;
}) => {
  const { initStartDate, initEndDate, handleChange } = props;
  const [startDate, setStartDate] = useState<Date>(initStartDate);
  const [endDate, setEndDate] = useState<Date>(initEndDate);
  const onChange = (dates: [Date, Date]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    handleChange(start, end);
  };
  return (
    <DatePicker
      selected={startDate}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
      showWeekNumbers
    />
  );
};

const MonthRangePicker = (props: {
  initStartDate: Date;
  initEndDate: Date;
  handleChange: (startDate: Date, endDate: Date) => any;
}) => {
  const { initStartDate, initEndDate, handleChange } = props;
  const [startDate, setStartDate] = useState<Date>(initStartDate);
  const [endDate, setEndDate] = useState<Date>(initEndDate);
  const onChange = (dates: [Date, Date]) => {
    const [start, end] = dates;

    setStartDate(start);
    setEndDate(end);
    handleChange(start, end);
  };
  return (
    <Row>
      <Col>
        <Form.Group>
          <Col>
            {" "}
            <Form.Label>From </Form.Label>
          </Col>
          <Col>
            {" "}
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => onChange([date, endDate])}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </Col>
        </Form.Group>
      </Col>
      <Col>
        <Form.Group>
          <Col>
            <Form.Label>To </Form.Label>
          </Col>
          <Col>
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => onChange([startDate, date])}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </Col>
        </Form.Group>
      </Col>
    </Row>
  );
};

export const ManagerPage = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<GeneralStats>();
  const [lectureStats, setLectureStats] = useState<LectureStats[]>([]);
  const [courseSumStats, setCourseSumStats] = useState<GeneralStats>();
  const [courseLectureStats, setCourseLectureStats] = useState<
    CourseLectureStats[]
  >([]);
  const [courseWeekStats, setCourseWeekStats] = useState<CourseWeekStats[]>([]);
  const [courseMonthStats, setCourseMonthStats] = useState<CourseMonthStats[]>(
    []
  );
  const [courses, setCourses] = useState<Map<number, string>>(new Map());
  const [byCourseSelect, setByCourseSelect] = useState<number>();
  const [byWeekSelect, setByWeekSelect] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [byMonthSelect, setByMonthSelect] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  const getSystemStats = () => {
    //get the sum of booking, cancellations, attendance for all lectures
    axios
      .get(`/stats/system`)
      .then((res) => {
        let systemStats: GeneralStats[] = res.data;
        setSystemStats(systemStats[0]);
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
      .get(`/stats/lectures`)
      .then((res) => {
        let lectureStats: LectureStats[] = res.data;
        setCourses(
          new Map<number, string>(
            lectureStats.map((lecture) => [lecture.courseId, lecture.course])
          )
        );

        setLectureStats(lectureStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseSumStats = (courseId: number) => {
    //get the sum of booking, cancellations, attendance for all lecturs of a specific course
    axios
      .get(`/courses/${courseId}/stats`)
      .then((res) => {
        let courseSumStats = res.data;
        setCourseSumStats(courseSumStats);
        console.log(courseSumStats);
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
      .get(`/courses/${courseId}/lecturesStats`)
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

  const getCourseLecturesWeekRange = (
    courseId: number,
    startDate: Date,
    endDate: Date
  ) => {
    const startWeek = new WeekDate(
      moment(startDate).isoWeek(),
      moment(startDate).year()
    );
    const endWeek = new WeekDate(
      moment(endDate).isoWeek(),
      moment(endDate).year()
    );
    axios
      .get(
        `/courses/${courseId}/bookings?fromWeek=${startWeek.format()}&toWeek=${endWeek.format()}`
      )
      .then((res) => {
        setCourseWeekStats(
          res.data.map(
            (c: {
              course_id: number;
              course_name: string;
              week: string;
              booking: number;
            }) => ({
              courseId: c.course_id,
              name: c.course_name,
              weekDate: new WeekDate(
                parseInt(c.week.split("-")[1]),
                parseInt(c.week.split("-")[0])
              ),
              avgBookings: c.booking,
            })
          )
        );
        setLoading(false);
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseLecturesMonthRange = (
    courseId: number,
    startDate: Date,
    endDate: Date
  ) => {
    const startMonth = new MonthDate(
      moment(startDate).month() + 1,
      moment(startDate).year()
    );
    const endMonth = new MonthDate(
      moment(endDate).month() + 1,
      moment(endDate).year()
    );
    axios
      .get(
        `/courses/${courseId}/bookings?fromMonth=${startMonth.format()}&toMonth=${endMonth.format()}`
      )
      .then((res) => {
        setCourseMonthStats(
          res.data.map(
            (c: {
              course_id: number;
              course_name: string;
              month: string;
              booking: number;
            }) => ({
              courseId: c.course_id,
              name: c.course_name,
              monthDate: new MonthDate(
                moment(c.month, "YYYY-MM").month() + 1,
                moment(c.month, "YYYY-MM").year()
              ),
              avgBookings: c.booking,
            })
          )
        );
        setLoading(false);
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const handleByCourseSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const courseId: number = parseInt(event.target.value);
      setByCourseSelect(courseId);
      getCourseSumStats(courseId);
      getCourseLectureStats(courseId);
    }
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
          {lectureStats.length > 0 ? (
            <Row>
              <Table striped bordered hover className="p-5">
                <thead>
                  <tr>
                    <th>Course ({courses?.size})</th>
                    <th>Lecture ({lectureStats.length})</th>
                    <th>Date</th>
                    <th>Bookings ({systemStats?.bookings})</th>
                    <th>Cancellations ({systemStats?.cancellations})</th>
                    <th>Attendances ({systemStats?.attendances})</th>
                  </tr>
                </thead>
                <tbody>
                  {lectureStats.map((lecture: LectureStats, index: number) => (
                    <tr key={index}>
                      <td>{lecture.course}</td>
                      <td>{lecture.lecture}</td>
                      <td>{lecture.date}</td>
                      <td>{lecture.bookings}</td>
                      <td>{lecture.cancellations}</td>
                      <td>{lecture.attendances}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Row>
          ) : (
            <Row>
              <h4 className="mx-auto">No results.</h4>
            </Row>
          )}
        </Tab>
        <Tab eventKey="course" title="By Course">
          <Container>
            <Form className="p-5">
              <Form.Group controlId="customSelectCourse.">
                <Form.Label>Choose from the list of courses:</Form.Label>
                <Form.Control
                  as="select"
                  value={byCourseSelect || "select"}
                  onChange={handleByCourseSelect}
                >
                  <option value="select" key={"select"} disabled>
                    Select a course
                  </option>
                  {Array.from(courses.entries()).map(([key, value]) => (
                    <option value={key} key={key}>
                      {value}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Container>
          <hr />
          <Container>
            {courseLectureStats.length > 0 ? (
              <Row>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Lecture ({courseLectureStats.length})</th>
                      <th>Date</th>
                      <th>Bookings {/*({courseSumStats?.bookings})*/}</th>
                      <th>Cancellations {/*({courseSumStats?.cancellations})*/}</th>
                      <th>Attendances {/*({courseSumStats?.attendances})*/}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseLectureStats.map(
                      (lecture: CourseLectureStats, index: number) => (
                        <tr key={index}>
                          <td>{lecture.lecture}</td>
                          <td>{lecture.date}</td>
                          <td>{lecture.bookings}</td>
                          <td>{lecture.cancellations}</td>
                          <td>{lecture.attendances}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </Row>
            ) : (
              <Row>
                <h4 className="mx-auto">No results.</h4>
              </Row>
            )}
          </Container>
        </Tab>
        <Tab eventKey="course-week" title="By Course, Week">
          <Container>
            <Form className="p-5">
              <Row>
                <Col>
                  <Form.Group controlId="customSelectCourse.Week">
                    <Form.Label>Choose from the list of courses:</Form.Label>
                    <Form.Control
                      as="select"
                      value={byCourseSelect || "select"}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        if (event.target.value) {
                          const courseId: number = parseInt(event.target.value);
                          setByCourseSelect(courseId);
                          getCourseLecturesWeekRange(
                            courseId,
                            byWeekSelect[0],
                            byWeekSelect[1]
                          );
                        }
                      }}
                    >
                      <option value="select" key={"select"} disabled>
                        Select a course
                      </option>
                      {Array.from(courses.entries()).map(([key, value]) => (
                        <option value={key} key={key}>
                          {value}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Choose a week range:</Form.Label>
                    <DateRangePicker
                      handleChange={(start, end) => {
                        moment(start).isValid() &&
                          moment(end).isValid() &&
                          setByWeekSelect([start, end]);
                        byCourseSelect &&
                          moment(start).isValid() &&
                          moment(end).isValid() &&
                          getCourseLecturesWeekRange(
                            byCourseSelect,
                            start,
                            end
                          );
                      }}
                      initStartDate={byWeekSelect[0]}
                      initEndDate={byWeekSelect[1]}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Container>
          <hr />
          <Container>
            {courseWeekStats.length > 0 ? (
              <Row>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Course ({courseWeekStats.length})</th>
                      <th>Date (YEAR-WEEK)</th>
                      <th>Average Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseWeekStats.map(
                      (course: CourseWeekStats, index: number) => (
                        <tr key={index}>
                          <td>{course.name}</td>
                          <td>{course.weekDate.format()}</td>
                          <td>{course.avgBookings}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </Row>
            ) : (
              <Row>
                <h4 className="mx-auto">No results.</h4>
              </Row>
            )}
          </Container>
        </Tab>
        <Tab eventKey="course-month" title="By Course, Month">
          <Container>
            <Form className="p-5">
              <Row>
                <Col>
                  <Form.Group controlId="customSelectCourse.Month">
                    <Form.Label>Choose from the list of courses:</Form.Label>
                    <Form.Control
                      as="select"
                      value={byCourseSelect || "select"}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        if (event.target.value) {
                          const courseId: number = parseInt(event.target.value);
                          setByCourseSelect(courseId);
                          getCourseLecturesMonthRange(
                            courseId,
                            byMonthSelect[0],
                            byMonthSelect[1]
                          );
                        }
                      }}
                    >
                      <option value="select" key={"select"} disabled>
                        Select a course
                      </option>
                      {Array.from(courses.entries()).map(([key, value]) => (
                        <option value={key} key={key}>
                          {value}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Choose a month range:</Form.Label>
                    <MonthRangePicker
                      handleChange={(start, end) => {
                        moment(start).isValid() &&
                          moment(end).isValid() &&
                          setByMonthSelect([start, end]);
                        byCourseSelect &&
                          moment(start).isValid() &&
                          moment(end).isValid() &&
                          getCourseLecturesMonthRange(
                            byCourseSelect,
                            start,
                            end
                          );
                      }}
                      initStartDate={byMonthSelect[0]}
                      initEndDate={byMonthSelect[0]}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Container>
          <hr />
          <Container>
            {courseMonthStats.length > 0 ? (
              <Row>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Course ({courseMonthStats.length})</th>
                      <th>Date (YEAR-MONTH)</th>
                      <th>Average Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseMonthStats.map(
                      (course: CourseMonthStats, index: number) => (
                        <tr key={index}>
                          <td>{course.name}</td>
                          <td>{course.monthDate.format()}</td>
                          <td>{course.avgBookings}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </Row>
            ) : (
              <Row>
                <h4 className="mx-auto">No results.</h4>
              </Row>
            )}
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
};
