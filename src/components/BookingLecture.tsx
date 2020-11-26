import React from "react";
import Button from "react-bootstrap/Button";
export const BookingLecture = (props: any) => {
  const handleBooking = (evt: any) => {
    if (evt) evt.preventDefault();
    props.bookLecture(props.lecture.id);
  };
  const styles = {
    col: {
      border : "ridge",
      borderWidth : "0 0.1em 0.1em 0.1em"
    },
  };
  return (
    <tr>
      <td style= {styles.col}>{props.lecture.course}</td>
      <td style= {styles.col}>{props.lecture.name}</td>
      <td style= {styles.col}>
        {props.lecture.lecturer_name + " " + props.lecture.lecturer_surname}
      </td>
      <td style= {styles.col}>{props.lecture.status}</td>
      <td style= {styles.col}>{props.lecture.start}</td>
      <td style= {styles.col}>{props.lecture.end}</td>
      <td style= {styles.col}>
        {props.lecture.booked_students}/{props.lecture.capacity}
      </td>
      <td style= {styles.col}>
        {" "}
      {props.lecture.booked_students < props.lecture.capacity && props.lecture.status!="distance" && <Button variant="primary" onClick={(event) => handleBooking(event)}>
          Book a Seat
          </Button> }
          {props.lecture.booked_students >= props.lecture.capacity && props.lecture.status!="distance" &&  <Button variant="warning">
          Full
          </Button> }
      </td>
    </tr>
  );
};
