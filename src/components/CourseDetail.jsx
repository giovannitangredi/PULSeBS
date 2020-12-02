import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Table,
  Form,
  Row,
  Col,
  ButtonGroup,
  Button,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import { DatePickerComponent } from "./DatePickerComponent";

export const CourseDetail = (props) => {
  const [myCourses, setMyCourses] = useState([]);
  const [courseFilter, setcourseFilter] = useState([]);
  const [bookedLectures, setBookedLectures] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [weeksBetween, setWeeksBetween] = useState([]);
  const [monthsBetween, setMonthsBetween] = useState([]);

  /* get http call */
  function GetFromServer(URL) {
    return axios
      .get(URL)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return { success: false };
      });
  }

  /*get CourseList */
  const getCourseList = () => {
    axios.get(`/courses/`, {}).then((response) => {
      let result = response.data;
      setMyCourses(result);
    });
  };
  useEffect(() => {
    getCourseList();
  }, []);

  /* filterCourses and get the related data from servre */
  const filterCourses = async (filter, enabled) => {
    if (filter) {
      let newFilter = courseFilter;
      if (filter != undefined) {
        if (enabled) {
          newFilter.push(filter);
          await setcourseFilter(newFilter);
        } else {
          newFilter = newFilter.filter((x) => x != filter);
          setcourseFilter(newFilter);
          await setcourseFilter(newFilter);
        }
      }
    }
  };

  const getrelateddatafromserver = () => {
    let weekdays = [];
    let listofweeks = evaluatelistofDates(startDate, endDate);
    listofweeks.forEach((week) => {
      weekdays.push(
        week.startDate.getFullYear().toString() +
          "-" +
          week.startDate.getWeek().toString()
      );
    });
    setWeeksBetween(weekdays);
    let months = [];
    getMonthList(startDate, endDate).forEach((month) => {
      months.push(month);
    });
    setMonthsBetween(months);
    
    let promiseArray = [];
    let promiseArray2 = [];
    let lectures = [];
    let reservations = [];

    weeksBetween.forEach((weekStartDate) => {
      courseFilter.forEach((id) => {
        promiseArray.push(
          GetFromServer(`/courses/${id}/bookings?week=${weekStartDate}`)
        );
      });
    });

    monthsBetween.forEach((monthStartDate) => {
      courseFilter.forEach((id) => {
        promiseArray.push(
          GetFromServer(`/courses/${id}/bookings?month=${monthStartDate}`)
        );
      });
    });
    courseFilter.forEach((id) => {
      promiseArray2.push(GetFromServer(`/courses/${id}/bookings`));
    });

    Promise.all(promiseArray)
      .then((values) => {
        values.forEach((lecture) => {
          lecture.forEach((lecture2) => {
            lectures.push(lecture2);
          });
        });
        setBookedLectures(lectures);
      })
      .catch((reason) => {
        console.log(reason);
      });
    Promise.all(promiseArray2)
      .then((values) => {
        values.forEach((reservation) => {
          reservation.forEach((reservation2) => {
            console.log(reservation2);
            reservations.push(reservation2);
          });
        });

        setReserved(reservations);
        console.log(weeksBetween)
        console.log(monthsBetween)
      })
      .catch((reason) => {
        console.log(reason);
      });
  };

  /*renders the sidebar with checkboxes */
  const CourslistRenderer = (b) => {
    return (
      <div
        className="custom-control custom-checkbox mt-3"
        key={`chkBrand_${b.id}`}
      >
        <input
          type="checkbox"
          className="custom-control-input"
          id={`chkBrand_${b.id}`}
          onClick={(ev) => filterCourses(`${b.id}`, ev.target.checked)}
        />
        <label className="custom-control-label" htmlFor={`chkBrand_${b.id}`}>
          {b.name}{" "}
        </label>
      </div>
    );
  };
  /*get list of weeks between two dates */
  const getMonthList = (startDate, endDate) => {
    var dateStart = moment(startDate);
    var dateEnd = moment(endDate);
    var timeValues = [];
    while (
      dateStart.format("YYYY-MM") <= dateEnd.format("YYYY-MM")
    ) {
      timeValues.push(dateStart.format("YYYY-MM"));
      dateStart.add(1, "months");
    }

    return timeValues;
  };
  /*gets the week number of a date */
  Date.prototype.getWeek = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof dowOffset == "int" ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = day >= 0 ? day : day + 7;
    var daynum =
      Math.floor(
        (this.getTime() -
          newYear.getTime() -
          (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
          86400000
      ) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
      weeknum = Math.floor((daynum + day - 1) / 7) + 1;
      if (weeknum > 52) {
        let nYear = new Date(this.getFullYear() + 1, 0, 1);
        let nday = nYear.getDay() - dowOffset;
        nday = nday >= 0 ? nday : nday + 7;
        /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
        weeknum = nday < 4 ? 1 : 53;
      }
    } else {
      weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
  };
  /* this is called when end start of datepicker is changed */
  const datePickerHandle = (sdate) => {
    setStartDate(sdate);
  };
  const datePickerHandle2 = (edate) => {
    setEndDate(edate);
  };

  /*gets the weeks in between 2 dates */
  const evaluatelistofDates = (startd, endd) => {
    let sDate;
    let eDate;
    let dateArr = [];
    let tempstart = new Date(startd);
    let tempend = new Date(endd);

    while (tempstart <= tempend) {
      if (tempstart.getDay() == 1 || (dateArr.length == 0 && !sDate)) {
        sDate = new Date(tempstart.getTime());
      }

      if (
        (sDate && tempstart.getDay() == 0) ||
        tempstart.getTime() == tempend.getTime()
      ) {
        eDate = new Date(tempstart.getTime());
      }

      if (sDate && eDate) {
        dateArr.push({ startDate: sDate, endDate: eDate });
        sDate = undefined;
        eDate = undefined;
      }

      tempstart.setDate(tempstart.getDate() + 1);
    }
    return dateArr;
  };
  return (
    <>
      <div className="container">
        <div className="d-flex w-100 justify-content-start shadow bg-light py-3 my-3 rounded border border-secondary">
          <label className="px-3 font-weight-bold">Choose a date range: </label>
          <DatePickerComponent
            className="mx-3"
            startDateHandle={datePickerHandle}
            endDateHandle={datePickerHandle2}
          />
          <Button variant="primary mx-3" onClick={getrelateddatafromserver}>
            Apply
          </Button>
        </div>
        <div className="row">
          <ListGroup
            variant="flush"
            className="shadow-sm py-3 mb-5 bg-white rounded col-md-3  p-4 m-4 "
          >
            <div className="col-sm-2">
              <span className="badge BackgroundThemeColor">Courses:</span>
            </div>
            {myCourses && myCourses.map((item) => CourslistRenderer(item))}
          </ListGroup>
          <div className="shadow-sm p-4  mt-4 ml-4 bg-white rounded col-md-8">
            <Table size="sm">
              <thead>
                <tr>
                  <th></th>
                  <th>Course Name</th>
                  <th>Week</th>
                  <th>Month</th>
                  <th>NumberOfBooking</th>
                </tr>
              </thead>
              <tbody>
                {bookedLectures &&
                  bookedLectures.map((item, index) => {
                    console.log(item);
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td></td>
                          <td>{item.course_name}</td>
                          <td>{item.week}</td>
                          <td>{item.month}</td>
                          <td>{item.booking}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </Table>

            <Table size="sm">
              <thead>
                <tr>
                  <th></th>
                  <th>Course Name</th>
                  <th>Lecture Name</th>
                  <th>NumberOfBooking</th>
                </tr>
              </thead>
              <tbody>
                {reserved &&
                  reserved.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td></td>
                          <td>{item.course_name}</td>
                          <td>{item.lecture_name}</td>
                          <td>{item.booking}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};
