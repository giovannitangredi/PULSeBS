import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table"
import {BookedLecture} from "./BookedLecture"
export const BookedLectureList = (props:any)=>{
   
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
                </tr>
            </thead>
            <tbody>
                {props.lectures.map((lecture : any) => <BookedLecture key={lecture.id} lecture={lecture}></BookedLecture>)}
            </tbody>
        </Table>
    );
}