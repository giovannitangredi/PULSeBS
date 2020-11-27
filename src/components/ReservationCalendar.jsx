//import React from 'react';
import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import LectureItem from "./LectureItem";
import CourseItem from "./CourseItem";
import StudentItem from "./StudentItem";
import axios from "axios";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";

class ReservationCalendar extends React.Component {
  constructor(props) {
    super(props);
  }

  /* returns prepared information for calendar */
  formatEvents = () => {
    // 3788d8 is blue and 37ecd8 is green
    return this.props.lectures
      .map((obj) => ({ ...obj, color: `#3788d8` }))
      .concat(
        this.props.bookedLectures.map((obj) => ({ ...obj, color: `#37ecd8` }))
      )
      .map((lecture) => {
        const {
          name,
          end,
          start,
          capacity,
          booked_students,
          id,
          course,
          lecturer_name,
          lecturer_surname,
          color,
        } = lecture;

        let startTime = new Date(start);
        let endTime = new Date(end);

        return {
          title: name,
          start: startTime,
          end: endTime,
          extendedProps: {
            capacity: capacity,
            booked_students: booked_students,
            course,
            id,
            lecturer_name,
            lecturer_surname,
            color,
            name,
          },
        };
      });
  };

  /* prepare calendar event format */
  renderEventContent(eventInfo) {
    if (eventInfo)
      return (
        <div
          className="rounded row align-items-center justify-content-center"
          style={{
            width: "104%",
            height: "104%",
            marginLeft: "-2%",
            marginTop: "-2%",
            color: "#000000",
            fontWeight: "bold",
            fontSize: "0.85rem",
            background: `${eventInfo.event.extendedProps.color}`,
            border: "4px solid #000000;",
          }}
        >
          <p>
            {eventInfo.event.title}
            {" - "}
            {eventInfo.event.extendedProps.course}
            {" by "}
            {eventInfo.event.extendedProps.lecturer_name}{" "}
            {eventInfo.event.extendedProps.lecturer_surname} Capacity:
            {eventInfo.event.extendedProps.capacity}{" "}
          </p>
        </div>
      );
    else return null;
  }
  /* load students list for the lecture and focus */
  handleEventClick = ({ event }) => {
    this.scrolltoview("studentlistview");
    let lectureid = event._def.extendedProps.id;
    this.setState({ studenttitle: event._def.extendedProps.name });
    this.getStudentList(lectureid);
  };

  render() {
    return (
      <>
        <div id="WeeklyCalendarContainer">
          <Card
            border={"secondary"}
            style={{
              width: "100%",

              background: "rgb(254 254 254)",
            }}
          >
            <Card.Header>
              {" "}
              <div className="d-flex justify-content-between">
                <h4>Lectures</h4>{" "}
                <div>
                  <svg width="340" height="40">
                    <text font-size="14" font-family="Verdana" x="7" y="22">
                      Booked Lectures
                    </text>
                    <rect
                      x="129"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: "#37ecd8",
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    {/* 3788d8 is blue and 37ecd8 is green */}
                    <text font-size="14" font-family="Verdana" x="169" y="22">
                      UnBooked Lectures
                    </text>
                    <rect
                      x="309"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: "#3788d8",
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                  </svg>
                </div>
              </div>
            </Card.Header>
            <div className="row" style={{ margin: "1rem 0rem" }}>
              <div className="col">
                <WeeklyCalendar
                  handleEventClick={this.handleEventClick}
                  Items={this.formatEvents()}
                  renderEventContent={this.renderEventContent}
                  title={`Number of Lectures:${this.formatEvents().length}`}
                />
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }
}

export default ReservationCalendar;
