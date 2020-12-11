# End to end test for Story 1

- [End to end test for Story 1](#end-to-end-test-for-story-1)
  - [WRONG CREDENTIALS](#wrong-credentials)
  - [Succeful Login](#succeful-login)
  - [LOGOUT](#logout)
  - [Book a Seat from table](#book-a-seat-from-table)
  - [Book a Seat from calendar](#book-a-seat-from-calendar)

## WRONG CREDENTIALS

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert invalid email (for ex :no900000@students.politu.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert invalid password (for ex :notvalid)  |
|   6  |   Click on the Submit button |
|   7  |   An allert appears with the following message : You have inserted Wrong Credentials! Please try again |

## Succeful Login

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex :s900000@students.politu.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex : passwrod)  |
|   6  |   Click on the Submit button |
|   7  |   The login is succeful and you will be redirect to the student page |

## LOGOUT

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex :s900000@students.politu.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex : passwrod)  |
|   6  |   Click on the Submit button |
|   7  |   The login is succeful and you will be redirect to the student page |
|   8  |   Now click in the Logout Button in the upper roght corner |
|   9  |   the system start the logout  and you are redirect to the login page |

## Book a Seat from table

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex :s900000@students.politu.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex : passwrod)  |
|   6  |   Click on the Submit button |
|   7  |   The login is succeful and you will be redirect to the student page |
|   8  |   Scrool until you see the Bookable List of lecture |
|   9  |   Click on the Book a Seat button on the right  close to a lecture |
|   10 |   Wait for the Student Page to load |
|   11 |   Now the booked lesson appears in the Booked Lecture list |


## Book a Seat from calendar

| Step | Description |
|------|-------------|
|   1  |   Open the browser and go to login page |
|   2  |   Click on the email field  |
|   3  |   Insert valid email (for ex :s900000@students.politu.it)  |
|   4  |   Click on the password field  |
|   5  |   Insert valid password (for ex : passwrod)  |
|   6  |   Click on the Submit button |
|   7  |   The login is succeful and you will be redirect to the student page |
|   8  |   Scrool until you see the Calendar |
|   9  |   Find a blue card that indicate a bookable lecture and click on it |
|   10 |   Click the  Ok button on the modal that appear |
|   11 |   Wait for the Student Page to load |
|   12 |   Now the booked lesson appears as green in the Calendar |