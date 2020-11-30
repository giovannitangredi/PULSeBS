import React from "react";
import Button from "react-bootstrap/Button";
export const BookedLecture = (props: any) => {
  const handleCancel = (evt :any) =>{
    if (evt) 
      evt.preventDefault();
    props.cancelBooking(props.lecture.id);
  }
  return (
    <tr>
      <td>{props.lecture.course}</td>
      <td>{props.lecture.name}</td>
      <td>
        {props.lecture.lecturer_name + " " + props.lecture.lecturer_surname}
      </td>
      <td>{props.lecture.start}</td>
      <td>{props.lecture.end}</td>
      <td>
        <Button variant="warning" onClick={ (evt)=> handleCancel(evt)}> Unbook </Button>
      </td>
    </tr>
  );
};
