//import React from 'react';
import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import LectureItem from "./LectureItem";
import CourseItem from "./CourseItem";
import StudentItem from "./StudentItem";
import axios from "axios";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";

class StudentList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lectures: [],
      students: [],
      courses: [],
      selectedLecture: 0,
      selectedCourse: 0,
      lecturetitle: "",
      studenttitle: "",
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

  getLecturesList = (course) => {
    axios.get(`/courses/${course.id}/lectures`, {}).then((response) => {
      let result = response.data;
      this.setState({
        lecturetitle: course.name,
        selectedCourse: course,
        selectedLecture: undefined,
        students: [],
        lectures: result,
      });
    });
  };

  formatEvents() {
    return this.state.lectures.map((lecture) => {
      const {
        name,
        end,
        start,
        capacity,
        booked_students,
        id,
        status,
      } = lecture;

      let startTime = new Date(start);
      let endTime = new Date(end);

      return {
        title: name,
        start: startTime,
        end: endTime,
        backgroundColor: status === "distance" ? "red" : "dodgerblue",
        extendedProps: {
          capacity: capacity,
          booked_students: booked_students,
          status: status,
          id,
          name,
        },
      };
    });
  }

  renderEventContent(eventInfo) {
    function format(n) {
      return n > 9 ? "" + n : "0" + n;
    }

    if (eventInfo)
      return (
        <div>
          <p>
            {format(eventInfo.event.start.getHours())}:
            {format(eventInfo.event.start.getMinutes())}-
            {format(eventInfo.event.end.getHours())}:
            {format(eventInfo.event.start.getMinutes())}
            <br></br>
            {eventInfo.event.title} <br></br>
            {eventInfo.event.extendedProps.status === "presence" &&
              `Capacity: ${eventInfo.event.extendedProps.capacity}`}
          </p>
        </div>
      );
    else return null;
  }

  handleEventClick = ({ event }) => {
    this.scrolltoview("studentlistview");
    let lectureid = event._def.extendedProps.id;
    this.setState({
      studenttitle: event._def.extendedProps.name,
      selectedLecture: event._def,
    });
    this.getStudentList(lectureid);
  };

  handleConvertLecture = (lectureId) => {
    const course = this.state.selectedCourse;
    course &&
      course.id &&
      axios
        .put(`/lectures/${lectureId}/convert`, {})
        .then((res) => res.status === 204 && this.getLecturesList(course));
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
    this.getCourseList();
  }

  render() {
    return (
      <>
        <div className="container col-10">
          <Card
            border={"secondary"}
            style={{ width: "100%", height: "75vh", margin: "1rem 0rem" }}
          >
            <Card.Header>
              <h4>Courses</h4>
            </Card.Header>
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
          <div id="WeeklyCalendarContainer">
            <Card
              border={"secondary"}
              style={{
                width: "100%",
                margin: "1rem 0rem",
                background: "#e1e1e152",
              }}
            >
              <Card.Header>
                {" "}
                <h4>
                  <b>{this.state.lecturetitle}</b> Lectures
                </h4>{" "}
              </Card.Header>
              <div className="row" style={{ margin: "1rem 0rem" }}>
                <div className="col-12 col-md-7">
                  <div className="col">
                    <WeeklyCalendar
                      handleEventClick={this.handleEventClick}
                      Items={this.formatEvents()}
                      renderEventContent={this.renderEventContent}
                      title={`Number of Lectures:${this.formatEvents().length}`}
                    />
                  </div>
                </div>
                <div className="col-6 col-md-5">
                  <div
                    className="d-flex flex-row align-items-center justify-content-end"
                    id="legendView"
                  >
                    <ListGroup>
                      <ListGroup.Item className="d-flex flex-row align-items-center">
                        <span
                          className="mx-2"
                          style={{
                            height: "10px",
                            width: "10px",
                            display: "block",
                            float: "left",
                            background: "red",
                          }}
                        ></span>
                        Remote lecture
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex flex-row align-items-center">
                        <span
                          className="mx-2"
                          style={{
                            height: "10px",
                            width: "10px",
                            display: "block",
                            float: "left",
                            background: "dodgerblue",
                          }}
                        ></span>
                        Presence lecture
                      </ListGroup.Item>
                    </ListGroup>
                  </div>

                  <div id="lecturelistview">
                    {this.formatEvents().length > 0 ? (
                      <ListGroup
                        as="ul"
                        variant="flush"
                        style={{ margin: "1rem 0rem" }}
                      >
                        <ListGroup.Item key="head">
                          <div className="d-flex w-100 justify-content-between">
                            <div className="container">
                              <div className="row">
                                <div className="col-lg-3">
                                  <label>Lecture Name</label>
                                </div>
                                <div className="col-lg-3">
                                  <label>Start</label>
                                </div>
                                <div className="col-lg-3">
                                  <label>End</label>
                                </div>
                                <div className="col-lg-3">
                                  <label>Status</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                        {this.formatEvents().map((lecture) => (
                          <LectureItem
                            key={lecture.extendedProps.id}
                            lecture={lecture}
                            handleConvert={this.handleConvertLecture}
                          />
                        ))}
                      </ListGroup>
                    ) : (
                      <h4
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          justifyContent: "center",
                          margin: "2rem",
                        }}
                      >
                        No Course is selected
                      </h4>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div id="studentlistview">
            <Card
              border={"secondary"}
              style={{ width: "100%", margin: "1rem 0rem" }}
            >
              <Card.Header>
                {" "}
                <h4>
                  <b>{this.state.studenttitle}</b> Students
                </h4>{" "}
              </Card.Header>
              <div className="row">
                <div className="col">
                  {this.state.students.length > 0 ? (
                    <ListGroup as="ul" variant="flush">
                      <ListGroup.Item>
                        <div className="d-flex w-100 justify-content-between">
                          <div className="container">
                            <div className="row">
                              <div className="col-lg-4">
                                <label>Name</label>
                              </div>
                              <div className="col-lg-4">
                                <label>LastName</label>
                              </div>
                              <div className="col-lg-4">
                                <label>Email</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                      {this.state.students.map((student) => (
                        <StudentItem key={student.id} student={student} />
                      ))}
                    </ListGroup>
                  ) : (
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "center",
                        margin: "2rem",
                      }}
                    >
                      {!this.state.selectedLecture
                        ? "No lecture is selected"
                        : this.state.selectedLecture.extendedProps.status ===
                          "distance"
                        ? "Remote lecture selected: no students list available"
                        : "no students booked for this lecture"}
                    </h4>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }
}

export default StudentList;
