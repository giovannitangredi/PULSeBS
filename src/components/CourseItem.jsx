import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const courseItem = (props) => {
  let { course, loadCourseData } = props;

  return (
    <div className="mx-3 my-3 ">
      <Card
        bg={"Light"}
        text={"dark"}
        border={"secondary"}
        style={{ width: "20rem" }}
      >
        <Card.Header> Course ID: {course.id} </Card.Header>
        <Card.Body>
          <Card.Title>{course.name}</Card.Title>
          <Card.Text>Course Description.</Card.Text>
          <Button
            variant="primary"
            onClick={() => {
              loadCourseData(course);
            }}
          >
            Select the Course
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};
export default courseItem;
