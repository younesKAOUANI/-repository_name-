import http from "k6/http";
import { check, sleep } from "k6";
import { randomSeed, randomIntBetween } from "k6";

randomSeed(1234); // reproducible randomness

export let options = {
  stages: [
    { duration: "30s", target: 20 },   // ramp-up
    { duration: "1m", target: 100 },   // steady load
    { duration: "30s", target: 0 },    // ramp-down
  ],
};

// Replace with your API base URL
const BASE_URL = "https://yourdomain.com";

// Sample test users
const USERS = [
  { email: "student1@example.com", password: "password123" },
  { email: "student2@example.com", password: "password123" },
  { email: "student3@example.com", password: "password123" },
];

export default function () {
  // Pick a random test user
  let user = USERS[randomIntBetween(0, USERS.length - 1)];

  // ---- LOGIN ----
  let loginRes = http.post(`${BASE_URL}/api/login`, JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  });
  check(loginRes, { "login success": (res) => res.status === 200 });

  let authToken = loginRes.json("token"); // assuming JWT
  let headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  // ---- FETCH QUIZ ----
  let quizId = 123; // replace with a real quiz ID
  let quizRes = http.get(`${BASE_URL}/api/quizzes/${quizId}`, { headers });
  check(quizRes, { "quiz fetched": (res) => res.status === 200 });

  let quiz = quizRes.json();
  let questions = quiz.questions || [];

  // ---- ANSWER QUESTIONS ----
  for (let i = 0; i < questions.length; i++) {
    let question = questions[i];
    let chosenAnswer = "A"; // you could randomize this if needed

    let ansRes = http.post(
      `${BASE_URL}/api/quizzes/${quizId}/answer`,
      JSON.stringify({
        questionId: question.id,
        answer: chosenAnswer,
      }),
      { headers }
    );

    check(ansRes, { "answered": (res) => res.status === 200 });

    sleep(randomIntBetween(1, 4)); // simulate thinking time
  }

  // ---- SUBMIT QUIZ ----
  let submitRes = http.post(
    `${BASE_URL}/api/quizzes/${quizId}/submit`,
    null,
    { headers }
  );
  check(submitRes, { "quiz submitted": (res) => res.status === 200 });

  // ---- LOGOUT (optional) ----
  http.post(`${BASE_URL}/api/logout`, null, { headers });

  // Short pause before next iteration
  sleep(randomIntBetween(2, 5));
}
