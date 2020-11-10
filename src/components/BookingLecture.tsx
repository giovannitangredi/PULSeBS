import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button"
export const BookingLecture = (props: any)=>{
    const handleBooking = (evt : any)=>{
        if (evt) evt.preventDefault();
        props.bookLecture(props.lecture.id,1);
    }
    return (
        <tr>
            <td>{props.lecture.course}</td>
            <td>{props.lecture.name}</td>
            <td>{props.lecture.lecturer}</td>
            <td>{props.lecture.start}</td>
            <td>{props.lecture.end}</td>
            <td>{props.lecture.booked_students}/{props.lecture.capacity}</td>
            <td> <Button variant="primary" onClick = {(event) => handleBooking(event)}>Book a Seat</Button></td>
        </tr>
    );
}