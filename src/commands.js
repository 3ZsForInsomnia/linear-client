import { execSync } from "child_process";
import select from "@inquirer/select";
import { convertTicketToOption } from "./last-selected.js";

const execWrapper = (commandToRun) => {
  try {
    execSync(commandToRun);
  } catch (e) {
    return e;
  }
};

const createBranch = (branchName) =>
  execWrapper(`git checkout -b ${branchName}`);

const checkoutBranch = (branchName) =>
  execWrapper(`git checkout origin/${branchName}`);

const getBranchForTicket = async (client, ticket) => {
  const response = await client.rawRequest(`
    query getBranch {
      issues(filter: {number: { eq: ${ticket} }}) {
        nodes {
          title
          branchName
        }
      }
    }
  `);

  const issue = response.data.issues.nodes[0];

  return issue.branchName;
};

export const createBranchForTicket = async (client, argv) => {
  const {
    ticket_id: ticketId,
    last_ticket: lastTicket,
    user_id: userId,
  } = argv;
  if (ticketId) return await getBranchByTicket(client, ticketId, createBranch);
  else if (lastTicket)
    return await getBranchByTicket(client, lastTicket, createBranch);

  const ticket = await selectTaskFromAssigned(client, userId);
  return await getBranchByTicket(client, ticket, createBranch);
};

const getBranchByTicket = async (client, ticketId, branchCommand) => {
  const branch = await getBranchForTicket(client, ticketId);
  branchCommand(branch);
  return branch;
};

export const checkoutBranchForTicket = async (argv, client) => {
  const {
    ticket_id: ticketId,
    last_ticket: lastTicket,
    user_id: userId,
  } = argv;
  if (ticketId)
    return await getBranchByTicket(client, ticketId, checkoutBranch);
  else if (lastTicket)
    return await getBranchByTicket(client, lastTicket, checkoutBranch);

  const ticket = await selectTaskFromAssigned(client, userId);
  return await getBranchByTicket(client, ticket, checkoutBranch);
};

const getIssues = (resp) => resp.data.user.assignedIssues.nodes;
const flatten = (issueNode) => ({
  ...issueNode,
  attachments: issueNode.attachments.nodes.map((node) => node.url),
  state: issueNode.state.name,
});

const createFilter = (filter) => {
  if (!filter || filter === "both") return "";
  if (filter === "open")
    return "filter: { and: [ { state: { type: { neq: 'completed' } } } { state: { type: { neq: 'canceled' } } } ] }";
  else if (filter === "closed")
    return "filter: { and: [ { state: { type: { eq: 'completed' } } } { state: { type: { eq: 'canceled' } } } ] }";
};

export const getAssignedTasks = async (client, userId, filter) => {
  const response = await client.rawRequest(
    `
    query searchIssues {
    user(id: "${userId}") {
      assignedIssues(${createFilter(filter)}) {
        nodes {
          title
          branchName
          attachments {
            nodes {
              url
            }
          }
          state {
            name
          }
        }
      }
    }
  }
  `,
  );
  return getIssues(response).map(flatten);
};

const selectTaskFromAssigned = async (client, userId) => {
  const tasks = await getAssignedTasks(client, userId);

  const task = await select({
    message: "Select a task",
    choices: tasks.map(convertTicketToOption),
  });

  return task;
};
