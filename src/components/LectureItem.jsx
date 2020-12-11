import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import ConfirmDialog from "./ConfirmDialog";
import moment from "moment";
import Button from "react-bootstrap/Button";

// ({lecture: {title, start, end, extendedProps: {status, id}}, handleConvert})
const LectureItem = ({ lecture, handleConvert, handleBooking }) => {
  return (
    <ListGroup.Item>
      <div className="d-flex w-100 justify-content-between">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <label>{lecture.title}</label>
            </div>
            <div className="col-lg-2">
              <label>{lecture.start.toDateString()}</label>
            </div>
            <div className="col-lg-3">
              <label>{lecture.end.toDateString()}</label>
            </div>
            <div className="col-lg-2">
              <label style={{ textTransform: "capitalize" }}>
                {lecture.extendedProps.status === "distance"
                  ? "Remote"
                  : lecture.extendedProps.status}{" "}
                {moment()
                  .add(30, "minutes")
                  .isBefore(moment(lecture.start, "YYYY-MM-DD HH:mm:ss")) &&
                  lecture.extendedProps.status === "presence" && (
                    <ConfirmDialog
                      body="Are you sure you want to hold this lecture remotely?"
                      action={() => {
                        handleConvert(lecture.extendedProps.id);
                      }}
                      buttonText="Change"
                    />
                  )}
              </label>
            </div>
            {moment(lecture.start).isAfter(moment().add(1, "hour")) && (
              <div className="col-lg-2">
                <Button
                  variant="primary"
                  onClick={(event) => handleBooking(lecture)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};
export default LectureItem;
