# Project Architecture:

This project, known as the frontend, is connected to a backend API service that you also need to launch locally.

The backend project can be found here: https://github.com/FischKevin/DA-JS-Projet09/Billed-app-FR-Front

## Organizing Your Workspace:

For good organization, you can create a folder named ```bill-app``` in which you will clone the backend project and subsequently, the frontend project:

Clone the backend project into the bill-app folder:

``` git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git```

``` bill-app/
   - Billed-app-FR-Back
```

## Clone the frontend project into the bill-app folder:

``` git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git```

``` bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## How to Launch the Application Locally?
### Step 1 - Launch the Backend:

Follow the instructions in the README of the backend project.

### Step 2 - Launch the Frontend:

#### Go to the cloned repo:

``` cd Billed-app-FR-Front```

#### Install npm packages (described in package.json):

``` npm install```

#### Install live-server to launch a local server:

``` npm install -g live-server```

#### Launch the application:

``` live-server```

Then go to the address: http://127.0.0.1:8080/

#### How to Run All Tests Locally with Jest?

``` npm run test```

#### How to Run a Single Test?

Install jest-cli:

```npm i -g jest-cli```
``` jest src/__tests__/your_test_file.js```

#### How to View Test Coverage?

http://127.0.0.1:8080/coverage/lcov-report/

#### Accounts and Users:

You can log in using the accounts:

Administrator:

      Username: admin@test.tld
      Password: admin

Employee:

      Username: employee@test.tld
      Password: employee
