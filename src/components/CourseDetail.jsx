import React, { useState } from "react";
import { Table, Form, Row, Col } from 'react-bootstrap';

export const CourseDetail = (props) => {
    const [courseList, setCourseList] = useState([
        {
            courseId: 1,
            courseName: 'Web App',
            bookingList: [
                {
                    lectureId: 1,
                    bookingNum: 32
                },
                {
                    lectureId: 2,
                    bookingNum: 20
                },
                {
                    lectureId: 3,
                    bookingNum: 30
                },
                {
                    lectureId: 4,
                    bookingNum: 30
                },
                {
                    lectureId: 5,
                    bookingNum: 30
                },
                {
                    lectureId: 6,
                    bookingNum: 30
                },
                {
                    lectureId: 7,
                    bookingNum: 30
                },
            ],
            averageMonthBookingList: [
                {
                    month: 2020-11,
                    average: 100
                },
                {
                    month: 2020-12,
                    average: 120
                },
                
            ],
            averageWeekBookingList: [
                {
                    week: 2020-47,
                    average: 10
                },
                {
                    week: 2020-48,
                    average: 25
                },
                
            ]
        },
        {
            courseId: 2,
            courseName: 'Web App 1',
            bookingList: [
                {
                    lectureId: 1,
                    bookingNum: 42
                },
                {
                    lectureId: 2,
                    bookingNum: 31
                },
            ],
            averageMonthBookingList: [
                {
                    month: 2020-11,
                    average: 170
                },
                {
                    month: 2020-12,
                    average: 130
                },
               
            ],
            averageWeekBookingList: [
                {
                    week: 2020-47,
                    average: 10
                },
                {
                    week: 2020-48,
                    average: 25
                },
            ]
        }
    ])
    return <Table size="sm">
        <thead>
            <tr>
                <th></th>
                <th>Course Id</th>
                <th>Course Name</th>
            </tr>
        </thead>
        <tbody>
            {
                courseList.map((item, index) => {
                    return <React.Fragment key={index}>
                        <tr>
                            <td>
                                <a data-toggle="collapse" href={`#collapse${item.courseId}`} role="button" aria-expanded="false" aria-controls="collapseExample">#</a>
                            </td>
                            <td>{item.courseId}</td>
                            <td>{item.courseName}</td>
                        </tr>
                        <tr className="collapse" id={`collapse${item.courseId}`}>
                            <td colSpan="4">
                                <div>
                                    <div className="card card-body">
                                        <div style={{ marginBottom: 20 }}>
                                            <a style={{ marginBottom: 5 }} className="btn btn-secondary" data-toggle="collapse" href={`#booking-collapse-${item.courseId}`} role="button" aria-expanded="false" aria-controls="collapseExample">
                                                Previous Lecture Booking Number
                                            </a>
                                            <div className="collapse" id={`booking-collapse-${item.courseId}`}>
                                                <div className="card card-body" style={{ padding: 10 }}>
                                                    {
                                                        item.bookingList.map((item, index) => {
                                                            return <div key={index}>Lecture {item.lectureId}: {item.bookingNum}</div>
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <Form>
                                            <Row>
                                                <Col>
                                                    <Form.Control size="sm" as="select">
                                                        {
                                                            item.averageMonthBookingList.map((item, index) => {
                                                                return <option key={index}>Month {item.month}</option>
                                                            })
                                                        }
                                                    </Form.Control>
                                                    <div style={{ margin: '5px 0px' }}>
                                                        <div className="alert alert-success" role="alert">
                                                            Average number per month: {item.averageMonthBookingList[0].average}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col>
                                                    <Form.Control size="sm" as="select">
                                                        {
                                                            item.averageWeekBookingList.map((item, index) => {
                                                                return <option key={index}>Week {item.week}</option>
                                                            })
                                                        }
                                                    </Form.Control>
                                                    <div style={{ margin: '5px 0px' }}>
                                                        <div className="alert alert-success" role="alert">
                                                            Average number per week: {item.averageWeekBookingList[0].average}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </React.Fragment>
                })
            }

        </tbody>
    </Table>
}