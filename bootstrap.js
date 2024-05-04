#!/usr/bin/env node

import { main } from "./src/bootstrap.js";
import { readConfigFile } from "./src/file-handling.js";

const apiKey = readConfigFile("API_KEY");

if (!apiKey) {
  console.error("API_KEY is missing");
  process.exit(1);
}

main(apiKey);
