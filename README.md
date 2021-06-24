# Express User Management System

User Management System Project for building RESTful APIs and microservices using Node.js, Express and MongoDB

## Features
       Create a Node.js App to build REST APIs for managing data of Users.



Model:

{ name: String, mobile: String, email: String, address: { street: String, locality: String, city: String, state: String, pincode: String, coordinatesType: String, coordinates: [Number] } }

- Use Mongodb Timestamps (createdAt and updatedBy)

- Mobile Number must be Unique

- The coordinates must be Mongo GeoJson used for Geospatial Queries



Database: MongoDb



ODM Library: Mongoose



Database Hosting: You could use MongoDb Atlas (free account). Make sure you whitelist all ip addresses (from anywhere) in the MongoDb Atlas Cluster Access Configuration. 

Or any other online hosted mongodb deployment.



Endpoints: 

- Create a new User

- Update an Existing User

- Delete an User

- Get all Users

--- Get all Users sorted by createdAt timestamp with Pagination

--- Get all Users sorted by their distance from coordinates passed in the query param of the Endpoint. 

For Example. There's an API call to get all users sorted by distance from [17.3850, 78.4867] coordinates.



Code Quality Expectations:

- Readable code

- Properly documented and commented code as necessary

- Nicely Structured Code broken down into logical pieces/files

- Proper use of Git (Commits and Commit Descriptions)


#### Install dependencies:

```bash
npm i
```

#### Set environment variables:

```bash
cp .env.example .env
```

## Running Locally

```bash
npm run dev
```
