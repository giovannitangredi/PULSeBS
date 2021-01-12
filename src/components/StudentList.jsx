//import React from 'react';
import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import LectureItem from "./LectureItem";
import CourseItem from "./CourseItem";
import StudentItem from "./StudentItem";
import axios from "axios";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import moment from "moment";

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
      lectureColor: "",
      lecturetitle: "",
      studenttitle: "",
      alertText: "",
      alertType: "success",
      alertShow: false,
      absent: "absence",
      present: "presence",
      presentStudentsToSend: "", // list of present students
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
      result.forEach((element) => {
        this.state.selectedColors.push(
          this.props.colors[
            Math.floor(Math.random() * this.props.colors.length)
          ]
        );
      });

      let index = 0;

      result = result
        ? result.map((obj) => ({
            ...obj,
            color: `${this.state.selectedColors[index++]}`,
          }))
        : result;
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

  // prepare data for the calendar
  formatEvents() {
    return this.state.lectures.map((lecture) => {
      const {
        room,
        end,
        start,
        capacity,
        booked_students,
        id,
        status,
      } = lecture;

      let startTime = new Date(start);
      let endTime = new Date(end);

      let date = moment(start).format("dddd, MMMM Do YYYY");
      let time = moment(start)
        .format("HH:mm")
        .concat("-" + moment(end).format("HH:mm"));

      return {
        //name: name,
        start: startTime,
        end: endTime,
        backgroundColor: status === "distance" ? "#F73D3D" : "dodgerblue",
        display: "block",
        extendedProps: {
          capacity: capacity,
          booked_students: booked_students,
          status: status,
          room: room,
          date: date,
          time: time,
          id,
        },
      };
    });
  }
  // Calendar event elements to render
  renderEventContent(eventInfo) {
    if (eventInfo)
      return (
        <div
          className="text-wrap rounded row align-items-center m-0 d-flex justify-content-center"
          style={{
            color: `${eventInfo.event.extendedProps.backgroundColor}`,
            height: "100%",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          <div className="my-2 text-center">
            <img
              className=" flex-fill align-self-center"
              src={
                eventInfo.event.extendedProps.status === "presence"
                  ? "./imgs/presence.png"
                  : "./imgs/online.png"
              }
              style={{
                height: "23px",
                width: "23px",
              }}
            />
            <p style={{ textAlign: "center" }} className="my-auto  flex-fill ">
              {eventInfo.event.extendedProps.status === "presence" ? (
                <>
                  Room {eventInfo.event.extendedProps.room} <br></br>
                  Seats: {eventInfo.event.extendedProps.capacity}
                  <br></br>
                  Lecture in Precence
                </>
              ) : (
                <>
                  Virtual Classroom <br></br>
                  Remote lecture
                </>
              )}
            </p>
          </div>
        </div>
      );
    else return null;
  }
  // fires when event on calendar is clicked
  handleEventClick = ({ event }) => {
    this.scrolltoview("studentlistview");
    let lectureid = event._def.extendedProps.id;
    this.setState({
      studenttitle: event._def.extendedProps.name,
      selectedLecture: event._def,
    });
    this.getStudentList(lectureid);
  };
  // sends changes of lecture in presence and remote
  handleConvertLecture = (lectureId) => {
    const course = this.state.selectedCourse;
    course &&
      course.id &&
      axios
        .put(`/lectures/${lectureId}/convert`, {})
        .then((res) => res.status === 204 && this.getLecturesList(course));
  };

  loadLectureAndScroll = (elementId) => {
    this.setState({ lectureColor: elementId.color });
    this.getLecturesList(elementId);
    this.scrolltoview("WeeklyCalendarContainer");
  };

  scrolltoview = (elementid) => {
    document.getElementById(elementid).scrollIntoView({
      behavior: "smooth",
    });
  };

  ShowNotification = () => {
    this.setState({ alertShow: true });

    setTimeout(() => {
      this.setState({ alertShow: false });
    }, 3000);
    this.scrolltoview("CoursesElement");
  };
  // Cancel lecture event to show notification
  cancelLectureHandle = (lecture) => {
    this.ShowNotification();
    const course = this.state.selectedCourse;
    course &&
      course.id &&
      axios
        .delete(`/lectures/${lecture.extendedProps.id}`, {})
        .then((res) => {
          this.setState({ alertType: "success" });
          this.setState({ alertText: "Lecture has canceled sucssesfully" });
          this.getLecturesList(course);
        })
        .catch((error) => {
          this.setState({ alertType: "danger" });
          this.setState({ alertText: "There is a problem in removing Leture" });
        });
  };

  // handle group selection events
  handleCheckboxSelections = (event) => {
    debugger;
    let newarray= this.state.students.map(object => ({ ...object }));
    switch (event.target.id) {
      case "select-st-all":
       
        newarray.map(e=>{
         e.status=this.state.present
      });
      this.setState({students:newarray});
        
        break;
      case "select-st-none":
        
        newarray.map(e=>{
          e.status=this.state.absent
       });
       this.setState({students:newarray});
        break;
      case "select-st-inverse":
        newarray.map(e=>{
          e.status= (e.status==this.state.present)?this.state.absent:this.state.present;
       });
       this.setState({students:newarray});
        break;
    }
    debugger;
    let listofStudents =newarray
      .filter((e) => e.status == this.state.present)
      .map((e) => e.id);
    this.setState({ presentStudentsToSend: listofStudents });

  };

  componentDidMount() {
    this.setState({ selectedLecture: 1 });
    this.getCourseList();
  }

  // using prepared list of students put the changes on the server
  sendStudentPresentChanges = () => {
    debugger;
    let lectureid = this.state.selectedLecture.extendedProps.id;
    let stbody = this.state.presentStudentsToSend;
    axios
      .put(`/lectures/${lectureid}/attendances`, { studentlist: stbody })
      .then((response) => {
        this.setState({ alertType: "success" });
        this.setState({
          alertText: "List of students are updated successfully",
        });
        this.ShowNotification();
      })
      .catch((error) => {
        this.setState({ alertType: "danger" });
        this.setState({ alertText: error.response.data.message.toString() });
        this.ShowNotification();
      });
  };

  // make a list of selected students and save it in a state property
  oncheckboxchange = (studentid, isPresent) => {
    var st = this.state.students.find((std) => {
      return std.id === studentid;
    });
    st.status = isPresent ? this.state.present : this.state.absent;

    this.state.students.splice(
      this.state.students.findIndex((std) => {
        return std.id === studentid;
      }),
      1,
      st
    );
    let listofStudents =Array.from( this.state.students
      .filter((e) => e.status == this.state.present)
      .map((e) => e.id));
    this.setState({ presentStudentsToSend: listofStudents });
  };

  

  render() {
    return (
      <>
        {this.state.alertShow && (
          <Alert className="fixed-top" variant={this.state.alertType}>
            {this.state.alertText}
          </Alert>
        )}

        <div id="CoursesElement" className="container">
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
                style={{ maxHeight: "75vh", overflow: "scroll" }}
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
              <Card.Header style={{ background: `${this.state.lectureColor}` }}>
                {" "}
                <div className="d-flex justify-content-between">
                  <h4>
                    <b>{this.state.lecturetitle}</b>
                  </h4>{" "}
                  <div>
                    <svg width="340" height="40">
                      <text fontSize="14" fontFamily="Verdana" x="7" y="22">
                        Remote Lectures
                      </text>
                      <rect
                        x="129"
                        y="3"
                        width="30"
                        height="30"
                        style={{
                          fill: "#F73D3D",
                          strokeWidth: 1,
                          stroke: "rgb(0,0,0)",
                        }}
                      />
                      <text fontSize="14" fontFamily="Verdana" x="169" y="22">
                        Presence Lectures
                      </text>
                      <rect
                        x="309"
                        y="3"
                        width="30"
                        height="30"
                        style={{
                          fill: "dodgerblue",
                          strokeWidth: 1,
                          stroke: "rgb(0,0,0)",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </Card.Header>
              <div className="row" style={{ margin: "1rem 0rem" }}>
                <div className="col-12">
                  <div className="col">
                    <WeeklyCalendar
                      handleEventClick={this.handleEventClick}
                      Items={this.formatEvents()}
                      renderEventContent={this.renderEventContent}
                      title={`Number of Lectures:${this.formatEvents().length}`}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div id="lecturelistview">
                    {this.formatEvents().filter((lecture) =>
                      moment(lecture.start).isSameOrAfter(
                        moment().startOf("day")
                      )
                    ).length > 0 ? (
                      <ListGroup
                        as="ul"
                        variant="flush"
                        style={{ margin: "1rem 0rem" }}
                      >
                        <ListGroup.Item key="head">
                          <div className="d-flex w-100 justify-content-center">
                            <div className="container">
                              <div className="row">
                                <div className="col-lg-2 d-flex justify-content-center">
                                  <label>Room</label>
                                </div>
                                <div className="col-lg-3 d-flex justify-content-center">
                                  <label>Date</label>
                                </div>
                                <div className="col-lg-3 d-flex justify-content-center">
                                  <label>Time</label>
                                </div>
                                <div className="col-lg-2 d-flex justify-content-center">
                                  <label>Status</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                        {this.formatEvents().map(
                          (lecture) =>
                            moment(lecture.start).isSameOrAfter(
                              moment().startOf("day")
                            ) && (
                              <LectureItem
                                key={lecture.extendedProps.id}
                                lecture={lecture}
                                handleConvert={this.handleConvertLecture}
                                handleBooking={this.cancelLectureHandle}
                              />
                            )
                        )}
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
                        No lectures available
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
                <div className="d-flex justify-content-between">
                  <h4>
                    <b>{this.state.studenttitle}</b> Students
                  </h4>{" "}
                  <Button
                    id="select-st-all"
                    onClick={(evt) => this.sendStudentPresentChanges(evt)}
                    className="m-1"
                    variant={
                      this.state.students.length > 0 ? "success" : "secondary"
                    }
                  >
                    ApplyChanges
                  </Button>
                </div>
              </Card.Header>
              <div className="row">
                <div className="col">
                  {this.state.students.length > 0 ? (
                    <ListGroup as="ul" variant="flush">
                      <ListGroup.Item>
                        <div className="d-flex w-100 justify-content-between">
                          <div className="container">
                            <div className="row">
                              <div className="col-lg-2 d-flex justify-content-center">
                                <label>Id</label>
                              </div>
                              <div className="col-lg-2 d-flex justify-content-center">
                                <label>Name</label>
                              </div>
                              <div className="col-lg-3 d-flex justify-content-center">
                                <label>Surname</label>
                              </div>
                              <div className="col-lg-3 d-flex justify-content-center">
                                <label>Email</label>
                              </div>
                              <div className="col-lg-2 d-flex justify-content-center">
                                <Button
                                  id="select-st-all"
                                  onClick={(evt) =>
                                    this.handleCheckboxSelections(evt)
                                  }
                                  variant="link"
                                >
                                  All
                                </Button>
                                <Button
                                  id="select-st-none"
                                  onClick={(evt) =>
                                    this.handleCheckboxSelections(evt)
                                  }
                                  variant="link"
                                >
                                  None
                                </Button>
                                <Button
                                  id="select-st-inverse"
                                  onClick={(evt) =>
                                    this.handleCheckboxSelections(evt)
                                  }
                                  variant="link"
                                >
                                  Inverse
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                      {this.state.students.map((student) => (
                        <StudentItem
                          key={student.id}
                          student={student}
                          oncheckboxchange={this.oncheckboxchange}
                          absent={this.state.absent}
                          present={this.state.present}
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
                      {!this.state.selectedLecture
                        ? "No lecture is selected"
                        : !this.state.selectedLecture.extendedProps
                        ? "No students booked for this lecture"
                        : this.state.selectedLecture.extendedProps.status ===
                          "distance"
                        ? "Remote lecture selected: no students list available"
                        : "No students booked for this lecture"}
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
