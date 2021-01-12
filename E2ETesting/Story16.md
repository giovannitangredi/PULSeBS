# End to end test for Story 16

- [End to end test for Story 16](#end-to-end-test-for-story-16)
  - [Search for a not valid SSN](#search-for-a-not-valid-ssn)
  - [Reset after a valid search](#reset-after-a-valid-search)
  - [Download Contact tracing reports](#download-contact-tracing-reports)

## Search for a not valid SSN

| Step | Description                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                                                   |
| 2    | Click on the email field                                                                                                |
| 3    | Insert valid email for the manager (for ex :behnam.lotfi@polito.it)                                                     |
| 4    | Click on the password field                                                                                             |
| 5    | Insert valid password (for ex : password)                                                                               |
| 6    | Click on the Submit button                                                                                              |
| 7    | Wait for the Manager page to load                                                                                       |
| 8    | Click on Contact Tracing Tab                                                                                            |
| 9    | Wait for the page to load                                                                                               |
| 10   | Insert a wrong SSN in the SSN search bar                                                                                |
| 11   | A Warning message Wrong SSN should appear                                                                               |

## Reset after a valid search

| Step | Description                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                                                   |
| 2    | Click on the email field                                                                                                |
| 3    | Insert valid email for the manager (for ex :behnam.lotfi@polito.it)                                                     |
| 4    | Click on the password field                                                                                             |
| 5    | Insert valid password (for ex : password)                                                                               |
| 6    | Click on the Submit button                                                                                              |
| 7    | Wait for the Manager page to load                                                                                       |
| 8    | Click on Contact Tracing Tab                                                                                            |
| 9    | Wait for the page to load                                                                                               |
| 10   | Insert a valid SSN in the SSN search bar                                                                                |
| 11   | Now the info about the student appears below the search bar                                                              |
| 12   | Click on the Reset Button                                                                                               |
| 13   | The page has been reset as before doing the search                                                                      |

## Download Contact tracing reports

| Step | Description                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                                                   |
| 2    | Click on the email field                                                                                                |
| 3    | Insert valid email for the manager (for ex :behnam.lotfi@polito.it)                                                     |
| 4    | Click on the password field                                                                                             |
| 5    | Insert valid password (for ex : password)                                                                               |
| 6    | Click on the Submit button                                                                                              |
| 7    | Wait for the Manager page to load                                                                                       |
| 8    | Click on Contact Tracing Tab                                                                                            |
| 9    | Wait for the page to load                                                                                               |
| 10   | Insert a valid SSN in the SSN search bar                                                                                |
| 11   | Now the info about the student appears below the search bar                                                              |
| 12   | Click on the Tacing Button                                                                                              |
| 13   | A Preview with all the data should appear on the right                                                                  |
| 14   | Click on Download Report Button                                                                                         |
| 15   | The download of pdf and csv files will start with the following names: *id*_Contact_Tracing_Report_*date*.*file*        |
