import React from "react";
import Table from "react-bootstrap/Table";
import { BookingLecture } from "./BookingLecture";
export const BookingLectureList = (props) => {
  const styles = {
    head: {
      border: "ridge",
      borderWidth: "0 0.1em 0.1em 0.1em",
    },
    last : {
      border: "none",
    },
  };
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th style={styles.head}>Course</th>
          <th style={styles.head}>Professor</th>
          <th style={styles.head}>Room</th>
          <th style={styles.head}>Date</th>
          <th style={styles.head}>Time</th>
          <th style={styles.head}>Capacity</th>
          <th style={styles.last}></th>
        </tr>
      </thead>
      <tbody>
        {props.lectures.length > 0 &&
          props.lectures.map((lecture) => (
            <BookingLecture
              key={lecture.id}
              lecture={lecture}
              bookLecture={props.bookLecture}
            ></BookingLecture>
          ))}
      </tbody>
    </Table>
  );
};
