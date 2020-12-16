//import React from 'react';
import React from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";
import moment from "moment";

const greenColor = "#36D745";
const blueColor = "dodgerblue";
const redColor = "#F73D3D";
class ReservationCalendar extends React.Component {
  /* returns prepared information for calendar */
  formatEvents = () => {
    console.log(this.props);
    return this.props.lectures
      .map((obj) => {
        let color = "";
        if (obj.capacity === obj.booked_students) {
          if (obj.candidate) {
            color = "#6c757d";
          } else {
            color = "#ffc107";
          }
        } else {
          color = obj.status === "distance" ? redColor : blueColor;
        }
        return { ...obj, color, booked: false };
      })
      .concat(
        this.props.bookedLectures.map((obj) => ({
          ...obj,
          booked: true,
          color: greenColor,
        }))
      )
      .map((lecture) => {
        const {
          //name,
          end,
          start,
          capacity,
          booked_students,
          booked,
          id,
          course,
          lecturer_name,
          lecturer_surname,
          color,
          status,
          candidate,
          room,
        } = lecture;
        let startTime = new Date(start);
        let endTime = new Date(end);

        return {
          //title: name,
          start: startTime,
          end: endTime,
          backgroundColor: color,
          display: "block",
          borderColor: "#000000",
          extendedProps: {
            capacity: capacity,
            booked_students: booked_students,
            course,
            id,
            lecturer_name,
            lecturer_surname,
            color,
            status,
            candidate,
            booked,
            start: startTime,
            room,
          },
        };
      });
  };

  /* prepare calendar event format */
  renderEventContent(eventInfo) {
    if (eventInfo)
      return (
        <div
          className=" text-wrap rounded row align-items-center m-0 d-flex justify-content-center"
          style={{
            width: "100%",
            height: "100%",
            color: "#000000",
            fontWeight: "500",
            fontSize: "0.85rem",
            border: "4px solid #000000",
          }}
        >
          <p className="my-2 text-center">
            {eventInfo.event.extendedProps.course}
            <br></br>
            {eventInfo.event.extendedProps.lecturer_name}{" "}
            {eventInfo.event.extendedProps.lecturer_surname}
            {eventInfo.event.extendedProps.status == "presence" && (
              <>
                <br />
                Room {eventInfo.event.extendedProps.room} Seats:{" "}
                {eventInfo.event.extendedProps.capacity}
              </>
            )}
          </p>
        </div>
      );
    else return null;
  }
  /* if bookable try to book it */
  handleEventClick = ({ event }) => {
    const {
      id,
      status,
      candidate,
      booked,
      start,
      booked_students,
      capacity,
    } = event._def.extendedProps;
    const confirmText =
      status === "presence" &&
      !booked &&
      !candidate &&
      (booked_students < capacity
        ? "Do you want to book this lecture?"
        : "Do you want to be added to the booking waiting list of this lecture?");

    moment(start, "YYYY-MM-DD hh:mm:ss").isAfter(moment()) &&
      confirmText &&
      window.confirm(confirmText) &&
      this.props.bookLecture(id);
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
                  <svg width="850" height="40">
                    <text fontSize="14" fontFamily="Verdana" x="7" y="22">
                      Booked Lectures
                    </text>
                    <rect
                      x="129"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: greenColor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="169" y="22">
                      Unbooked Lectures
                    </text>
                    <rect
                      x="309"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: blueColor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="350" y="22">
                      Remote Lectures
                    </text>
                    <rect
                      x="475"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: redColor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="510" y="22">
                      Full Lectures
                    </text>
                    <rect
                      x="605"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `#ffc107`,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="645" y="22">
                      Waiting List
                    </text>
                    <rect
                      x="755"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `#6c757d`,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                     <text fontSize="14" fontFamily="Verdana" x="510" y="22">
                      Full Lectures
                    </text>
                    <rect
                      x="605"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `#ffc107`,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="645" y="22">
                      In Waiting List
                    </text>
                    <rect
                      x="755"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `#6c757d`,
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
