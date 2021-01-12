import React, { useEffect, useState } from "react";
import moment from "moment";
import { Table, Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import { StaticCharts } from './StaticCharts';
import { DatePickerComponent } from "./DatePickerComponent";

export const CourseDetail = (props) => {
  const [myCourses, setMyCourses] = useState([]);
  const [courseFilter, setcourseFilter] = useState([]);
  const [bookedLectures, setBookedLectures] = useState([]);
  const [reserved, setReserved] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  //  const [weeksBetween, setWeeksBetween] = useState([]);
  //  const [monthsBetween, setMonthsBetween] = useState([]);
  const [monthLectures, setMonthLectures] = useState([]);

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
          setcourseFilter(newFilter);
        } else {
          newFilter = newFilter.filter((x) => x != filter);
          setcourseFilter(newFilter);
          setcourseFilter(newFilter);
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
    // setWeeksBetween(weekdays);
    let months = [];
    getMonthList(startDate, endDate).forEach((month) => {
      months.push(month);
    });
    // setMonthsBetween(months);

    let promiseArray = [];
    let promiseArray2 = [];
    let promiseArray3 = [];
    let lectures = [];
    let reservations = [];
    let lecturesMonth = [];

    courseFilter.forEach((id) => {
      promiseArray.push(
        GetFromServer(
          `/courses/${id}/bookings?fromWeek=${startDate
            .getFullYear()
            .toString()}-${startDate
              .getWeek()
              .toString()}&toWeek=${endDate
                .getFullYear()
                .toString()}-${endDate.getWeek().toString()}`
        )
      );
    });

    courseFilter.forEach((id) => {
      promiseArray3.push(
        GetFromServer(
          `/courses/${id}/bookings?fromMonth=${startDate
            .getFullYear()
            .toString()}-${startDate.getMonth() + (1).toString()
          }&toMonth=${endDate.getFullYear().toString()}-${endDate.getMonth() + 1
          }`
        )
      );
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
            reservations.push(reservation2);
          });
        });
        setReserved(
          reservations.filter(
            (l) =>
              l.date >= moment(startDate).format("YYYY-MM-DD") &&
              l.date <= moment(endDate).format("YYYY-MM-DD")
          )
        );
      })
      .catch((reason) => {
        console.log(reason);
      });
    Promise.all(promiseArray3)
      .then((values) => {
        values.forEach((lecture) => {
          lecture.forEach((lecture2) => {
            lecturesMonth.push(lecture2);
          });
        });
        setMonthLectures(lecturesMonth);
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
  const getMonthList = (startD, endD) => {
    var dateStart = moment(startD);
    var dateEnd = moment(endD);
    var timeValues = [];

    while (dateStart.format("YYYY-MM") <= dateEnd.format("YYYY-MM")) {
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
      <div className="container col-sm-9">
        <div className="d-flex w-100 justify-content-center shadow bg-white py-3 my-3 rounded border border-primary">
          <span className="px-3 font-weight-bold align-middle py-1">
            Choose a date range:{" "}
          </span>
          <DatePickerComponent
            className="mx-3 py-1"
            startDateHandle={datePickerHandle}
            endDateHandle={datePickerHandle2}
          />
          <Button variant="primary mx-3" onClick={getrelateddatafromserver}>
            Apply
          </Button>
        </div>
        <div className="row d-flex justify-content-between">
          <div className="col-md-4 mt-3">
            <ListGroup
              variant="flush"
              className="shadow-sm py-3 bg-white rounded border border-primary p-4"
            >
              <div>
                <h5>Courses:</h5>
              </div>
              {myCourses && myCourses.map((item) => CourslistRenderer(item))}
            </ListGroup>
          </div>

          <div className="col-md-8">
            <div className="shadow-sm border p-3 my-3 bg-white rounded border-primary">
              <h5 className="mb-3">Weekly Stats</h5>
              <Table size="sm" className="pb-4 mb-4 shadow-sm">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Week</th>
                    <th>Bookings avarage</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {bookedLectures &&
                    bookedLectures.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{item.course_id}</td>
                            <td>{item.course_name}</td>
                            <td>{item.week ? item.week : "-"}</td>
                            <td>{item.booking}</td>
                            <td>{item.attendances}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  {!bookedLectures || bookedLectures.length > 0 ? (
                    ""
                  ) : (
                    <tr>
                      <td colspan="4">
                        <div className="w-100 d-flex justify-content-center">
                          <h5>No Record to show</h5>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="shadow-sm border p-3 mb-3 bg-white rounded border-primary">
              <h5 className="mb-3">Monthly Stats</h5>
              <Table size="sm" className="pb-4 mb-4 shadow-sm">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Month</th>
                    <th>Bookings avarage</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthLectures &&
                    monthLectures.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{item.course_id}</td>
                            <td>{item.course_name}</td>
                            <td>{item.month ? item.month : "-"}</td>
                            <td>{item.booking}</td>
                            <td>{item.attendances}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  {!monthLectures || monthLectures.length > 0 ? (
                    ""
                  ) : (
                    <tr>
                      <td colspan="4">
                        <div className="w-100 d-flex justify-content-center">
                          <h5>No Record to show</h5>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="shadow-sm border p-3 mb-3 bg-white rounded border-primary">
              <h5 className="mb-3">Lectures Stats</h5>
              <Table size="sm" className="shadow-sm">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Lecture Date</th>
                    <th>Bookings</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {reserved &&
                    reserved.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{item.course_id}</td>
                            <td>{item.course_name}</td>
                            <td>{item.date}</td>
                            <td>{item.booking}</td>
                            <td>{item.attendances}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  {!reserved || reserved.length > 0 ? (
                    ""
                  ) : (
                      <tr>
                        <td colspan="4">
                          <div className="w-100 d-flex justify-content-center">
                            <h5>No Record to show</h5>
                          </div>
                        </td>
                      </tr>
                    )}
                </tbody>
              </Table>
            </div>
          </div>
          <StaticCharts data={{ bookedLectures, monthLectures }} course_list={myCourses.filter(c => courseFilter.includes(c.id))}></StaticCharts>
        </div>
      </div>
    </>
  );
}
