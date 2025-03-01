# SmartyShowdown

SmartyShowdown is a web-based quiz platform that lets you create, play, and share quizzes with others. You can test your knowledge on various topics, compete with other players, and learn something new along the way.

[Try it out!](http://polytechnique-montr-al.gitlab.io/log2990/20241/equipe-101/LOG2990-101/#/home)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Creators](#creators)
- [License](#license)

## Features

- **Create quizzes**: You can create your own quizzes using multiple-choice or free-text questions. You can also use the question bank to add pre-made questions to your quizzes.
- **Play quizzes**: You can join a quiz session using a 4-digit code and answer the questions on your device. You can also test a quiz before creating a session.
- **Share quizzes**: You can export or import quizzes in JSON format. You can also make your quizzes visible or hidden to other users.
- **View results**: You can see the scores and statistics of each quiz session. You can also see the feedback and ratings from other players.

## Installation

To install SmartyShowdown, follow these steps:

1. Clone the repository: `git clone https://github.com/o-benz/SmartyShowdown`
2. Install dependencies in both client and server: `cd client`, `npm ci`; `cd server`, `npm ci`
3. Test the project (optional): `cd client`, `npm run coverage`; `cd server`, `npm run coverage`
4. Run the project (no need to redirect to client and server): `npm start`

## Usage

Here are SmartyShowdown's various pages:

- **Initial view**: This is where you can go into admin mode or join or create a game.
![MainPage](/doc/main-page.png)

- **Admin view**: This is where you can create, modify, delete, export, or import quizzes. You can also manage the question bank and the quiz history.
![QuizList](/doc/admin-quiz-list.png)
![QuestionList](/doc/admin-question-list.png)
![History](/doc/admin-history.png)

- **Create session view**: This is where you can select a quiz and create a session for other players to join. You can also test a quiz before creating a session.
![CreateGame](/doc/create-game.png)

- **Game Lobby**: This is where you can see the players who have joined the session and chat with them. You can also lock the access to the session or start the quiz.
![GameLobby](/doc/lobby.png)

- **Join session view**: This is where you can enter a 4-digit code to join a quiz session created by another user.
![JoinGame](/doc/join-game.png)

- **Game view**: This is where you can see the question and answer it. You can also chat with other players during the game.
![GameQCM](/doc/game-qcm.png)

- **Organizer view**: This is what the game's organizer sees throughout the game. He can also chat with other players during the game.
![OrganizerView](/doc/organizer-view.png)

- **Results view**: This is where you can see the scores and statistics of the quiz session. You can also rate and comment on the quiz.
![Results](/doc/results.png)

## Development

SmartyShowdown has been meticulously developed, leveraging a range of tools and technologies to ensure a seamless user experience. The development process involved the integration of various components, including the web client, a dynamic server, and a database. Here's an elaborate breakdown of the development stack:

- **Typescript**: Served as the main programming language for the logic of the website, ensuring robust and type-safe code.
- **Git and GitLab**: Utilized for version control and collaboration, enabling effective management of code changes and seamless integration.
- **HTML and SCSS**: Employed for crafting the markup and styling of the web client, ensuring a visually appealing and user-friendly interface.
- **Angular**: Chosen as the front-end framework to facilitate the creation of dynamic user interfaces and efficient handling of user interactions.
- **Client-server architecture**: Adopted as the design pattern to segregate the concerns of the web client and the dynamic server, enhancing scalability and maintainability.
- **MongoDB**: Selected as the database solution for storing and retrieving quiz data efficiently, ensuring optimal performance and scalability.
- **Agile development - Scrum**: Implemented as the methodology for organizing work into sprints, fostering collaboration, and delivering incremental features.
- **NestJS**: Utilized as the framework for developing the dynamic server and providing RESTful API endpoints, facilitating smooth communication between the client and server.
- **Socket.IO**: Integrated for enabling real-time communication between the web client and the dynamic server, ensuring seamless multiplayer quiz experiences.
- **GitLab Pages and AWS EC2**: Leveraged for deploying the web client and dynamic server respectively, enabling efficient hosting and scalability.
- **MongoDB Atlas**: Utilized for hosting the MongoDB database in the cloud, ensuring reliability, scalability, and ease of management.

## Creators

SmartyShowdown is the result of the collaborative effort of:
- Omar BENZEKRI
- Charles DESROSIERS
- Hugo LEFEBVRE
- Thomas ROULEAU
- Yassine SEDDAOUI
- Éloi VINCENT-LÉGARÉ

## 📄 License

This project is licensed under the [MIT License](LICENSE), so feel free to use, modify, and share it as you like.