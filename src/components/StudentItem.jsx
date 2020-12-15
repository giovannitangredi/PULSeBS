import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

const studentItem = (props) => {
  let { student } = props;

  return (
    <ListGroup.Item id={student.id}>
      <div className="d-flex w-100 justify-content-between">
        <div className="container">
          <div className="row">
            <div className="col-lg-2 d-flex justify-content-center">
              <label>{student.id}</label>
            </div>
            <div className="col-lg-3 d-flex justify-content-center">
              <label>{student.name}</label>
            </div>
            <div className="col-lg-3 d-flex justify-content-center">
              <label>{student.surname}</label>
            </div>
            <div className="col-lg-4 d-flex justify-content-center">
              <label>{student.email}</label>
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};
export default studentItem;
