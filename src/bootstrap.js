import { getNormalClient } from "./linear-client.js";
import {
  createConfigFolderIfNotExists,
  readConfigFile,
  writeConfigFile,
} from "./file-handling.js";

const getVar = (lines, search) => lines.find((line) => line.startsWith(search));

const writeDotEnv = async (users, userId) => {
  const wasFolderCreated = createConfigFolderIfNotExists();
  if (wasFolderCreated) {
    // User needs to re-run with the API key populated in ~/.config/linear-client/config
    return;
  }

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

  writeDotEnv(users, id);
};

export const main = async (apiKey) => {
  const client = getNormalClient(apiKey);

  bootstrap(client);
};
