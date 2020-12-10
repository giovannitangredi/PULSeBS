import React, {useEffect, useState } from "react";
import axios from "axios";
import { Col, Form, Row, Tab, ListGroup, Button, Spinner } from "react-bootstrap";
import { Check, X } from "react-bootstrap-icons";


const DataSetupView = (props) => {

	const [files, setFiles] = useState({});
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [resetDisabled, setResetDisabled] = useState(false);
	const [message, setMessage] = useState({text: '', type: ''});
	const [uploadStatus, setUploadStatus] = useState({});

	const sendingOrder = ["students", "teachers", "courses", "enrollments"];

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
		
		let currentStatus = { ...uploadStatus };
		let filesToUpload = { ...files };
		let failed = false;

		// disable submit and reset buttons before start and clear old message
		setSubmitDisabled(true);
		setResetDisabled(true);
		setMessage({text: '', type: ''});

		for(let key of sendingOrder) {
			if(!files[key]) {
				continue;
			}

			const formData = new FormData();
			formData.append('file', files[key]);
			
			currentStatus[key] = "uploading";
			setUploadStatus({ ...currentStatus });
			try {
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
			{
				sendingOrder.map((item) => 
					<Form.Row className="d-flex flex-row d-flex justify-content-center">
						<Form.Group className="col-sm-8">
							<Form.File id={item} 
								label={ files[item]? files[item].name : `Upload file for ${item}` } 
								accept=".csv" 
								custom/>
						</Form.Group>
						<Form.Group>
							{ uploadStatus[item] === "uploading" && <Spinner animation="border" /> }
							{ uploadStatus[item] === "completed" && <Check size={48} color="green"/> }
							{ uploadStatus[item] === "failed" && <X size={48} color="red"/> }
						</Form.Group>
					</Form.Row>	
				)
			}
			<Form.Row className="d-flex flex-row d-flex justify-content-center">
				<Button type="submit" disabled={submitDisabled}>Upload files</Button>
				<Button disabled={resetDisabled} onClick={resetForm} className="ml-3">Reset</Button>
			</Form.Row>	
			<Form.Row className="d-flex flex-row d-flex justify-content-center mt-3">
				{message.text && <p className={message.type === "failure"? "text-danger": "text-success"}> {message.text} </p>}
			</Form.Row>
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
			setSemester('');
			setAvailableSemesters(semesters.data.filter(s=> s.inserted_lectures != 1));
		})
		.catch((error) => {
			setMessage(
				{
					text: error.response.data.message, 
					type: 'failure'
				}
			);
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

		const formData = new FormData();
		formData.append('file', scheduleFile);
			
		setUploadStatus("uploading");
		try {
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
			<Form.Row className="d-flex flex-row d-flex justify-content-center">
				<Form.Group className="col-sm-4">
					<Form.File id="schedule" 
						label={ scheduleFile? scheduleFile.name : "Upload schedule file"} 
						accept=".csv" 
						custom
						onChange={handleOnChange}/>
				</Form.Group>

				<Form.Group className="col-sm-5 ml-3">
					<Form.Control as="select" value={semester} onChange={handleSemesterOnChange}>
						<>
						<option value={''}>Select a semester</option>
						{ 
							availableSemesters.map((s) =>
								<option value={s.sid} key={s.sid}>
									{`${s.name}: from ${s.start} to ${s.end}`}
								</option> 
							)
						}
						</>
					</Form.Control>
				</Form.Group>
				
				<Form.Group>
					{ uploadStatus === "uploading" && <Spinner animation="border" /> }
					{ uploadStatus === "completed" && <Check size={48} color="green"/> }
					{ uploadStatus === "failed" && <X size={48} color="red"/> }
				</Form.Group>
			</Form.Row>
			
			<Form.Row>
					<Button className="mx-auto" type="submit" disabled={!scheduleFile || !semester }>Upload schedule</Button>
			</Form.Row>
			
			<Form.Row className="d-flex flex-row d-flex justify-content-around mt-3">
				{message.text && <p className={message.type === "failure"? "text-danger": "text-success"}> {message.text} </p>}
			</Form.Row>
		</Form>
	);
};


export const SupportOfficerPage = (props) => {
  	return (
		<Tab.Container defaultActiveKey="#system-setup">
			<Row className="px-3 m-0">
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