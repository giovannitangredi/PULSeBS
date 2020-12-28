import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Col,
  Form,
  Row,
  ListGroup,
  Button,
  Pagination,
  Container,
  Alert,
  Image,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import moment from "moment";
import jsPDF from 'jspdf'
import P5 from 'p5'; 

const p5 = new P5(); 
const FullReportView = (props) => {
  const page_size = 10;
  const totPages = Math.ceil(props.report.length / page_size);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPage, setReportPage] = useState([]);

  const paginate = (array, page_number) => {  //function to return subset (page for pagination) of the entire array of report
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  const handlePrev = () => {
    let current = currentPage - 1;
    if ((current) > 0) {
      setCurrentPage(current);
      setReportPage(paginate(props.report, current));
    }
  }

  const handleNext = () => {
    let current = currentPage + 1;
    if ((current) <= totPages) {
      setCurrentPage(current);
      setReportPage(paginate(props.report, current));
    }
  }

  useEffect(() => {
    setReportPage(paginate(props.report, 1));
  }, []);

  return (
    <Container>
      {props.report.length === 0 && (
        <Alert className="mt-5 d-flex justify-content-center" variant="primary">
          {"No one was co-present for the past 14 days"}
        </Alert>
      )}
      {props.report.length != 0 && (<>
        <ListGroup>
          <ListGroup.Item style={{ backgroundColor: "transparent" }} className="d-flex justify-content-between border-0 ">
            <div className="col-lg-2 d-flex justify-content-center">
              <b>Id</b>
            </div>
            <div className="col-lg-3 d-flex justify-content-center">
              <b>Full name</b>
            </div>
            <div className="col-lg-3 d-flex justify-content-center">
              <b>Email</b>
            </div>
            <div className="col-lg-3 d-flex justify-content-center">
              <b>SSN</b>
            </div>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">This is the number of time they have had the same lecture.</Tooltip>}>
              <div className="col-lg-1 d-flex align-items-center justify-content-center">
                <b className=" d-flex align-items-center justify-content-center">{"Interactions "}
                  <InfoCircle className="mx-1" />
                </b>
              </div>
            </OverlayTrigger>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup className="border rounded border-primary ">
          {reportPage.map((student) => (
            <ListGroup.Item className="py-2 d-flex  justify-content-between" key={student.id}>
              <div className="col-lg-2 d-flex  align-items-center justify-content-center">
                {student.id}
              </div>
              <div className="col-lg-3 text-center align-items-center ">
                {student.name + " " + student.surname}
              </div>
              <div className="col-lg-3 d-flex align-items-center  justify-content-center">
                {student.email}
              </div>
              <div className="col-lg-3 d-flex align-items-center  justify-content-center">
                {student.ssn}
              </div>
              {<div className="col-lg-1  d-flex align-items-center  justify-content-center">
                {student.risk}
              </div>}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Pagination className="mb-0" >
          <Pagination.Prev onClick={() => handlePrev()} />
          <Pagination.Item disabled >{currentPage + " of " + totPages}</Pagination.Item>
          <Pagination.Next onClick={() => handleNext()} />
        </Pagination>
      </>)}
    </Container>
  );
};

export const ContactTracingPage = (props) => {
  const [ssn, setSsn] = useState("");
  const [student, setStudent] = useState({});
  const [generated, setGenerated] = useState(false);
  const [report, setReport] = useState([]);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeSsn = (event) => {
    setSsn(event.target.value);
  }

  const handleSearch = (event) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("event.response", event.response)
    axios.get(`/tracing/${ssn}/search`)
      .then((res) => {
        setStudent(...res.data);
        setError(false);
        setReport([]);
        setGenerated(false);
      })
      .catch((err) => {
        setMessage("Wrong SSN");
        setError(true);
        handleReset();
      });
  }

  const handleGenerate = () => {
    axios.get(`/tracing/${student.id}/report`)
      .then((res) => {
        setReport(res.data);
        setGenerated(true);
      })
      .catch((err) => {
        setMessage("There was an error during the tracing");
        handleReset();
        setError(true);
      })
  }

  const handleReset = () => {
    setGenerated(false);
    setStudent();
    setReport([]);
    setSsn("");
  }
  
  const generatePDFFile=()=>{
    const gap = 10;
    let y = 60;
    
    var doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Contact tracing report for ${student.id} ${student.surname} ${student.name}`,20,15);
    doc.setFontSize(16);
    doc.text(`List of the concats in the previous 14 days with the following schema:`,5, 40);
    doc.text('ID Name Surname Email SSN Birthday City',5,50);
    doc.setFontSize(10);
    report.forEach(row =>{
      doc.text(`${row.id} ${row.name} ${row.surname} ${row.email} ${row.ssn} ${row.birthday} ${row.city}`,5,y);
      y += gap;
    });
    doc.save(`${student.id}_Contact_Tracing_Report_${moment().format('YYYY-MM-DD')}`);
  }
  const generateCSVFile=()=>{
    let csv =["ID, Name, Surname, Email, SSN, Birthday, City"];
    report.forEach(row =>{
      csv.push(`${row.id}, ${row.name}, ${row.surname}, ${row.email}, ${row.ssn}, ${row.birthday}, ${row.city}`);
    });
    p5.saveStrings(csv,`${student.id}_Contact_Tracing_Report_${moment().format('YYYY-MM-DD')}`, "csv");
  }
  const handleDownload = (event) => {
    event.stopPropagation();
    event.preventDefault();
    generateCSVFile();
    generatePDFFile();
  }

  return (
    <Container className="col-lg-11">
      <h3 className="pt-3">Contact Tracing Report System</h3>
      <Row className="d-flex pt-4 align-items-center flex-wrap">
        <Form className="col-lg-4 align-content-center" onSubmit={handleSearch}>
          <Form.Row>
            <Col className="col-lg-8">
              <Form.Control placeholder="SSN"
                value={ssn}
                onChange={(ev) => onChangeSsn(ev)}
              />
            </Col>
            <Col className="col-lg-3">
              <Button type="submit">
                Search
              </Button>
            </Col>
          </Form.Row>
        </Form>
        {generated && report.length !== 0 && (
          <>
            <Col className="col-lg-6 d-flex align-items-center justify-content-end">
              <Alert className="py-2 my-2" variant="warning">
                {report.length + " People to call"}  </Alert>
            </Col>
            <Col className="col-lg-2 d-flex justify-content-end">
              <Button className="mx-auto" onClick={(event) => handleDownload(event)}>
                Download Report
                    </Button>
            </Col>

          </>
        )}
      </Row>
      <Row>
        <Col className="col-lg-4 my-6  pt-5">
          {error && (
            <Alert className="d-flex justify-content-center mr-5" variant="warning">
              {message}
            </Alert>
          )}
          {student && student.id && (
            <Container className="border rounded border-primary justify-content-center my-6 bg-white py-3">
              <Row>
                <Col className="col-lg-4 justify-content-start"><h6><b>Full Name</b></h6></Col>
                <Col className="justify-content-start"><h6 >{" " + student.name + " " + student.surname}</h6></Col>
              </Row>
              <Row>
                <Col className="col-lg-4 justify-content-start"><h6> <b>Number Id</b></h6></Col>
                <Col className="justify-content-start"><h6>{" " + student.id}</h6></Col>
              </Row>
              <Row>
                <Col className="col-lg-4 justify-content-start"><h6><b>Email</b></h6></Col>
                <Col className="justify-content-start"><h6>{" " + student.email}</h6></Col>
              </Row>
              <Row>
                <Col className="col-lg-4 justify-content-start"><h6><b>Born</b></h6></Col>
                <Col className="justify-content-start"><h6>{moment(student.birthday).format("D MMMM YYYY") + ", " + student.city}</h6></Col>
              </Row>
              <Row>
                <Col className="col-lg-4 justify-content-start"><h6><b>SSN</b></h6></Col>
                <Col className="justify-content-start"><h6>{" " + student.ssn}</h6></Col>
              </Row>
              <Row className="d-flex mt-2 align-items-center flex-wrap">
                <Col className="col-lg-6 d-flex align-items-center justify-content-end">
                  <Button className="" onClick={() => handleGenerate()}>
                    Tracing
                        </Button>
                </Col>
                <Col className="col-lg-6 align-items-center  justify-content-start">
                  <Button className="" onClick={() => handleReset()}>
                    Reset
                        </Button>
                </Col>
              </Row>
            </Container>)}
        </Col >
        {generated && (
          <>
            <Col className="col-lg-8 ">
              <FullReportView report={report} />
            </Col>
          </>
        )}
        {!generated && (
          <>
            <Col className="col-lg-5 d-flex justify-content-center ">
              <Image className="mx-auto" src="/imgs/contact_tracing.png" rounded />
            </Col>
            <Col className="col-lg-3 my-auto">
              <p className="font-italic" style={{ fontSize: "22px", lineHeight: "180%" }}>
                Contact tracing is a system that selects students and professors
                who may have come into contact with the positive person in the past 14 days.
                The calculation is made considering the co-presence in the lecture.
        </p>
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};