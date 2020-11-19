import React from "react";
import Table from "react-bootstrap/Table";
import { BookingLecture } from "./BookingLecture";
export const BookingLectureList = (props) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Course</th>
          <th>Lecture</th>
          <th>Professor</th>
          <th>Start</th>
          <th>End</th>
          <th>Capacity</th>
          <th></th>
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
