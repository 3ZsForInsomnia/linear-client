import { readConfigFile } from "./file-handling.js";
import { getLinearClient } from "./linear-client.js";

export const prep = () => {
  const apiKey = readConfigFile("API_KEY");
  const myUserID = readConfigFile("MY_USER_ID");
  let users = readConfigFile("USERS");

  if (!apiKey) {
    throw new Error("API_KEY is missing");
  }
  if (!myUserID) {
    throw new Error("MY_USER_ID is missing");
  }
  if (!users) {
    throw new Error("USERS is missing");
  } else {
    users = JSON.parse(users);
  }

  const client = getLinearClient(apiKey);

  return { client, myUserID, users };
};
