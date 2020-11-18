import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

const studentItem = (props) => {
  let { student } = props;

  return (
    <ListGroup.Item id={student.id}>
      <div className="d-flex w-100 justify-content-between">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <label>{student.name}</label>
            </div>
            <div className="col-lg-4">
              <label>{student.surname}</label>
            </div>
            <div className="col-lg-4">
              <label>{student.email}</label>
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};
export default studentItem;
