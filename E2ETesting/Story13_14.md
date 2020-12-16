# End to end test for Story 13_14

- [End to end test for Story 13_14](#end-to-end-test-for-story-13_14)
  - [Go in the waiting list from list](#go-in-the-waiting-list-from-list)
  - [Go in the waiting list from the calendar](#go-in-the-waiting-list-from-the-calendar)
  - [Being taken from a waiting list](#being-taken-from-a-waiting-list)

## Go in the waiting list from list

| Step | Description                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                                                   |
| 2    | Click on the email field                                                                                                |
| 3    | Insert valid email (for ex :s900000@students.politu.it)                                                                 |
| 4    | Click on the password field                                                                                             |
| 5    | Insert valid password (for ex : password)                                                                               |
| 6    | Click on the Submit button                                                                                              |
| 7    | Wait for the Student page to load                                                                                       |
| 8    | Click on the button Go in waiting list from a lecture from the Bookable lectures list                                   |
| 9    | Wait for the page to load                                                                                               |
| 10   | Now the lecture remains in the Bookable lecture list and there is a message showing You are already in the waiting list |

## Go in the waiting list from the calendar

| Step | Description                                                            |
| ---- | ---------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                  |
| 2    | Click on the email field                                               |
| 3    | Insert valid email (for ex :s900000@students.politu.it)                |
| 4    | Click on the password field                                            |
| 5    | Insert valid password (for ex : password)                              |
| 6    | Click on the Submit button                                             |
| 7    | Wait for the Student page to load                                      |
| 8    | Scroll until you reach the calendar                                    |
| 9    | Click on a full lecture                                                |
| 10   | On the modal click on the OK button                                    |
| 11   | Wait for the page to load                                              |
| 12   | Now the same lecture changes color e you are put into the waiting list |

## Being taken from a waiting list

| Step | Description                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Open the browser and go to login page                                                                                   |
| 2    | Click on the email field                                                                                                |
| 3    | Insert valid email (for ex :s900000@students.politu.it)                                                                 |
| 4    | Click on the password field                                                                                             |
| 5    | Insert valid password (for ex : password)                                                                               |
| 6    | Click on the Submit button                                                                                              |
| 7    | Wait for the Student page to load                                                                                       |
| 8    | Click on the button Go in waiting list from a lecture from the Bookable lectures list                                   |
| 9    | Wait for the page to load                                                                                               |
| 10   | Now the lecture remains in the Bookable lecture list and there is a message showing You are already in the waiting list |
| 11   | Logout and return to the login page                                                                                     |
| 12   | Login as a student who was already booked for the lecture                                                               |
| 13   | Click on the unbook button for the lecture selected from the previous student                                           |
| 14   | Wait for the page to load then logout                                                                                   |
| 15   | Login again as the first student                                                                                        |
| 16   | Now from the Booked Lecture List and the calendar you can see you are booked for the lecture                            |
