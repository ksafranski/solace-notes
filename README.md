# Solace: Notes

The goal of this project is to create a notes application allowing for users
to perform CRUD actions on a collection of notes.

Per the assignment summary:

> Solace has a feature that allows advocates to create notes on both their individual client appointments and contract work they perform for the client. A simple feature that has proven very valuable for advocates to solidify all their information inside one application that they can then share with their clients as they see fit.

## Acceptance Criteria

- [x] Must be written with JavaScript or Typescript (preferred)
- [x] Note Form must have the following validations:
  - [x] Must not be shorter then 20 characters
  - [x] Must not be longer then 300 characters
- [x] Main page must include all the notes and a way to create a new note
- [x] Main page must include a search bar that will find based on a notes content(Client or Server query is fine)
- [x] Must include README with steps on how to run the application(s) locally.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)

### Installing

1. Clone the repo
   ```sh
   git clone git@github.com:ksafranski/solace-notes.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Running (Development)

1. Start the server

   ```sh
   npm run dev
   ```

2. Navigate to [http://localhost:3000](http://localhost:3000)

## Notes / Decisions

Given this project’s goal was to understand my process and how I write code I decided to keep things simple and remain as unopinionated and framework agnostic as possible. From my position in the past as a technical hiring manager I’ve always opted for take-home projects over live-coding exercises and I know this comes with added overhead for the reviewer when a candidate goes nuts with frameworks.

Given the acceptance criteria for the app itself was core CRUD concepts I opted for NextJS given it’s easy to stand up and, besides directory structure, injects very little in terms of code that would be needed outside of React and Node. It also allowed me to spin up the app and api in unison, similar to my preference for monorepos when considering DX and development workflow.

I decided to mock a basic database interface vs. stand up Docker and containerize the application despite the temptation from my own personal passion for that stuff. Again, given the simplicity of the application requirements in terms of query, and no relational concerns it felt like the overhead would negate the purpose of the project. Kicker is in-memory stores with HMR can get reset, refresh if this happens.

I chose Antd for the design system / component library primarily because it’s in the “Goldilocks Zone” of component libs from my perspective; with simple enough components but solid design out of the box. There is a render flash on initial load, not going to address as implementation and build optimization would resolve this.

Overall a very fun project and I applaud your team for using this method for understanding candidates’ coding style and thought process. It was nice to work on something tangible with a goal versus the data structures, algorithms, and leet-code exercises typically used.
