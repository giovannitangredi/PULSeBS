import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Tab, Tabs } from "react-bootstrap";
import moment, { Moment } from "moment";

enum BatchItemType {
  Year,
  Semester,
  Professor,
  Course,
  Lecture,
}

interface BatchItem {
  id: string;
  name?: string;
  surname?: string;
  course?: string;
  start?: Moment;
  end?: Moment;
  year?: number;
  type: BatchItemType;
}

export const UpdateBookable = () => {
  const [batchGranularity, setBatchGranularity] = useState<string>();

  const [updateTo, setUpdateTo] = useState<string>("not bookable");
  const [batchSubmitEnabled, setBatchSubmitEnabled] = useState<boolean>(true);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [selectedBatchItems, setSelectedBatchItems] = useState<string[]>([]);
  const [updateAlert, setUpdateAlert] = useState<"danger" | "success" | false>(
    false
  );
  const granularity = [
    "all",
    "by year",
    "by semester",
    "by professor",
    "by course",
    "by lecture",
  ];

  const capitalizeText = (text: string): string => {
    return text.replace(/\b\w/g, (o) => o.toUpperCase());
  };

  const getNumberWithOrdinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  useEffect(() => {
    switch (batchGranularity) {
      case "by semester":
        axios
          .get("/semesters/future")
          .then((semesters) => {
            setBatchItems(
              semesters.data.map(
                (s: {
                  id: number;
                  name: string;
                  start: string;
                  end: string;
                }) => {
                  return {
                    id: s.id,
                    name: s.name,
                    start: moment(s.start, "YYYY-MM-DD").format("DD-MM-YYYY"),
                    end: moment(s.end, "YYYY-MM-DD").format("DD-MM-YYYY"),
                    type: BatchItemType.Semester,
                  };
                }
              )
            );
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      case "by professor":
        axios
          .get("/lectures/future/teachers")
          .then((profs) => {
            setBatchItems(
              profs.data.map(
                (s: { id: number; name: string; surname: string }) => {
                  return { ...s, type: BatchItemType.Professor };
                }
              )
            );
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      case "by course":
        axios
          .get("/lectures/future/courses")
          .then((profs) => {
            setBatchItems(
              profs.data.map(
                (s: {
                  id: string;
                  name: string;
                  prof: string;
                  year: number;
                  semester: string;
                }) => {
                  return {
                    id: s.id,
                    course: s.name,
                    surname: s.prof,
                    year: s.year,
                    semster: s.semester,
                    type: BatchItemType.Course,
                  };
                }
              )
            );
          })
          .catch((error) => {
            console.log(error);
          });

        break;
      case "by lecture":
        axios
          .get("/lectures/future")
          .then((lectures) => {
            setBatchItems(
              lectures.data.map(
                (s: {
                  id: string;
                  prof: string;
                  course: string;
                  start: string;
                  end: string;
                  year: number;
                }) => {
                  return {
                    id: s.id,
                    surname: s.prof,
                    start: s.start,
                    year: s.year,
                    course: s.course,
                    type: BatchItemType.Lecture,
                  };
                }
              )
            );
          })
          .catch((error) => {
            console.log(error);
          });

        break;
      case "by year":
        const years: BatchItem[] = [1, 2, 3, 4, 5].map((year: number) => {
          return { id: year.toString(), year: year, type: BatchItemType.Year };
        });
        setBatchItems(years);
        break;
      case "all":
        setBatchItems([]);
        setBatchSubmitEnabled(true);
        break;
    }
    setSelectedBatchItems([]);
  }, [batchGranularity]);

  useEffect(() => {
    setBatchSubmitEnabled(
      selectedBatchItems.length > 0 || batchGranularity === "all"
    );
  }, [selectedBatchItems]);

  const handleChangeSelectBatchItems = (event: any) => {
    var options = event.target.options;
    var selected = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedBatchItems(selected);
  };

  const BatchItemToHtml = (item: BatchItem) => {
    switch (item.type) {
      case BatchItemType.Year:
        return (
          item.year && (
            <option key={item.year} value={item.year}>{`${getNumberWithOrdinal(
              item.year
            )} year`}</option>
          )
        );
      case BatchItemType.Semester:
        return (
          <option
            key={item.id}
            value={item.id}
          >{`${item.name} ( ${item.start} to ${item.end} )`}</option>
        );
      case BatchItemType.Professor:
        return (
          <option
            key={item.id}
            value={item.id}
          >{`${item.name} ${item.surname} (${item.id})`}</option>
        );
      case BatchItemType.Course:
        return (
          item.year && (
            <option key={item.id} value={item.id}>{`[${item.id}]: ${
              item.course
            }, (${getNumberWithOrdinal(item.year)} year, prof.: ${
              item.surname
            }) `}</option>
          )
        );
      case BatchItemType.Lecture:
        return (
          item.year && (
            <option key={item.id} value={item.id}>{`[${item.id}]: ${moment(
              item.start,
              "YYYY-MM-DD HH:mm:ss"
            ).format("DD-MM-YY HH::mm")} ${
              item.course
            }, (${getNumberWithOrdinal(item.year)} year, prof.: ${
              item.surname
            }) `}</option>
          )
        );
    }
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    axios
      .post("/lectures/bookable", {
        bookable: updateTo === "bookable",
        granularity: batchGranularity,
        batchItems: selectedBatchItems,
      })
      .then(
        () => {
          setUpdateAlert("success");
        },
        (error) => {
          setUpdateAlert("danger");
          console.log(error);
        }
      );
  };

  const alert = updateAlert && (
    <Alert
      variant={updateAlert}
      onClose={() => setUpdateAlert(false)}
      dismissible
    >
      <Alert.Heading>
        {updateAlert === "success" ? "Success!" : "Error!"}{" "}
      </Alert.Heading>
      <p>
        {updateAlert === "success"
          ? "The bookability update went through successfully!"
          : "There was an error with your request, please try again."}
      </p>
    </Alert>
  );

  return (
    <Container className="d-flex flex-column pt-1 align-items-center rounded border border-primary bg-white">
      <div className="col-sm-8 my-4">
        <h4 className="text-center">Update Bookable Lectures</h4>
      </div>
      <Form className="col-sm-12 p-3" onSubmit={handleSubmit}>
        {alert}
        <Form.Group controlId="BatchUpdate.SelectCustom">
          <Form.Label>Select update operation:</Form.Label>
          <Form.Control
            as="select"
            custom
            value={updateTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              e.target.value &&
              ["not bookable", "bookable"].includes(e.target.value) &&
              setUpdateTo(e.target.value)
            }
          >
            {["not bookable", "bookable"].map((opt) => (
              <option key={opt} value={opt}>
                {capitalizeText(opt)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="BatchUpdate.SelectCustom">
          <Form.Label>Update granularity:</Form.Label>
          <Form.Control
            as="select"
            custom
            value={batchGranularity || "select"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              e.target.value &&
              granularity.includes(e.target.value) &&
              setBatchGranularity(e.target.value)
            }
          >
            <option key="select" value="select" disabled>
              -
            </option>
            {granularity.map((opt) => (
              <option key={opt} value={opt}>
                {capitalizeText(opt)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        {!batchGranularity ||
          ("all" != batchGranularity && batchItems.length > 0 ? (
            <Form.Group controlId="exampleForm.ControlSelect2">
              <Form.Label>Select entries to set to {updateTo}</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={selectedBatchItems}
                htmlSize={Math.min(10, batchItems.length)}
                onChange={handleChangeSelectBatchItems}
              >
                {batchItems.map(BatchItemToHtml)}
              </Form.Control>
            </Form.Group>
          ) : (
            <Alert variant="warning">There are no updatable entries.</Alert>
          ))}

        <Button variant="primary" type="submit" disabled={!batchSubmitEnabled}>
          Update Bookability
        </Button>
      </Form>
    </Container>
  );
};
