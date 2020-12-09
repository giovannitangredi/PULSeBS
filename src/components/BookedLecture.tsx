import React from "react";
import Button from "react-bootstrap/Button";
export const BookedLecture = (props: any) => {
  const styles = {
    col: {
      border: "ridge",
      borderWidth: "0 0.1em 0.1em 0.1em",
    },
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
      <td style={styles.col}>{props.lecture.status}</td>
      <td style={styles.col}>{props.lecture.start}</td>
      <td style={styles.col}>{props.lecture.end}</td>
      <td style={styles.col}>
        <Button variant="warning" onClick={(evt) => handleCancel(evt)}>
          {" "}
          Unbook{" "}
        </Button>
      </td>
    </tr>
  );
};
