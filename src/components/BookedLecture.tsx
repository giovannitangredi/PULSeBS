import React from "react";
export const BookedLecture = (props: any) => {
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
    </tr>
  );
};
