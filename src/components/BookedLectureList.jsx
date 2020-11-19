import React from "react";
import Table from "react-bootstrap/Table";
import { BookedLecture } from "./BookedLecture";
export const BookedLectureList = (props) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Course</th>
          <th>Lecture</th>
          <th>Professor</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        {props.lectures.length > 0 &&
          props.lectures.map((lecture) => (
            <BookedLecture key={lecture.id} lecture={lecture}></BookedLecture>
          ))}
      </tbody>
    </Table>
  );
};
