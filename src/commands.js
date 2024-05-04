import { exec } from "child_process";
import select from "@inquirer/select";
import { convertTicketToOption } from "./last-selected";

const execWrapper = (commandToRun) => {
  exec(commandToRun, (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }
    return stdout;
  });
};

const createBranch = (branchName) =>
  execWrapper(`git checkout -b ${branchName}`);

const checkoutBranch = (branchName) =>
  execWrapper(`git checkout ${branchName}`);

const getBranchForTicket = async (client, ticket) => {
  const issue = await client.rawRequest(`
    query getBranch {
      issues(filter: {number: { eq: ${ticket} }}) {
        nodes {
          title
          branchName
        }
      }
    }
  `).data.issues.nodes[0];

  return issue.branchName;
};

export const createBranchForTicket = (client, userId) => {
  const ticket = selectTaskFromAssigned(client, userId);
  const branch = getBranchForTicket(ticket);

  createBranch(branch);

  return branch;
};

export const checkoutBranchForTicket = (client, userId) => {
  const ticket = selectTaskFromAssigned(client, userId);
  const branch = getBranchForTicket(ticket);

  checkoutBranch(branch);

  return branch;
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
