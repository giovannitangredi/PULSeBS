import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import ConfirmDialog from "./ConfirmDialog";
import moment from "moment";
import Button from "react-bootstrap/Button";

// ({lecture: {title, start, end, extendedProps: {status, id, room}}, handleConvert})
const LectureItem = ({ lecture, handleConvert, handleBooking }) => {
  return (
    <ListGroup.Item>
      <div className="d-flex w-100 justify-content-around">
        <div className="container">
          <div className="row">
            <div className="col-sm-2 d-flex justify-content-center">
              <label className="justify-content-center">
                {"Room " + lecture.extendedProps.room}
              </label>
            </div>
            <div className="col-sm-3 d-flex justify-content-center">
              <label className="justify-content-center">
                {lecture.extendedProps.date}
              </label>
            </div>
            <div className="col-sm-3 d-flex justify-content-center">
              <label className="justify-content-center">
                {lecture.extendedProps.time}
              </label>
            </div>
            <div className="col-sm-2 d-flex justify-content-center">
              <label
                className="justify-content-center"
                style={{ textTransform: "capitalize" }}
              >
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
              <div className="col-lg-2 d-flex justify-content-center">
                <Button
                  className="align-self-center"
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
