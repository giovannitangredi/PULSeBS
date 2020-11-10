import React, { useEffect, useState } from "react";
import {BookingLectureList} from "./BookingLectureList"
import {BookedLectureList} from "./BookedLectureList"
import Container from "react-bootstrap/Container"
export const ReservationPage = (props:any)=>{
   
    useEffect(()=>{
        props.getReservations();
    },[]) 
    return (
        <Container>
            <h1>Book a Lecture</h1>
            <BookingLectureList lectures={props.lectures} bookLecture= {props.bookLecture}></BookingLectureList>
            <h1>Booked Lectures</h1>
            <BookedLectureList  lectures={props.bookedLectures}></BookedLectureList>
        </Container>
    );
}