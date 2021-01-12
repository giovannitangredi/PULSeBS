import React from "react";
import Button from "react-bootstrap/Button";
import moment from "moment";

export const BookedLecture = (props: any) => {
  const greenColor = "#36D745";
  const styles = {
    col: {
      border: "ridge",
      borderWidth: "0 0.1em 0.1em 0.1em",
    },
    last : {
      border: "none",
    },
    button : {
      backgroundColor : greenColor,
      color : "black",
      borderColor : greenColor
    }
  };
  const handleCancel = (evt: any) => {
    if (evt) evt.preventDefault();
    props.cancelBooking(props.lecture.id);
  };
  return (
    <tr>
      <td style={styles.col}>{props.lecture.course}</td>
      <td style={styles.col}>
        {props.lecture.lecturer_name + " " + props.lecture.lecturer_surname}
      </td>
      <td style={styles.col}>
        {props.lecture.status === "presence" && "Room " + props.lecture.room}
      </td>
      <td style={styles.col}>
        {moment(props.lecture.start).format("dddd, MMMM Do YYYY")}
      </td>
      <td style={styles.col}>
        {moment(props.lecture.start)
          .format("HH:mm")
          .concat("-" + moment(props.lecture.end).format("HH:mm"))}
      </td>
      <td style={styles.last}>
        <Button style = {styles.button} onClick={(evt) => handleCancel(evt)}>
          {" "}
          Unbook{" "}
        </Button>
      </td>
    </tr>
  );
};
