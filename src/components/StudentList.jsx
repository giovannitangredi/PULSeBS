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
      selectedColors: [],
      lectureColor:"",
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
      //color: this.props.colors[Math.floor(Math.random() * this.props.colors.length)]
      result.forEach(element => {
        this.state.selectedColors.push(this.props.colors[Math.floor(Math.random() * this.props.colors.length)]);
      });
   
     let index=0;
      
      result=   (result)?  result.map(obj=> ({ ...obj, color:`${this.state.selectedColors[index++] }` }))  :result;
      this.setState({ courses: result });
    });
  };

  getLecturesList = (courseID) => {
    axios.get(`/courses/${courseID.id}/lectures`, {}).then((response) => {
      let result = response.data;
     let courseColor= this.state.courses.find(id=>id==courseID).color;
     this.setState({lectureColor:courseColor});
      this.setState({ lecturetitle: courseID.name });
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
          name,
        },
      };
    });
  }
  renderEventContent(eventInfo) {
    if (eventInfo)
      return (
        <div style={{ color : `${eventInfo.event.extendedProps.color}`}} >
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
    this.setState({ studenttitle: event._def.extendedProps.name });
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
  }

  render() {
    return (
      <>
        <div className="container">
          <Card
            border={"secondary"}
            style={{ width: "100%", maxHeight: "75vh", margin: "1rem 0rem" }}
          >
            <Card.Header>
              <h4>Courses</h4>
            </Card.Header>
            {this.state.courses && (
              <div
                className=" bg-light "
                style={{ maxHeight: "75vh",  overflow: "scroll" }}
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
                background: "rgb(254 254 254)",
              }}
            >
              <Card.Header style={{ background:`${this.state.lectureColor}`}}>
                {" "}
                <h4>
                  <b>{this.state.lecturetitle}</b> Lectures
                </h4>{" "}
              </Card.Header>
              <div className="row" style={{ margin: "1rem 0rem" }}>
                <div className="col-12 col-md-8">
                  <div className="col">
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
                    {this.formatEvents().length > 0 ? (
                      <ListGroup
                        as="ul"
                        variant="flush"
                        style={{ height: "28rem", margin: "1rem 0rem" }}
                      >
                        <ListGroup.Item>
                          <div className="d-flex w-100 justify-content-between">
                            <div className="container">
                              <div className="row">
                                <div className="col-lg-4">
                                  <label>Lecture Name</label>
                                </div>
                                <div className="col-lg-4">
                                  <label>Start</label>
                                </div>
                                <div className="col-lg-4">
                                  <label>End</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                        {this.formatEvents().map((lecture) => (
                          <LectureItem lecture={lecture} />
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
                      No lecture is selected or there is no students available
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
