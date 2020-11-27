import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

const lectureItem = (props) => {
  let { lecture } = props;

  return (
    <ListGroup.Item id={lecture.id}>
      <div className="d-flex w-100 justify-content-between">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <label>{lecture.title}</label>
            </div>
            <div className="col-lg-3">
              <label>{lecture.start.toDateString()}</label>
            </div>
            <div className="col-lg-3">
              <label>{lecture.end.toDateString()}</label>
            </div>
            <div className="col-lg-3">
              <label style={{textTransform: "capitalize"}}>{lecture.extendedProps.status}</label>
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};
export default lectureItem;
