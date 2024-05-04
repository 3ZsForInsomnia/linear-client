import { readConfigFile } from "./file-handling.js";
import { getLinearClient } from "./linear-client.js";

const bootstrapText = " Have you bootstrapped linear-client?";

export const prep = () => {
  const apiKey = readConfigFile("API_KEY");
  const myUserID = readConfigFile("MY_USER_ID");
  let users = readConfigFile("USERS");

  if (!apiKey) {
    throw new Error("API_KEY is missing" + bootstrapText);
  }
  if (!myUserID) {
    throw new Error("API_KEY is missing" + bootstrapText);
  }
  if (!users) {
    throw new Error("API_KEY is missing" + bootstrapText);
  } else {
    users = JSON.parse(users);
  }

  const client = getLinearClient(apiKey);

  return { client, myUserID, users };
};
