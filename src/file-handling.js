import { sep } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";

const configLocation = `${homedir}${sep}.config${sep}linear-client`;
const configFile = "config";
const config = `${configLocation}${sep}${configFile}`;

export const createConfigFolderIfNotExists = () => {
  if (!existsSync(config)) {
    mkdirSync(configLocation);
    writeFileSync(config, "export API_KEY=");
    console.log("Your config file is now ready! Add your API key!");
    return true;
  }
  return false;
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
