import React, { useState } from "react";
import { propTypes } from "react-bootstrap/esm/Image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DatePickerComponent = (props) => {
  const [startDate, setStartDate] = useState(new Date("2014/02/08"));
  const [endDate, setEndDate] = useState(new Date("2014/02/10"));
  const startDateHandler = (date) => {
    if (props.startDateHandle) props.startDateHandle(date);
    setStartDate(date);
  };
  const endDateHandler = (date) => {
    if (props.endDateHandle) props.endDateHandle(date);
    setEndDate(date);
  };
  return (
    <>
      <DatePicker
        selected={startDate}
        onChange={(date) => startDateHandler(date)}
        selectsStart
        maxDate={new Date()}
        startDate={startDate}
        endDate={endDate}
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => endDateHandler(date)}
        selectsEnd
        maxDate={new Date()}
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
      />
    </>
  );
};
