import React, { ChangeEvent, useEffect, useState } from "react";
// import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Col, Form, Row, Tab, Table, Tabs } from "react-bootstrap";
import { CourseDetail } from "./TeacherStatistics";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

export const SupportOfficerPage = (props) => {

    const [loading, setLoading] = useState(false);
    return <></>
}