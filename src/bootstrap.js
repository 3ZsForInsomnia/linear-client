import { getNormalClient } from "./linear-client.js";
import {
  createConfigFolderIfNotExists,
  readConfigFile,
  writeConfigFile,
} from "./file-handling.js";

const getVar = (lines, search) => lines.find((line) => line.startsWith(search));

const writeDotEnv = async (userId, users) => {
  const currentDotEnvContents = readConfigFile().split("\n");

  const apiKeyLine = getVar(currentDotEnvContents, "export API_KEY");

  let userIDLine = getVar(currentDotEnvContents, "export MY_USER_ID");
  if (userId) {
    userIDLine = `export MY_USER_ID=${userId}`;
  }

  const stringifiedUsers = JSON.stringify(users, null, 0);

  const text = `
    ${apiKeyLine}
    ${userIDLine}
    export USERS=${stringifiedUsers}
  `;

  writeConfigFile(text);
};

const getUsers = async (client) => {
  const response = await client.rawRequest(`
    query users {
      users {
      nodes {
        displayName
        name
        email
        id
      }
    }
  }
  `);

  return response.data.users.nodes;
};

export const getAndSaveUsers = (client) => {
  writeDotEnv(getUsers(client));
};

export const bootstrap = async (client) => {
  const { id } = await client.viewer;
  const users = await getUsers(client.client);

  if (!id || !users) {
    console.error("Was unable to retrieve a userId and/or users! Exiting...");
    process.exit(1);
  }

  writeDotEnv(id, users);
};

export const main = async (apiKey) => {
  createConfigFolderIfNotExists();
  const client = getNormalClient(apiKey);

  bootstrap(client);
};
