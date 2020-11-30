import React from "react";
import Button from "react-bootstrap/Button";
export const BookingLecture = (props: any) => {
  const handleBooking = (evt: any) => {
    if (evt) evt.preventDefault();
    props.bookLecture(props.lecture.id);
  };
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
        {props.lecture.booked_students}/{props.lecture.capacity}
      </td>
      <td>
        {" "}
      {props.lecture.booked_students < props.lecture.capacity && <Button variant="primary" onClick={(event) => handleBooking(event)}>
          Book a Seat
          </Button> }
          {props.lecture.booked_students >= props.lecture.capacity && <Button variant="warning">
          Full
          </Button> }
      </td>
    </tr>
  );
};
