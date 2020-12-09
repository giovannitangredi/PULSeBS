import React from "react";
import Table from "react-bootstrap/Table";
import { BookedLecture } from "./BookedLecture";
export const BookedLectureList = (props) => {
  const styles = {
    head: {
      border: "ridge",
      borderWidth: "0 0.1em 0.1em 0.1em",
    },
  };
  return (
    <Table striped bordered={true} hover>
      <thead>
        <tr>
          <th style={styles.head}>Course</th>
          <th style={styles.head}>Professor</th>
          <th style={styles.head}>Status</th>
          <th style={styles.head}>Start</th>
          <th style={styles.head}>End</th>
          <th style={styles.head}></th>
        </tr>
      </thead>
      <tbody>
        {props.lectures.length > 0 &&
          props.lectures.map((lecture) => (
            <BookedLecture
              key={lecture.id}
              lecture={lecture}
              cancelBooking={props.cancelBooking}
            ></BookedLecture>
          ))}
      </tbody>
    </Table>
  );
};
