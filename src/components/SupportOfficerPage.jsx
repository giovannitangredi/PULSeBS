import React, { ChangeEvent, useEffect, useState } from "react";
// import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Col, Form, Row, Tab, ListGroup, Button } from "react-bootstrap";
import { CourseDetail } from "./TeacherStatistics";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

export const SupportOfficerPage = (props) => {

	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState({});
	const [submitDisabled, setSubmitDisabled] = useState(true);

	const handleOnChange = (event) => {
		const fileBrowser = event.target;
		const fileSelected = fileBrowser.files[0];
		const filesList = {...files};
	
		fileBrowser.labels[0].innerHTML = fileSelected.name;

		filesList[fileBrowser.id] = fileSelected;
		setFiles(filesList);
		setSubmitDisabled(false);
	};

	const handleOnSubmit = async (event) => {
		event.stopPropagation();
		event.preventDefault();
		const form = event.target;

		for(let file in files) {
			const formData = new FormData();
			formData.append('file', files[file]);
			console.log(files[file])
			try {
				const res = 
					await axios
						.post(`/upload/${file}`,
							formData,
						);
					console.log(res);
			} catch (error) {
				console.log(error);
			}
		}
		console.log(files);
	};

  return (
		<Tab.Container defaultActiveKey="#system-setup">
			<Row className="px-3">
				<Col sm={3}>
					<ListGroup>
						<ListGroup.Item action href="#system-setup">
							System setup
						</ListGroup.Item>
						<ListGroup.Item action href="#schedule">
							Schedule
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col sm={9}>
					<Tab.Content>
						<Tab.Pane eventKey="#system-setup">
							<Form onChange={handleOnChange} onSubmit={handleOnSubmit}>
								<Form.Group>
									<Form.File id="students" label="Upload students list file" accept=".csv" custom/>
								</Form.Group>	

								<Form.Group>
									<Form.File id="teachers" label="Upload teachers list file" accept=".csv" custom/>
								</Form.Group>

								<Form.Group>
									<Form.File id="courses" label="Upload courses list file" accept=".csv" custom/>
								</Form.Group>

								<Form.Group>
									<Form.File id="enrollments" label="Upload enrollments list file" accept=".csv" custom/>
								</Form.Group>

								<Button type="submit" disabled={submitDisabled}>Upload files</Button>

							</Form>
						</Tab.Pane>
						<Tab.Pane eventKey="#schedule">
							ggggggggggggggggggggggg
						</Tab.Pane>
					</Tab.Content>
				</Col>
			</Row>
		</Tab.Container>
	);
    
}