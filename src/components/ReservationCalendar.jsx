//import React from 'react';
import React from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";
import moment from "moment";

const greenColor = "#36D745";
const blueColor = "dodgerblue";
const redColor = "#F73D3D";
const graycolor = "#6c757d";
const yellowcolor = "#ffc107";

const lectureTypes = {
  bookable: "./imgs/presence.png",
  candidate: "./imgs/candidate.png",
  full: "./imgs/full.png",
  distance: "./imgs/online.png",
  presence: "./imgs/presence.png",
};

class ReservationCalendar extends React.Component {
  /* returns prepared information for calendar */
  formatEvents = () => {
    console.log(this.props);
    return this.props.lectures
      .map((obj) => {
        let lectureState = "";
        let color = blueColor;
        if (obj.capacity === obj.booked_students) {
          if (obj.candidate) {
            lectureState = lectureTypes.candidate;
          } else {
            lectureState = lectureTypes.full;
          }
        } else {
          lectureState =
            obj.status === "distance"
              ? lectureTypes.distance
              : lectureTypes.bookable;
        }
        return { ...obj, color, booked: false, lectureState };
      })
      .concat(
        this.props.bookedLectures.map((obj) => ({
          ...obj,
          booked: true,
          color: greenColor,
          lectureState: lectureTypes.presence,
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
          lectureState,
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
            lectureState,
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
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          <div className="my-2 text-center">
            <img
              className=" flex-fill align-self-center"
              src={eventInfo.event.extendedProps.lectureState}
              style={{
                height: "40px",
              }}
            />
            <p className="my-2 text-center">
              {eventInfo.event.extendedProps.course}
              <br></br>
              {eventInfo.event.extendedProps.lecturer_name}{" "}
              {eventInfo.event.extendedProps.lecturer_surname}
              {eventInfo.event.extendedProps.status == "presence" && (
                <>
                  <br />
                  Room {eventInfo.event.extendedProps.room} Seats:{" "}
                  {eventInfo.event.extendedProps.booked_students +
                    "/" +
                    eventInfo.event.extendedProps.capacity}
                </>
              )}
              {eventInfo.event.extendedProps.status != "presence" && (
                <>
                  <br />
                  Capacity:{" "}
                  {eventInfo.event.extendedProps.booked_students +
                    "/" +
                    eventInfo.event.extendedProps.capacity}
                </>
              )}
            </p>
          </div>
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
                  <svg width="850" height="45">
                    <rect
                      x="25"
                      y="0"
                      width="400"
                      height="60"
                      style={{
                        fill: "rgb(253,253,253)",
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <rect
                      x="400"
                      y="0"
                      width="500"
                      height="60"
                      style={{
                        fill: "rgb(253,253,253)",
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="40" y="26">
                      Booked Lectures
                    </text>
                    <rect
                      x="165"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: greenColor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="210" y="26">
                      Unbooked Lectures
                    </text>
                    <rect
                      x="350"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: blueColor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="405" y="26">
                      Presence
                    </text>
                    <rect
                      x="470"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <image
                      href={lectureTypes.presence}
                      x="470"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="520" y="26">
                      Remote
                    </text>
                    <rect
                      x="580"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <image
                      href={lectureTypes.distance}
                      x="580"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="625" y="26">
                      Full
                    </text>
                    <rect
                      x="655"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />{" "}
                    <image
                      href="./imgs/full.svg"
                      x="645"
                      y="7"
                      width="68"
                      height="68"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text fontSize="14" fontFamily="Verdana" x="693" y="26">
                      In Waiting List
                    </text>
                    <rect
                      x="800"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <image
                      href="./imgs/candidate.svg"
                      x="800"
                      y="7"
                      width="30"
                      height="30"
                      style={{
                        fill: graycolor,
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
