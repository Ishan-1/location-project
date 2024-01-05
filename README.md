# Location project
### Made as a part of learning MERN stack

This project is a full-fledged website that allows users to share and view various places around the world.
##  Key Features
### General
- Modern UI
- Compatible with both desktop and mobile devices
- Easy to use

### Users features
- Allows signup/login for user
- Allows CRUD operations on places for authorized users
- Uses unique tokens and supports auto login and logout for enhanced security

### Places
- Allows user to share places with images.
- Allows users to view places uploaded by other users
- Allows users to update and delete their own places.

## Technologies used 
### Frontend
The frontend is designed using React and CSS for styling. It also takes advantage of browser's local storage for temporarily storing user credentials in a secure manner for auto-login. The following libraries were used in addition to React for user input validation and routing:
- react-router-dom ( for different routes)
- react-transition-group ( for navigation drawer's animation in mobile devices)

### Backend
The backend is designed using Node and Express.js for a backend API to which requests can be sent for retrieving and manipulating data for both users and places. Binary data such as images are stored locally on the backend while other details are stored on MongoDB Cloud(a NoSQL database). Authorization and security is enforced on backend by hashing sensitive data as password for storage and using JSON web tokens (JWT) for authorization. The following libraries were used for backend:

- mongoose (for CRUD operations on MongoDB cloud)
- axios(for sending requests to LocationIQ API(for fetching coordinates for a given place))
- body-parser(for parsing JSON data in request)
- express-validator(for validating request data for POST requests)
- jsonwebtoken(for implementing unique user tokens)
- bcryptjs(for hashing user passwords before storage)
- uuid(for generating unique filename for storing image uploads)
- multer(for storage of user and places' image uploads)

### How to run
Requirements: Node.js and npm should be installed on the system
Steps for setup:
- Download/clone the repository 
- run `npm install` in backend and frontend directory to automatically install required dependencies
- now create environment files for both backend and frontend:
i) For frontend(in .env): `REACT_APP_BACKEND_URL = http://localhost:5000`
ii) For backend(in nodmeon.json): 
`{
    "env":{
        "DB_USER": "username",
        "DB_PASSWORD":"pass",
        "DB_NAME": "dbname",
        "LOCATION_API_KEY": "LocationIQ API Key",
        "JWT_KEY": "your_key"
    }
}`
- Run `npm start` in backend and frontend.
