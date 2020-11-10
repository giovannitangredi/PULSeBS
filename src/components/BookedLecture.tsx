import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button"
export const BookedLecture = (props: any)=>{
    
    return (
        <tr>
            <td>{props.lecture.course}</td>
            <td>{props.lecture.name}</td>
            <td>{props.lecture.lecturer}</td>
            <td>{props.lecture.start}</td>
            <td>{props.lecture.end}</td>
        </tr>
    );
}