import React, {useEffect, useState } from "react";
// import { BookingLectureList } from "./BookingLectureList";
import { BookedLectureList } from "./BookedLectureList";
import Container from "react-bootstrap/Container";
import axios from "axios";
import { Col, Form, Row, Tab, ListGroup, Button, Spinner } from "react-bootstrap";
import { CourseDetail } from "./TeacherStatistics";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { Check, X } from "react-bootstrap-icons";


const DataSetupView = (props) => {

	const [files, setFiles] = useState({});
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [resetDisabled, setResetDisabled] = useState(false);
	const [message, setMessage] = useState({text: '', type: ''});
	const [uploadStatus, setUploadStatus] = useState({});

	const resetForm = () => {
		setFiles({});
		setSubmitDisabled(true);
		setMessage({text: '', type: ''});
		setUploadStatus({});
	};

	const handleOnChange = (event) => {
		const fileBrowser = event.target;
		const fileSelected = fileBrowser.files[0];
		const filesList = {...files};
		const newStatus = {...uploadStatus};
	
		filesList[fileBrowser.id] = fileSelected;
		setFiles(filesList);
		newStatus[fileBrowser.id] = "";
		setUploadStatus(newStatus);
		setSubmitDisabled(false);
	};

	const handleOnSubmit = async (event) => {
		event.stopPropagation();
		event.preventDefault();
		const form = event.target;
		let currentStatus = { ...uploadStatus };
		let filesToUpload = { ...files };
		let failed = false;

		// disable submit and reset buttons before start and clear old message
		setSubmitDisabled(true);
		setResetDisabled(true);
		setMessage({text: '', type: ''});

		for(let key in filesToUpload) {
			const formData = new FormData();
			formData.append('file', files[key]);
			
			currentStatus[key] = "uploading";
			setUploadStatus({ ...currentStatus });
			try {
				const res = 
					await axios
						.post(`/upload/${key}`,
							formData
						);
					currentStatus[key] = "completed";
					delete filesToUpload[key];
			} catch (error) {
				setMessage(
					{
						text: error.response.data.message, 
						type: 'failure'
					}
				);
				currentStatus[key] = "failed";
				failed = true;
				break;
			} finally {
				setUploadStatus({ ...currentStatus });
			}
		}

		setFiles(filesToUpload);
		setResetDisabled(false);

		if(!failed) {
			setMessage({
				text: "All files uploaded", 
				type: 'success'
			});
		}
	};
	
	return (
		<Form onChange={handleOnChange} onSubmit={handleOnSubmit}>
			<Form.Row>
				<Form.Group>
					<Form.File id="students" 
						label={ files["students"]?files["students"].name : "Upload students list file"} 
						accept=".csv" 
						custom/>
				</Form.Group>
				<Form.Group>
					{ uploadStatus["students"] === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus["students"] === "completed" && <Check size={48} color="green"/> }
					{ uploadStatus["students"] === "failed" && <X size={48} color="red"/> }
				</Form.Group>
			</Form.Row>	

			<Form.Row>
				<Form.Group>
					<Form.File id="teachers" 
						label={ files["teachers"]?files["teachers"].name : "Upload teachers list file"} 
						accept=".csv" 
						custom/>
				</Form.Group>
				<Form.Group>
					{ uploadStatus["teachers"] === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus["teachers"] === "completed" && <Check size={48}  color="green" /> }
					{ uploadStatus["teachers"] === "failed" && <X size={48} color="red" /> }
				</Form.Group>
			</Form.Row>	

			<Form.Row>
				<Form.Group>
					<Form.File id="courses" 
						label={ files["courses"]?files["courses"].name : "Upload courses list file"} 
						accept=".csv" 
						custom/>
				</Form.Group>
				<Form.Group>
					{ uploadStatus["courses"] === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus["courses"] === "completed" && <Check size={48} color="green" /> }
					{ uploadStatus["courses"] === "failed" && <X size={48} color="red" /> }
				</Form.Group>
			</Form.Row>	

			<Form.Row>
				<Form.Group>
					<Form.File id="enrollments" 
						label={ files["enrollments"]?files["enrollments"].name : "Upload enrollments list file"} 
						accept=".csv" 
						custom/>
				</Form.Group>
				<Form.Group>
					{ uploadStatus["enrollments"] === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus["enrollments"] === "completed" && <Check size={48} color="green" /> }
					{ uploadStatus["enrollments"] === "failed" && <X size={48} color="red" /> }
				</Form.Group>
			</Form.Row>	

			<Button type="submit" disabled={submitDisabled}>Upload files</Button>
			<Button disabled={resetDisabled} onClick={resetForm} className="ml-3">Reset</Button>
			
			{message.text && <p className={message.type === "failure"? "text-danger": "text-success"}> {message.text} </p>}
		</Form>
	);
};

const ScheduleView = (props) => {

	const [scheduleFile, setScheduleFile] = useState(null);
	const [semester, setSemester] = useState('');
	const [availableSemesters, setAvailableSemesters] = useState([]);
	const [uploadStatus, setUploadStatus] = useState('');
	const [message, setMessage] = useState({text: '', type: ''});

	useEffect(() => {
		loadSemesters();
	}, []);

	const loadSemesters = () => {
		axios
		.get("/semesters/")
		.then((semesters) => {
			setAvailableSemesters(semesters.data.filter(s=> s.inserted_lectures != 1));
		})
		.catch((error) => {
			
		});
	};

	const handleOnChange = (event) => {
		const fileBrowser = event.target;
		const fileSelected = fileBrowser.files[0];
	
		setScheduleFile(fileSelected);
		setUploadStatus("");
	};

	const handleSemesterOnChange = (event) => {
		const s = event.target.value;
		setSemester(s);
	};

	const handleOnSubmit = async (event) => {
		event.stopPropagation();
		event.preventDefault();
		const form = event.target;

		const formData = new FormData();
		formData.append('file', scheduleFile);
			
		setUploadStatus("uploading");
		try {
			const res = 
				await axios
					.post(`/upload/schedule/${semester}`,
						formData
					);
				setUploadStatus("completed");
				setMessage({
					text: "Schedule uploaded", 
					type: 'success'
				});
				// refresh the available semesters list
				loadSemesters();
		} catch (error) {
			setUploadStatus("failed");
			setMessage(
				{
					text: error.response.data.message, 
					type: 'failure'
				}
			);
		}
	};

	return (
		<Form  onSubmit={handleOnSubmit}>
			<Form.Row>
				<Form.Group>
					<Form.File id="schedule" 
						label={ scheduleFile? scheduleFile.name : "Upload schedule file"} 
						accept=".csv" 
						custom
						onChange={handleOnChange}/>
				</Form.Group>
				<Form.Group>
					{ uploadStatus === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus === "completed" && <Check size={48} color="green"/> }
					{ uploadStatus === "failed" && <X size={48} color="red"/> }
				</Form.Group>
			</Form.Row>	
			<Form.Row>
				<Form.Group>
					<Form.Control as="select" value={semester} onChange={handleSemesterOnChange}>
						<>
						<option value={''}>Select a semester</option>
						{ 
							availableSemesters.map((semester) =>
								<option value={semester.sid} key={semester.sid}>
									{`${semester.name}: from ${semester.start} to ${semester.end}`}
								</option> 
							)
						}
						</>
					</Form.Control>
				</Form.Group>
			</Form.Row>	

			<Button type="submit" disabled={!scheduleFile || !semester }>Upload schedule</Button>
			
			{message.text && <p className={message.type === "failure"? "text-danger": "text-success"}> {message.text} </p>}
		</Form>
	);
};


export const SupportOfficerPage = (props) => {

	

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
							<DataSetupView />
						</Tab.Pane>
						<Tab.Pane eventKey="#schedule">
							<ScheduleView />
						</Tab.Pane>
					</Tab.Content>
				</Col>
			</Row>
		</Tab.Container>
	);
    
}