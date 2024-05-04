import { LinearClient } from "@linear/sdk";

export const getLinearClient = (apiKey) => {
  const client = new LinearClient({ apiKey }).client;

  return client;
};

export const getNormalClient = (apiKey) => {
  const client = new LinearClient({ apiKey });

  return client;
};
