import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Spinner, Container } from "react-bootstrap";
import { Check, X } from "react-bootstrap-icons";

export const Schedule = () => {
  const [scheduleFile, setScheduleFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = () => {
    axios
      .get("/semesters/")
      .then((semesters) => {
        setSemester("");
        setAvailableSemesters(
          semesters.data.filter((s) => s.inserted_lectures != 1)
        );
      })
      .catch((error) => {
        setMessage({
          text: error.response
            ? error.response.data.message
            : "Error loading semesters",
          type: "failure",
        });
      });
  };

  const handleOnChange = (event) => {
    const fileBrowser = event.target;
    const fileSelected = fileBrowser.files[0];

    if (fileSelected) {
      setScheduleFile(fileSelected);
      setUploadStatus("");
    }
  };

  const handleSemesterOnChange = (event) => {
    const s = event.target.value;
    setSemester(s);
  };

  const handleOnSubmit = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", scheduleFile);
    setUploadStatus("uploading");
    try {
      await axios.post(`/upload/schedule/${semester}`, formData);
      setUploadStatus("completed");
      setMessage({
        text: "Schedule uploaded",
        type: "success",
      });
      // refresh the available semesters list
      setSemester("");
      setScheduleFile(null);
      loadSemesters();
    } catch (error) {
      setUploadStatus("failed");
      setMessage({
        text: error.response
          ? error.response.data.message
          : "Error uploading schedule",
        type: "failure",
      });
    }
  };
  return (
    <Container className="d-flex flex-column pt-0 align-items-center rounded border border-primary col-10 bg-white">
      <div className="col-sm-8 my-4">
        <h4 className="text-center">
          Define the schedule (Code,Room,Day,Seats,Time)
        </h4>
      </div>
      <Form className="col-10" onSubmit={handleOnSubmit}>
        <Form.Row>
          <Form.Group className="col-sm-6">
            <Form.File custom>
              <Form.File.Input
                id="schedule"
                accept=".csv"
                onChange={handleOnChange}
              />
              <Form.File.Label>
                {scheduleFile ? (
                  <span className="font-weight-bold">{scheduleFile.name}</span>
                ) : (
                  "Upload schedule file"
                )}
              </Form.File.Label>
            </Form.File>
          </Form.Group>

          <Form.Group className="col-sm-5 ml-1">
            <Form.Control
              as="select"
              value={semester}
              onChange={handleSemesterOnChange}
              className={semester !== "" ? "font-weight-bold" : ""}
            >
              <>
                <option value={""}>Select a semester</option>
                {availableSemesters.map((s) => (
                  <option value={s.sid} key={s.sid}>
                    {`${s.name} ( ${s.start} to ${s.end} )`}
                  </option>
                ))}
              </>
            </Form.Control>
          </Form.Group>

          <Form.Group>
            {uploadStatus === "uploading" && <Spinner animation="border" />}
            {uploadStatus === "completed" && <Check size={48} color="green" />}
            {uploadStatus === "failed" && <X size={48} color="red" />}
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Button
            className="mx-auto"
            type="submit"
            disabled={!scheduleFile || !semester}
          >
            Upload schedule
          </Button>
        </Form.Row>

        <Form.Row className="d-flex flex-row justify-content-around mt-3">
          {message.text && (
            <p
              className={
                message.type === "failure" ? "text-danger" : "text-success"
              }
            >
              {message.text}
            </p>
          )}
        </Form.Row>
      </Form>
    </Container>
  );
};
