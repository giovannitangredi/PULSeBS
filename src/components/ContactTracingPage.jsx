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

const Fakestudent = {
  id: "900000", name: "Ambra", surname: "Ferri", email: "s900000@students.polito.it",
  city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060783",
}

const FakeReport = [
  { id: "900001", name: "Pierfrancesco", surname: "Ermenegardassa", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "900002", name: "Mariaddolorata", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "900003", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "000004", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "000005", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "000006", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "7", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "8", name: "Giovanniasdfghj", surname: "Ferriasdf", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "9", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "10", name: "10", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "11", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "12", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "13", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "14", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "15", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "16", name: "Giacomo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "17", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "18", name: "Luca", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "19", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "20", name: "20", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "21", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "22", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "23", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "24", name: "Giovanni", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "25", name: "Matteo", surname: "Ferri", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97560783", },
  { id: "26", name: "Matteooooooooo", surname: "Ferriddddddddddd", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", },
  { id: "27", name: "Matteooooooooo", surname: "Ferriddddddddddd", email: "s900000@students.polito.it", city: "Poggio Ferro", birthday: "1991-11-04", ssn: "MK97060683", }]

const FullReportView = (props) => {
  const page_size = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [totPages, setTotPages] = useState(Math.ceil(props.report.length / page_size)); //con i dispari si incastra OCCHIO
  const [reportPage, setReportPage] = useState([]);



  const paginate = (array, page_number) => { 
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  const handlePrev = () => {
    let current = currentPage - 1;
    if ((current) > 0) {
      setCurrentPage(current);
      setReportPage(paginate(props.report,current));
    }

  }

  const handleNext = () => {
    let current = currentPage + 1;
    if ((current) <= totPages) {
      setCurrentPage(current);
      setReportPage(paginate(props.report,current));
    }
  }

  useEffect(() => {
    setReportPage(paginate(props.report,1));
  }, []);

  return (
    <Container>
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
                  <InfoCircle className="mx-1"/>
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
                {"15"}
              </div>}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Pagination className="mb-0" >
        <Pagination.Prev onClick={() => handlePrev()} />
        <Pagination.Item disabled >{currentPage + " of "+ totPages}</Pagination.Item>
        <Pagination.Next onClick={() => handleNext()} />
      </Pagination>
    </Container>
  );
};

export const ContactTracingPage = (props) => {
  const [ssn, setSsn] = useState("");
  const [student, setStudent] = useState({});
  const [generated, setGenerated] = useState(false);
  const [report, setReport] = useState([]);
  const [show, setShow] = useState(false);

  const onChangeSsn = (event) => {
    setSsn(event.target.value);
  }
  const handleSearch = (event) => {
    event.stopPropagation();
    event.preventDefault();
    /*axios.get(`/something/something2`, { ssn: ssn })
    .then((res) => {
        setStudent(...res.data);
        setReport();
        setGenerated(false);
    })*/
    setStudent(Fakestudent);
    setReport(FakeReport);
  }
  const handleGenerate = () => {
    setGenerated(true);
    setShow(true);
  }
  const handleReset = () => {
    setGenerated(false);
    setShow(false);
    setStudent();
    setReport();
    setSsn("");
  }

  const handleDownload = (event) => {
    event.stopPropagation();
    event.preventDefault();
    //generateFile();
    setShow(false);
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
        {generated && (
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
        <p className="font-italic" style={{fontSize: "22px", lineHeight: "180%"}}>
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