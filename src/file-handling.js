import { sep } from "path";
import { readFileSync, writeFileSync, existsSync, mkDirSync } from "fs";

const configLocation = `~${sep}.config${sep}linear-client`;
const configFile = "config";
const config = `${configLocation}${sep}${configFile}`;

export const createConfigFolderIfNotExists = () => {
  if (!existsSync(config)) {
    mkDirSync(configLocation);
    writeFileSync(config, 'export API_KEY=""');
    console.log("Your config file is now ready! Add your API key!");
    return true;
  }
  return false;
};

export const writeConfigFile = (contents) => {
  writeFileSync(config, contents);
};

export const readConfigFile = () => {
  return readFileSync(config, "utf-8");
};

const dataLocation = `~${sep}.cache${sep}linear-client`;
const dataFile = "data";
const data = `${dataLocation}${sep}${dataFile}`;

export const writeKeyInDataFile = (key, contents) => {
  const lines = readFileSync(data, "utf-8").split("\n");
  const linesToKeep = lines.filter((line) => !line.includes(key));
  const newLine = `${key}=${contents}`;

  writeFileSync(data, [...linesToKeep, newLine].join("\n"));
};

export const readKeyFromDataFile = (key) => {
  const lines = readFileSync(data, "utf-8").split("\n");
  const line = lines.find((line) => line.includes(key));
  return line.split("=")[1];
};
