#!/usr/bin/env node

import "dotenv/config";

import { main } from "./src/bootstrap.js";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing");
  process.exit(1);
}

main(apiKey);
