import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import app from "../src/app.js";

test("GET / responds with welcome message", async () => {
  const response = await request(app).get("/");
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    message: "Welcome to the Express API running on AWS Lambda.",
  });
});

test("GET /health responds with status ok", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
});
