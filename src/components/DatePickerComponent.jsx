import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DatePickerComponent = (props) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const startDateHandler = (sdate) => {
    if (props.startDateHandle) props.startDateHandle(sdate);
    setStartDate(sdate);
  };
  const endDateHandler = (edate) => {
    if (props.endDateHandle) props.endDateHandle(edate);
    setEndDate(edate);
  };
  return (
    <div className={props.className}>
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
    </div>
  );
};
