# End to end test for Story 2

- [End to end test for Story 2](#end-to-end-test-for-story-2)
  - [WRONG CREDENTIALS](#wrong-credentials)
  - [Successful Login](#successful-login)
  - [LOGOUT](#logout)

## WRONG CREDENTIALS

| Step | Description                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                               |
| 2    | Click on the email field                                                                            |
| 3    | Insert invalid email (for ex :noInes.Beneventi@politu.it)                                           |
| 4    | Click on the password field                                                                         |
| 5    | Insert invalid password (for ex :notvalid)                                                          |
| 6    | Click on the Submit button                                                                          |
| 7    | An alert appears with the following message : You have inserted Wrong Credentials! Please try again |

## Successful Login

| Step | Description                                                          |
| ---- | -------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                |
| 2    | Click on the email field                                             |
| 3    | Insert valid email (for ex :Ines.Beneventi@politu.it)                |
| 4    | Click on the password field                                          |
| 5    | Insert valid password (for ex : password)                            |
| 6    | Click on the Submit button                                           |
| 7    | The login is successful and you will be redirect to the Teacher page |

## LOGOUT

| Step | Description                                                          |
| ---- | -------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                |
| 2    | Click on the email field                                             |
| 3    | Insert valid email (for ex :Ines.Beneventi@politu.it)                |
| 4    | Click on the password field                                          |
| 5    | Insert valid password (for ex : password)                            |
| 6    | Click on the Submit button                                           |
| 7    | The login is successful and you will be redirect to the Teacher page |
| 8    | Now click in the Logout Button in the upper right corner             |
| 9    | the system start the logout and you are redirect to the login page   |
