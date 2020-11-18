import React, { useEffect, useState } from "react";
export const BookedLecture = (props: any) => {
  return (
    <tr>
      <td>{props.lecture.course}</td>
      <td>{props.lecture.name}</td>
      <td>
        {props.lecture.lecturer_name + " " + props.lecture.lecturer_surname}
      </td>
      <td>{props.lecture.start}</td>
      <td>{props.lecture.end}</td>
    </tr>
  );
};
