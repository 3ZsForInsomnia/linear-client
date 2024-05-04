import { sep } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";

const configLocation = `${homedir}${sep}.config${sep}linear-client`;
const configFile = "config";
const config = `${configLocation}${sep}${configFile}`;

const createConfigFile = (apiKey) => writeFileSync(config, `API_KEY=${apiKey}`);

export const createConfigFolderIfNotExists = (apiKey) => {
  if (!apiKey) console.error("You must provide an API key to bootstrap!");

  if (!existsSync(config)) {
    console.log("Creating config folder and file...");
    mkdirSync(configLocation);
    createConfigFile(apiKey);
  } else if (!existsSync(configLocation)) {
    console.log("Creating config file...");
    createConfigFile(apiKey);
  } else {
    const existingApiKey = readConfigFile("API_KEY");
    if (!existingApiKey) {
      console.log(
        "Config file found but no API_KEY present. Recreating config file with API key...",
      );
      createConfigFile(apiKey);
    } else console.log("API key already exists. Continuing...");
  }
};

const linesToKeep = (file, key) =>
  readFileSync(file, "utf-8")
    .split("\n")
    .filter((line) => !line.includes(key));

export const writeConfigFile = (key, contents) => {
  const lines = linesToKeep(config, key);
  const newLine = `${key}=${contents}`;

  writeFileSync(config, [...lines, newLine].join("\n"));
};

export const readConfigFile = (key) =>
  readFileSync(config, "utf-8")
    .split("\n")
    .find((line) => line.includes(key))
    .split("=")[1];

const dataLocation = `${homedir}${sep}.cache${sep}linear-client`;
const dataFile = "data";
const data = `${dataLocation}${sep}${dataFile}`;

export const writeKeyInDataFile = (key, contents) => {
  const lines = linesToKeep(data, key);
  const newLine = `${key}=${contents}`;

  writeFileSync(data, [...lines, newLine].join("\n"));
};

export const readKeyFromDataFile = (key) =>
  readFileSync(data, "utf-8")
    .split("\n")
    .find((line) => line.includes(key))
    .split("=")[1];
