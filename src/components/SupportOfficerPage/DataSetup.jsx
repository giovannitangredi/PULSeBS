import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Col,
  Form,
  Row,
  Tab,
  ListGroup,
  Button,
  Table,
  Spinner,
  Container,
} from "react-bootstrap";
import { Check, X } from "react-bootstrap-icons";
import Papa from "papaparse";

const CSViewer = ({ header, data, length, ...props }) => {
  console.log(header, data, length)


  return (
    <Table {...props}>
      <thead>
        <tr>
          {
            header.map((item) =>
              <th key={item}>{item}</th>
            )
          }
        </tr>
      </thead>
      <tbody>
        {
          data.map((row) =>
            <tr key={row}>
              {
                row.map((col) =>
                  <td key={col}>{col}</td>
                )
              }
            </tr>
          )
        }
      </tbody>
      <thead><tr><th colSpan = {header.length}>{`3 of ${length} rows` }</th></tr></thead>
    </Table>
  );
};

export const DataSetup = () => {
  const [files, setFiles] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [resetDisabled, setResetDisabled] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploadStatus, setUploadStatus] = useState({});
  const [previews, setPreviews] = useState({});


  const sendingOrder = ["students", "teachers", "courses", "enrollments"];

  const resetForm = () => {
    setFiles({});
    setSubmitDisabled(true);
    setMessage({ text: "", type: "" });
    setUploadStatus({});
  };

  const handleOnChange = (event) => {
    const fileBrowser = event.target;
    const fileSelected = fileBrowser.files[0];
    if (fileSelected) {
      const filesList = { ...files };
      const newStatus = { ...uploadStatus };
      filesList[fileBrowser.id] = fileSelected;
      setFiles(filesList);
      newStatus[fileBrowser.id] = "";
      setUploadStatus(newStatus);
      setSubmitDisabled(false);
      // fix the problem with chrome that doesn't trigger onChange event when the same file is selected
      fileBrowser.value = "";
      readCSV(fileSelected, fileBrowser.id, 4);
    }
  };

  const handleOnSubmit = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    let currentStatus = { ...uploadStatus };
    let filesToUpload = { ...files };
    let failed = false;

    // disable submit and reset buttons before start and clear old message
    setSubmitDisabled(true);
    setResetDisabled(true);
    setMessage({ text: "", type: "" });

    for (let key of sendingOrder) {
      if (!files[key]) {
        continue;
      }

      const formData = new FormData();
      formData.append("file", files[key]);

      currentStatus[key] = "uploading";
      setUploadStatus({ ...currentStatus });
      try {
        await axios.post(`/upload/${key}`, formData);
        currentStatus[key] = "completed";
        delete filesToUpload[key];
      } catch (error) {
        setMessage({
          text: error.response
            ? error.response.data.message
            : `Error uploading ${key}`,
          type: "failure",
        });
        currentStatus[key] = "failed";
        failed = true;
        break;
      } finally {
        setUploadStatus({ ...currentStatus });
      }
    }

    setFiles(filesToUpload);
    setResetDisabled(false);

    if (!failed) {
      setMessage({
        text: "All files uploaded",
        type: "success",
      });
    }
  };

  const readCSV = async (file, type, limit) => {
    console.log(file, type);
    let newPreviews = {};
    Papa.parse(file, {
      complete: function (results) {
        newPreviews[type] = { header: results.data[0], data: results.data.slice(1, limit), length: results.data.length - 1 };
        setPreviews(newPreviews);
      }
    })
  };

  return (
    <Container className="d-flex flex-column pt-0 align-items-center rounded border border-primary col-10 bg-white">
      <div className="col-sm-8 my-4">
        <h4 className="text-center">Upload the files to setup the system</h4>
      </div>
      <Form
        className="col-12"
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
      >
        {sendingOrder.map((item) => (
          <div key={item}>
            <Form.Row
              key={item}
              className="d-flex flex-row justify-content-center"
            >
              <Form.Group as= {Row} className="col-sm-10">
                <Form.Label column sm = "2">{item}:</Form.Label>
                <Col>
                <Form.File custom >
                  <Form.File.Input
                    id={item}
                    accept=".csv"
                    onChange={handleOnChange}
                  />
                  <Form.File.Label>
                    {files[item] ? (
                      <span className="font-weight-bold">{files[item].name}</span>
                    ) : (
                        `Upload file for ${item}`
                      )}
                  </Form.File.Label>
                </Form.File>
                </Col>
              </Form.Group>
              <Form.Group>
                {uploadStatus[item] === "uploading" && (
                  <Spinner animation="border" />
                )}
                {uploadStatus[item] === "completed" && (
                  <Check size={48} color="green" />
                )}
                {uploadStatus[item] === "failed" && <X size={48} color="red" />}
              </Form.Group>
            </Form.Row>
            {
              files[item] && previews[item] &&
              <Form.Row
                key={`${item}-preview`}
                className="d-flex flex-row justify-content-center"
              >
                <CSViewer {...previews[item]} size="sm" bordered className="col-sm-10 text-center" />
              </Form.Row>
            }
          </div>
        ))}
        <Form.Row className="d-flex flex-row justify-content-center">
          <Button type="submit" disabled={submitDisabled}>
            Upload files
          </Button>
          <Button disabled={resetDisabled} onClick={resetForm} className="ml-3">
            Reset
          </Button>
        </Form.Row>
        <Form.Row className="d-flex flex-row justify-content-center mt-3">
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
