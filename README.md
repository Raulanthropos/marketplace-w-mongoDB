# Marketplace - Backend

This is the backend of the marketplace application built using Node.js, Express, and MongoDB. The backend provides APIs for user authentication, product management, and review handling.

## Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing product and user data.

## Features

- **User Authentication**: JWT-based authentication for registering and logging in users.
- **Product Management**: APIs for fetching product details.
- **Review Handling**: APIs for adding and fetching product reviews. Full CRUD functionality for authenticated users.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/mock-eshop-backend.git
    cd mock-eshop-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Create a `.env` file in the root directory with the following content:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4. Start the server:
    ```bash
    npm start
    # or
    yarn start
    ```

The server will be running at `http://localhost:3001`.

## API Endpoints

- **User Routes**
  - `POST /users/register`: Register a new user.
  - `POST /users/login`: Log in the  user.
  - GET /users/me See the user's details
  - POST users/logout Log out the user.

- **Product Routes**
  - `GET /products`: Fetch all products.
  - `GET /products/:id`: Fetch a single product by ID.

- **Review Routes**
  - `POST /products/:productId/reviews`: Add a review to a product.
  - `GET /products/:productId/reviews`: Fetch reviews for a product.
  - GET/PUT/DELETE /products/productId/reviews/reviewId Maniputate a specific review

## Project Structure

- `api`: API route handlers.
- `lib/auth`: Middleware functions for authentication and error handling.

## Usage

1. Register a new user or log in with existing credentials via the frontend.
2. Use the provided endpoints to manage products and reviews.
