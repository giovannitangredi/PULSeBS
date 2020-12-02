import React, { useState } from "react";
import { propTypes } from "react-bootstrap/esm/Image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DatePickerComponent = (props) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const startDateHandler = (sdate, edate) => {
    if (props.startDateHandle) props.startDateHandle(sdate, edate);
    setStartDate(sdate);
  };
  const endDateHandler = (sdate, edate) => {
    if (props.endDateHandle) props.endDateHandle(sdate, edate);
    setEndDate(edate);
  };
  return (
    <>
      <DatePicker
        selected={startDate}
        onChange={(date) => startDateHandler(date, endDate)}
        selectsStart
        maxDate={new Date()}
        startDate={startDate}
        endDate={endDate}
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => endDateHandler(startDate, date)}
        selectsEnd
        maxDate={new Date()}
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
      />
    </>
  );
};
