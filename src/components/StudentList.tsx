//import React from 'react';
import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import LectureItem from "./LectureItem";
import CourseItem from "./CourseItem";
import StudentItem from "./StudentItem";
import axios from "axios";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

class StudentList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectures: [],
      students: [],
      courses: [],
      selectedLecture: 0,
      selectedCourse: 0,
    };
  }

  getStudentList = (lectureID) => {
    axios.get(`/lectures/${lectureID}/students`, {}).then((response) => {
      let result = response.data;
      this.setState({ students: result });
    });
  };

  getCourseList = () => {
    axios.get(`/courses/`, {}).then((response) => {
      let result = response.data;
      this.setState({ courses: result });
    });
  };

  getLecturesList = (courseID) => {
    axios.get(`/courses/${courseID}/lectures`, {}).then((response) => {
      let result = response.data;
      this.setState({ lectures: result });
    });
  };

  formatEvents() {
    return this.state.lectures.map((lecture) => {
      const { name, end, start, capacity, booked_students, id } = lecture;

      let startTime = new Date(start);
      let endTime = new Date(end);

      return {
        title: name,
        start: startTime,
        end: endTime,
        extendedProps: {
          capacity: capacity,
          booked_students: booked_students,
          id,
        },
      };
    });
  }
  renderEventContent(eventInfo) {
    if (eventInfo)
      return (
        <div>
          <p>
            {eventInfo.event.start.getHours()}:
            {eventInfo.event.start.getMinutes()}-
            {eventInfo.event.end.getHours()}:
            {eventInfo.event.start.getMinutes()}
            <br></br>
            {eventInfo.event.title} <br></br>
            Capacity:{eventInfo.event.extendedProps.capacity}{" "}
          </p>
        </div>
      );
    else return null;
  }
  handleEventClick = ({ event }) => {
    this.scrolltoview("studentlistview");
    let lectureid = event._def.extendedProps.id;
    this.getStudentList(lectureid);
  };

  loadLectureAndScroll = (elementId) => {
    this.getLecturesList(elementId);
    this.scrolltoview("WeeklyCalendarContainer");
  };

  scrolltoview = (elementid) => {
    document.getElementById(elementid).scrollIntoView({
      behavior: "smooth",
    });
  };

  componentDidMount() {
    this.setState({ selectedLecture: 1 });

    this.getCourseList();

    /* this.setState({
      Courses: [{ id: 1, name: "Soft eng II", main_prof: 3 }],
    });

    this.setState({
      lectures: [
        {
          id: 2323,
          lecturer_name: "Software 2",
          start: Date.parse("11/9/2020 13:00:00 GMT"),
          end: Date.parse("11/9/2020 14:00:00 GMT"),
          capacity: 84,
          booked_students: "20",
          course: "84",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2423,
          lecturer_name: "Data Science and Database Technology",
          start: Date.parse("13/9/2020 12:00:00 GMT"),
          end: Date.parse("13/9/2020 14:00:00 GMT"),
          capacity: 170,
          booked_students: "20",
          course: "170",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2623,
          lecturer_name: "Compiler",
          start: Date.parse("14/9/2020 09:00:00 GMT"),
          end: Date.parse("14/9/2020 11:00:00 GMT"),
          capacity: 60,
          booked_students: "20",
          course: "60",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2253,
          lecturer_name: "Computer Architectures",
          start: Date.parse("15/9/2020 12:00:00 GMT"),
          end: Date.parse("15/9/2020 13:00:00 GMT"),
          capacity: 210,
          booked_students: "20",
          course: "210",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2293,
          lecturer_name: "System and Device Programming",
          start: Date.parse("16/9/2020 13:00:00 GMT"),
          end: Date.parse("16/9/2020 14:00:00 GMT"),
          capacity: 130,
          booked_students: "20",
          course: "130",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2393,
          lecturer_name: "Computer Networks",
          start: Date.parse("17/9/2020 13:00:00 GMT"),
          end: Date.parse("17/9/2020 14:00:00 GMT"),
          capacity: 129,
          booked_students: "20",
          course: "129",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },

        {
          id: 2723,
          lecturer_name: "Mobile application development",
          start: Date.parse("18/9/2020 13:00:00 GMT"),
          end: Date.parse("18/9/2020 14:00:00 GMT"),
          capacity: 83,
          booked_students: "20",
          course: "32",
          lecturer_name: "John",
          lecturer_surname: "Doe",
          lecturer_id: 3,
        },
      ],
    });
    this.setState({
      students: [
        {
          id: 2223,
          name: "Mithridates",
          surename: "Theophylaktos",
          email: "Mithridates@gmail.com",
        },
        { id: 2213, name: "Ajay", surename: "Phoibe", email: "Ajay@gmail.com" },
        {
          id: 4253,
          name: "Valeri",
          surename: "Sabina",
          email: "Sabina@gmail.com",
        },
        {
          id: 2263,
          name: "Mithridates",
          surename: "Theophylaktos",
          email: "Theophylaktos@gmail.com",
        },
        {
          id: 2273,
          name: "Ajay",
          surename: "Phoibe",
          email: "Phoibe@gmail.com",
        },
        {
          id: 4283,
          name: "Valeri",
          surename: "Sabina",
          email: "Valeri@gmail.com",
        },
        {
          id: 2593,
          name: "Loane",
          surename: "Aeson",
          email: "Loane@gmail.com",
        },
      ],
    });*/
  }

  render() {
    return (
      <>
        <div className="container">
          <Card
            border={"secondary"}
            style={{ width: "100%", height: "75vh", margin: "1rem 0rem" }}
          >
            <Card.Header>Courses</Card.Header>
            {this.state.courses && (
              <div
                className=" bg-light "
                style={{ height: "75vh", overflow: "scroll" }}
              >
                <div
                  className="d-flex align-content-center  flex-wrap bg-light "
                  style={{ width: "71vw" }}
                >
                  {this.state.courses.map((course) => (
                    <CourseItem
                      key={course.id}
                      course={course}
                      loadCourseData={this.loadLectureAndScroll}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
          <Card
            border={"secondary"}
            style={{ width: "100%", height: "100%", margin: "1rem 0rem" }}
          >
            <Card.Header>Lectures</Card.Header>
            <div className="row" style={{ background: "#e1e1e152" }}>
              <div className="col-12 col-md-8">
                <div id="WeeklyCalendarContainer" className="col">
                  <WeeklyCalendar
                    handleEventClick={this.handleEventClick}
                    Items={this.formatEvents()}
                    renderEventContent={this.renderEventContent}
                    title={`Number of Lectures:${this.formatEvents().length}`}
                  />
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div id="lecturelistview" className="col">
                  {this.formatEvents().length > 0 && (
                    <ListGroup
                      as="ul"
                      variant="flush"
                      style={{ height: "28rem" }}
                    >
                      {this.formatEvents().map((lecture) => (
                        <LectureItem lecture={lecture} />
                      ))}
                    </ListGroup>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card
            border={"secondary"}
            style={{ width: "100%", margin: "1rem 0rem" }}
          >
            <Card.Header>Students</Card.Header>
            <div className="row">
              <div id="studentlistview" className="col">
                {this.state.students && (
                  <ListGroup as="ul" variant="flush">
                    {this.state.students.map((student) => (
                      <StudentItem key={student.id} student={student} />
                    ))}
                  </ListGroup>
                )}
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }
}

export default StudentList;
