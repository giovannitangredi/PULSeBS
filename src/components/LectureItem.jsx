import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import ConfirmDialog from "./ConfirmDialog";
// ({lecture: {title, start, end, extendedProps: {status, id}}, handleConvert})
const LectureItem = ({
  lecture: {
    title,
    start,
    end,
    extendedProps: { status, id },
  },
  handleConvert,
}) => {
  return (
    <ListGroup.Item>
      <div className="d-flex w-100 justify-content-between">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <label>{title}</label>
            </div>
            <div className="col-lg-3">
              <label>{start.toDateString()}</label>
            </div>
            <div className="col-lg-3">
              <label>{end.toDateString()}</label>
            </div>
            <div className="col-lg-3">
              <label style={{ textTransform: "capitalize" }}>
                {status === "distance" ? "Remote" : status}{" "}
                {status != "distance" && (
                  <ConfirmDialog
                    body="Are you sure you want to hold this lecture remotely?"
                    action={() => {
                      handleConvert(id);
                    }}
                    buttonText="Change"
                  />
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};
export default LectureItem;
