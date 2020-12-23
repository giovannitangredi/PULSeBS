import React, { ChangeEvent, useEffect, useState } from "react";
// import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Col, Form, Row, Tab, Table, Pagination, Tabs } from "react-bootstrap";
import { CourseDetail } from "./TeacherStatistics";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

import { Chart } from "react-charts";
import { useMemo } from "react";

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
  courseId: string;
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

  toString() {
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

  toString() {
    return `${this.year}-${this.month}`;
  }
}

interface CourseWeekStats {
  courseId: string;
  name: string;
  weekDate: WeekDate;
  avgBookings: number;
  avgCancellations: number;
  avgAttendances: number;
}

interface CourseMonthStats {
  courseId: string;
  name: string;
  monthDate: MonthDate;
  avgBookings: number;
  avgCancellations: number;
  avgAttendances: number;
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
  const [courses, setCourses] = useState<Map<string, string>>(new Map());
  const [byCourseSelect, setByCourseSelect] = useState<string>();
  const [byWeekSelect, setByWeekSelect] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [byMonthSelect, setByMonthSelect] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  // pagination
  
  const pageSize = 9;
  const [currentPage, setCurrentPage] = useState({
    lectureStats: 1,
    courseLectureStats: 1,
    courseWeekStats: 1,
    courseMonthStats: 1,
  });

  const paginate = (array: any[], pageNumber: number) => { 
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  const handlePrev = (statsType: string) => {
    if (currentPage[statsType] > 1) {
      let newPage = { ...currentPage };
      newPage[statsType] -= 1;
      setCurrentPage(newPage);
    }
  }

  const handleNext = (statsType: string, listLength: number) => {
    if (currentPage[statsType] < Math.ceil(listLength / pageSize)) {
      let newPage = { ...currentPage };
      newPage[statsType] += 1;
      setCurrentPage(newPage);
    }
  }

  const resetPageFor = (statsType: string) => {
    let newPage = { ...currentPage };
    newPage[statsType] = 1;
    setCurrentPage(newPage);
  }

  const generateDataFrom = (rawData: any[], values: string[], dateAttribute: string) => {
    const p= (
      values
      .map(
        (series) => {
          return {
            label: series,
            data: rawData
              .map(
              (lecture): {primary: string, secondary: Number} => {
                console.log(lecture, dateAttribute, new String(lecture[dateAttribute]));
                return { primary: lecture[dateAttribute].toString(), secondary: new Number(lecture[series])};
              })
              .sort((v1: {primary: string, secondary: Number}, v2: {primary: string, secondary: Number}) => v1.primary.localeCompare(v2.primary))
          };
        }
      )
    );
    return p;
  }

  const systemChartData = useMemo(() => {
    const lectureStatsGroupByDate = {};
    lectureStats.forEach((value: LectureStats) => {
      if(!lectureStatsGroupByDate[value.date]) {
        lectureStatsGroupByDate[value.date] = {date:value.date, bookings: 0, cancellations: 0, attendances: 0};
      }
      lectureStatsGroupByDate[value.date].bookings += value.bookings;
      lectureStatsGroupByDate[value.date].cancellations += value.cancellations;
      lectureStatsGroupByDate[value.date].attendances += value.attendances;
    })
    return generateDataFrom(Object.values(lectureStatsGroupByDate), ["bookings", "attendances", "cancellations"], "date")
  }, 
    [lectureStats]
  );

  const byCourseChartData = useMemo(() => 
    generateDataFrom(courseLectureStats, ["bookings", "attendances", "cancellations"], "date"), 
    [courseLectureStats]
  );
  const byWeekChartData = useMemo(() => 
    generateDataFrom(courseWeekStats, ["avgBookings", "avgAttendances", "avgCancellations"], "weekDate"), 
    [courseWeekStats]
  );
  const byMonthChartData = useMemo(() => 
    generateDataFrom(courseMonthStats, ["avgBookings", "avgAttendances", "avgCancellations"], "monthDate"), 
    [courseMonthStats]
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom',},
      { type: 'linear', position: 'left', stacked: false,},
    ],
    []
  );
  const series = React.useMemo(() => ({ type:'line' }), []);

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
          new Map<string, string>(
            lectureStats.map((lecture) => [lecture.courseId, lecture.course])
          )
        );

        setLectureStats(lectureStats);
        setLoading(false);
        resetPageFor("lectureStats");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseSumStats = (courseId: string) => {
    //get the sum of booking, cancellations, attendance for all lecturs of a specific course
    axios
      .get(`/courses/${courseId}/stats`)
      .then((res) => {
        if (res.data.length !== 1) throw Error("Response is not well formed.");
        let courseSumStats = res.data[0];
        setCourseSumStats(courseSumStats);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseLectureStats = (courseId: string) => {
    //get a list of all lectures of a specific course with booking, cancellations, attendance stats
    axios
      .get(`/courses/${courseId}/lecturesStats`)
      .then((res) => {
        let courseLectureStats = res.data;
        setCourseLectureStats(courseLectureStats);
        setLoading(false);
        resetPageFor("courseLectureStats");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseLecturesWeekRange = (
    courseId: string,
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
              course_id: string;
              course_name: string;
              week: string;
              booking: number;
              cancellations: number;
              attendances: number;
            }) => ({
              courseId: c.course_id,
              name: c.course_name,
              weekDate: new WeekDate(
                parseInt(c.week.split("-")[1]),
                parseInt(c.week.split("-")[0])
              ),
              avgBookings: c.booking,
              avgCancellations: c.cancellations,
              avgAttendances: c.attendances,
            })
          )
        );
        setLoading(false);
        resetPageFor("courseWeekStats");
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getCourseLecturesMonthRange = (
    courseId: string,
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
              course_id: string;
              course_name: string;
              month: string;
              booking: number;
              cancellations: number;
              attendances: number;
            }) => ({
              courseId: c.course_id,
              name: c.course_name,
              monthDate: new MonthDate(
                moment(c.month, "YYYY-MM").month() + 1,
                moment(c.month, "YYYY-MM").year()
              ),
              avgBookings: c.booking,
              avgCancellations: c.cancellations,
              avgAttendances: c.attendances,
            })
          )
        );
        setLoading(false);
        resetPageFor("courseMonthStats");
        // weeklyBooked
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const handleByCourseSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const courseId: string = event.target.value;
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
              
              <Container style={{width: "100%", height: "300px"}}>
                <Chart series={series} data={systemChartData} axes={axes} tooltip />
              </Container>

              <Table striped bordered hover className="p-5">
                <thead>
                  <tr>
                    <th>Course ({courses?.size})</th>
                    {/*<th>Lecture ({lectureStats.length})</th>*/}
                    <th>Date</th>
                    <th>Bookings ({systemStats?.bookings})</th>
                    <th>Cancellations ({systemStats?.cancellations})</th>
                    <th>Attendances ({systemStats?.attendances})</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(lectureStats, currentPage["lectureStats"]).map((lecture: LectureStats, index: number) => (
                    <tr key={index}>
                      <td>{lecture.course}</td>
                      {/*<td>{lecture.lecture}</td>*/}
                      <td>{lecture.date}</td>
                      <td>{lecture.bookings}</td>
                      <td>{lecture.cancellations}</td>
                      <td>{lecture.attendances}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <Pagination className="mb-0" >
                <Pagination.Prev onClick={() => handlePrev("lectureStats")} />
                <Pagination.Item disabled >{currentPage["lectureStats"] + " of "+ Math.ceil(lectureStats.length / pageSize)}</Pagination.Item>
                <Pagination.Next onClick={() => handleNext("lectureStats", lectureStats.length)} />
              </Pagination>

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
                
                <Container style={{width: "100%", height: "300px"}}>
                  <Chart series={series} data={byCourseChartData} axes={axes} tooltip />
                </Container>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                     {/*<th>Lecture ({courseLectureStats.length})</th>*/}
                      <th>Date</th>
                      <th>Bookings ({courseSumStats?.bookings})</th>
                      <th>Cancellations ({courseSumStats?.cancellations})</th>
                      <th>Attendances ({courseSumStats?.attendances})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(courseLectureStats, currentPage["courseLectureStats"]).map(
                      (lecture: CourseLectureStats, index: number) => (
                        <tr key={index}>
                           {/*<td>{lecture.lecture}</td>*/}
                          <td>{lecture.date}</td>
                          <td>{lecture.bookings}</td>
                          <td>{lecture.cancellations}</td>
                          <td>{lecture.attendances}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
                <Pagination className="mb-0" >
                  <Pagination.Prev onClick={() => handlePrev("courseLectureStats")} />
                  <Pagination.Item disabled >{currentPage["courseLectureStats"] + " of "+ Math.ceil(courseLectureStats.length / pageSize)}</Pagination.Item>
                  <Pagination.Next onClick={() => handleNext("courseLectureStats", courseLectureStats.length)} />
                </Pagination>

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
                          const courseId: string =event.target.value;
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
                
                <Container style={{ width: '100%', height: '300px', }}>
                  <Chart series={series} data={byWeekChartData} axes={axes} tooltip />
                </Container>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Course ({courseWeekStats.length})</th>
                      <th>Date (YEAR-WEEK)</th>
                      <th>Average Bookings</th>
                      <th>Average Cancellations</th>
                      <th>Average Attendances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(courseWeekStats, currentPage["courseWeekStats"]).map(
                      (course: CourseWeekStats, index: number) => (
                        <tr key={index}>
                          <td>{course.name}</td>
                          <td>{course.weekDate.format()}</td>
                          <td>{course.avgBookings}</td>
                          <td>{course.avgCancellations}</td>
                          <td>{course.avgAttendances}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
                
                <Pagination className="mb-0" >
                  <Pagination.Prev onClick={() => handlePrev("courseWeekStats")} />
                  <Pagination.Item disabled >{currentPage["courseWeekStats"] + " of "+ Math.ceil(courseWeekStats.length / pageSize)}</Pagination.Item>
                  <Pagination.Next onClick={() => handleNext("courseWeekStats", courseWeekStats.length)} />
                </Pagination>

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
                          const courseId: string = event.target.value;
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
                
                <Container style={{ width: '100%', height: '300px', }}>
                  <Chart series={series} data={byMonthChartData} axes={axes} tooltip />
                </Container>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Course ({courseMonthStats.length})</th>
                      <th>Date (YEAR-MONTH)</th>
                      <th>Average Bookings</th>
                      <th>Average Cancellations</th>
                      <th>Average Attendances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(courseMonthStats, currentPage["courseMonthStats"]).map(
                      (course: CourseMonthStats, index: number) => (
                        <tr key={index}>
                          <td>{course.name}</td>
                          <td>{course.monthDate.format()}</td>
                          <td>{course.avgBookings}</td>
                          <td>{course.avgCancellations}</td>
                          <td>{course.avgAttendances}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
                
                <Pagination className="mb-0" >
                  <Pagination.Prev onClick={() => handlePrev("courseMonthStats")} />
                  <Pagination.Item disabled >{currentPage["courseMonthStats"] + " of "+ Math.ceil(courseMonthStats.length / pageSize)}</Pagination.Item>
                  <Pagination.Next onClick={() => handleNext("courseMonthStats", courseMonthStats.length)} />
                </Pagination>
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
