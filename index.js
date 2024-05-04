#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import "dotenv/config";

import clipboard from "clipboardy";

import {
  getLastSelectedTicket,
  getLastSelectedUser,
  selectUser,
} from "./src/last-selected.js";
import { prep } from "./src/prep.js";
import {
  createBranchForTicket,
  getAssignedTasks,
  getBranchForTicket,
} from "./src/commands.js";

const { users, client, myUserID } = prep();

const emitResults = (results) => console.log(results);
const sendResultsToClipBoard = (results) => {
  clipboard.writeSync(results);
  emitResults(results);
};

const handleResults = (func, args) => (argv) =>
  argv.c ? sendResultsToClipBoard(func(args)) : emitResults(func(args));

const getUserThenRunCommand = (command, ...args) => {
  const userId = JSON.parse(selectUser(users)).id;
  return command(...args, userId);
};

const handleProvidedTicketOrUseLastTicket = (yargs) => {
  yargs.positional("ticket_id", {
    alias: "t",
    describe: 'ID of the ticket to get the branch for (e.g. "123" in "hed-123"',
    type: "number",
  });
  yargs.option("last-ticket", {
    alias: "lt",
    desc: "Use the ID of the last ticket selected in the current command",
    type: "boolean",
    handler: (argv) => {
      argv.t = getLastSelectedTicket();
      return argv;
    },
  });
  yargs.check((argv) => {
    if (argv.t && argv.lt) {
      throw new Error("Please provide only one of ticket_id or last-ticket");
    }
    if (!argv.t && !argv.lt) {
      throw new Error("Please provide a ticket_id or use last-ticket");
    }
    return true;
  });
};

const argv = yargs(hideBin(process.argv))
  .command(
    ["get-user", "user"],
    "Select a user from your teammates",
    (yargs) => {
      yargs.option("props", {
        alias: "p",
        desc:
          "Tell me which properties of the selected user to return. Default is ID.\n" +
          "\tOptions are..." +
          "i for ID, n for Name, e for email, a for all",
      });
    },
    handleResults(selectUser, users),
  )
  .command(
    ["get-branch-for-task", "get-branch", "gb"],
    "Get the branch associated with a ticket",
    handleProvidedTicketOrUseLastTicket,
    handleResults(getUserThenRunCommand(getBranchForTicket, client)),
  )
  .command(
    ["create-branch-for-task", "create-branch", "cb"],
    "Create a branch for the ticket ID provided",
    handleProvidedTicketOrUseLastTicket,
    handleResults(getUserThenRunCommand(createBranchForTicket, client)),
  )
  .command(
    ["get-my-tickets", "my-tasks", "tasks"],
    "Get my assigned tickets",
    (yargs) => {
      yargs.option("filter", {
        alias: "f",
        desc: "Filter by open tickets, closed tickets, or both. Defaults to open tickets only",
        choices: ["open", "closed", "both"],
      });
    },
    handleResults(getAssignedTasks, client, myUserID),
  )
  .command(
    ["get-users-tickets", "user-tasks"],
    "Get tickets assigned to another user",
    (yargs) => {
      yargs.option("user_id", {
        alias: "i",
        describe:
          "OPTIONAL: ID of the user you wish to get the tickets of. If not provided, will be prompted to select a user",
        type: "string",
      });
      yargs.option("last-user", {
        alias: "l",
        desc: "Use the ID of the last user selected in the current command",
        type: "boolean",
        handler: (argv) => {
          argv.user_id = getLastSelectedUser();
          return argv;
        },
      });
      yargs.check((argv) => {
        if (argv.user_id && argv.l) {
          throw new Error("Please provide only one of user_id or last-user");
        } else if (!argv.user_id && !argv.l) {
          throw new Error("Please provide a user_id or use last-user");
        }
        return true;
      });

      yargs.option("filter", {
        alias: "f",
        desc: "Filter by open tickets, closed tickets, or both. Defaults to open tickets only",
        choices: ["open", "closed", "both"],
      });
    },
    handleResults(getUserThenRunCommand(getAssignedTasks, client, argv.filter)),
  )
  .demandCommand()
  .option("copy-to-clipboard", {
    alias: "c",
    desc: "Send results to clipboard",
    type: "boolean",
  })
  .help()
  .alias("help", "h")
  .strict()
  .parse();