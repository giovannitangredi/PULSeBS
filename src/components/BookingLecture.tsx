import React from "react";
import Button from "react-bootstrap/Button";
import moment from "moment";
export const BookingLecture = (props: any) => {
  const handleBooking = (evt: any) => {
    if (evt) evt.preventDefault();
    props.bookLecture(props.lecture.id);
  };
  const styles = {
    col: {
      border: "ridge",
      borderWidth: "0 0.1em 0.1em 0.1em",
    },
  };

  const actionButton =
    props.lecture.status !== "distance" &&
    props.lecture.booked_students < props.lecture.capacity ? (
      <Button variant="primary" onClick={(event) => handleBooking(event)}>
        Book a Seat
      </Button>
    ) : props.lecture.candidate ? (
      <Button variant="secondary" disabled>
        You are on the waiting list
      </Button>
    ) : (
      <Button variant="warning" onClick={(event) => handleBooking(event)}>
        Enter the waiting list
      </Button>
    );
  return (
    <tr>
      <td style={styles.col}>{props.lecture.course}</td>
      <td style={styles.col}>
        {props.lecture.lecturer_name + " " + props.lecture.lecturer_surname}
      </td>
      <td style={styles.col}>
        {props.lecture.status === "presence"
          ? "Room " + props.lecture.room
          : "Virtual Classroom"}
      </td>
      <td style={styles.col}>
        {moment(props.lecture.start).format("dddd, MMMM Do YYYY")}
      </td>
      <td style={styles.col}>
        {moment(props.lecture.start)
          .format("HH:mm")
          .concat("-" + moment(props.lecture.end).format("HH:mm"))}
      </td>
      <td style={styles.col}>
        {props.lecture.status === "presence" ? (
          <>
            {props.lecture.booked_students}/{props.lecture.capacity}
          </>
        ) : (
          "Online"
        )}
      </td>
      <td style={styles.col}> {actionButton}</td>
    </tr>
  );
};
