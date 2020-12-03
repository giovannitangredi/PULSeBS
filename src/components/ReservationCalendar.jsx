//import React from 'react';
import React from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import Card from "react-bootstrap/Card";

class ReservationCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      greenColor: "#36D745", // 3788d8 is blue and 37ecd8 is green
      blueColor: "dodgerblue",
      redColor: "#F73D3D"
    };
  }

  /* returns prepared information for calendar */
  formatEvents = () => {
    console.log(this.props)
    return this.props.lectures
      .map((obj) => ({ ...obj, color: obj.status === "distance" ? this.state.redColor : this.state.blueColor }))
      .concat(
        this.props.bookedLectures.map((obj) => ({
          ...obj,
          color: `${this.state.greenColor}`,
        }))
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
          backgroundColor: color,
          display: "block",
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
            fontWeight: "500",
            fontSize: "0.85rem",
            
            border: "4px solid #000000;",
          }}
        >
          <p>
            {eventInfo.event.title}
            <br></br>
            {eventInfo.event.extendedProps.course}
            <br></br>
            {eventInfo.event.extendedProps.lecturer_name}{" "}
            {eventInfo.event.extendedProps.lecturer_surname}<br></br>
             Capacity:
            {eventInfo.event.extendedProps.capacity}{" "}
          </p>
        </div>
      );
    else return null;
  }
  /* if bookable try to book it */
  handleEventClick = ({ event }) => {
    if (event._def.extendedProps.color == this.state.blueColor)
      if (window.confirm("Do you want to book this lecture?"))
        this.props.bookLecture(event._def.extendedProps.id);
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
                  <svg width="510" height="40">
                    <text font-size="14" font-family="Verdana" x="7" y="22">
                      Booked Lectures
                    </text>
                    <rect
                      x="129"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `${this.state.greenColor}`,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text font-size="14" font-family="Verdana" x="169" y="22">
                      UnBooked Lectures
                    </text>
                    <rect
                      x="309"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `${this.state.blueColor}`,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }}
                    />
                    <text font-size="14" font-family="Verdana" x="350" y="22">
                      Remote Lectures
                    </text>
                    <rect
                      x="475"
                      y="3"
                      width="30"
                      height="30"
                      style={{
                        fill: `${this.state.redColor}`,
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
