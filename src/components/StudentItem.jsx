import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
class StudentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      checkboxstatus:false
    };
  }

  oncheck = (id, ev) => {
    this.props.oncheckboxchange(id, ev.target.checked);
    this.setState({checkboxstatus:ev.target.checked});
  };
  

  render() {
    return (
      <ListGroup.Item id={this.props.student.id}>
        <div className="d-flex w-100 justify-content-between">
          <div className="container">
            <div className="row">
              <div className="col-lg-2 d-flex justify-content-center">
                <label>{this.props.student.id}</label>
              </div>
              <div className="col-lg-2 d-flex justify-content-center">
                <label>{this.props.student.name}</label>
              </div>
              <div className="col-lg-3 d-flex justify-content-center">
                <label>{this.props.student.surname}</label>
              </div>
              <div className="col-lg-3 d-flex justify-content-center">
                <label>{this.props.student.email}</label>
              </div>
              <div className="col-lg-2 d-flex justify-content-center">
                <input
                  type="checkbox"
                  className="st_chckbx"
                  name={`st_chckbx_${this.props.student.id}`}
                  onChange={(ev) => {
                    this.oncheck(this.props.student.id, ev);
                  }}
                  checked={(this.props.student.status==this.props.present)}
                />
              </div>
            </div>
          </div>
        </div>
      </ListGroup.Item>
    );
  }
}

export default StudentItem;
