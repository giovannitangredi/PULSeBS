# End to end test for Story 12

- [End to end test for Story 12](#end-to-end-test-for-story-12)
  - [Upload valid files](#upload-valid-files)
  - [Upload invalid files](#upload-invalid-files)
  - [Reset files](#reset-files)

## Upload valid files

the files can be found in /test/csvfiles/

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex : s280113@studenti.polito.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex :password)  |
|   6  |   Click on the Submit button |
|   7  |   Wait for the Support Officer Page to load |
|   8  |   Click in the field upload file for students|
|   9  |   Choose Students.csv and click Open|
|   10  |   Click in the field upload file for teachers|
|   11  |   Choose Professors.csv and click Open|
|   12  |   Click in the field upload file for courses|
|   13  |   Choose Courses.csv and click Open|
|   14  |   Click in the field upload file for enrollments|
|   15  |   Choose Enrollments.csv and click Open|
|   16  |   Click on Upload |
|   17  |   Wait for the upload to complete |
|   18  |   The green message All files uploaded should appear meaning that the upload was successful  |

## Upload invalid files

the files can be found in /test/csvfiles/

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex : s280113@studenti.polito.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex :password)  |
|   6  |   Click on the Submit button |
|   7  |   Wait for the Support Officer Page to load |
|   14  |   Click in the field upload file for enrollments|
|   15  |   Choose an invalid csv file and click Open|
|   16  |   Click on Upload |
|   17  |   Wait for the upload to complete |
|   18  |   The red message Error uploading enrollments should appear meaning that the upload was unsuccessful  |

## Reset files

the files can be found in /test/csvfiles/

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex : s280113@studenti.polito.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex :password)  |
|   6  |   Click on the Submit button |
|   7  |   Wait for the Support Officer Page to load |
|   8  |   Click in the field upload file for students|
|   9  |   Choose Students.csv and click Open|
|   10  |   Click in the field upload file for teachers|
|   11  |   Choose Professors.csv and click Open|
|   12  |   Click in the field upload file for courses|
|   13  |   Choose Courses.csv and click Open|
|   14  |   Click in the field upload file for enrollments|
|   15  |   Choose Enrollments.csv and click Open|
|   16  |   Click on Reset |
|   17  |   Wait for the page to load |
|   18  |   All the files are deselected and now you can select new files |
