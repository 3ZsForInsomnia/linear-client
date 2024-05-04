#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import clipboard from "clipboardy";

import { main } from "./src/bootstrap.js";

import {
  getLastSelectedTicket,
  getLastSelectedUser,
  selectTicket,
  selectUser,
} from "./src/last-selected.js";
import { prep } from "./src/prep.js";
import {
  createBranchForTicket,
  getAssignedTasks,
  checkoutBranchForTicket,
} from "./src/commands.js";

const isBootstrapping = process.argv[2] === "bootstrap";
if (isBootstrapping) {
  const apiKey = process.argv[3];
  main(apiKey);
  process.exit(0);
}

const { users, client, myUserID } = prep();

const emitResults = (results) => console.log(results);
const sendResultsToClipBoard = (results, onlyId) => {
  try {
    const parsed = JSON.parse(results);
    if (parsed.id && onlyId) clipboard.writeSync(parsed.id);
    else clipboard.writeSync(results);
  } catch (e) {
    clipboard.writeSync(results);
  }
  emitResults(results);
};

const handleResults = async (func, argv, ...args) => {
  const handler = argv.c ? sendResultsToClipBoard : emitResults;

  let result;
  if (typeof func !== "function") result = handler(func, argv.j);
  else result = handler(await func(argv, ...args), argv.j);
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
    async (argv) => await handleResults(selectUser, argv, users),
  )
  .command(
    ["get-branch-for-task", "get-branch", "gb"],
    "Get the branch associated with a ticket",
    handleProvidedTicketOrUseLastTicket,
    async (argv) => await handleResults(checkoutBranchForTicket, argv, client),
  )
  .command(
    ["create-branch-for-task", "create-branch", "cb"],
    "Create a branch for the ticket ID provided",
    handleProvidedTicketOrUseLastTicket,
    async (argv) => await handleResults(createBranchForTicket, client, argv),
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
      yargs.option("select", {
        alias: "s",
        desc: "Allow selecting a ticket from the results",
        type: "boolean",
      });
    },
    async (argv) => {
      const myTasks = await getAssignedTasks(argv, client, myUserID);

      if (argv.select) return await handleResults(selectTicket, argv, myTasks);
      return await handleResults(myTasks, argv);
    },
  )
  .command(
    ["get-users-tickets", "user-tasks", "ut"],
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

      yargs.option("filter", {
        alias: "f",
        desc: "Filter by open tickets, closed tickets, or both. Defaults to open tickets only",
        choices: ["open", "closed", "both"],
      });

      yargs.option("select", {
        alias: "s",
        desc: "Allow selecting a ticket from the results",
        type: "boolean",
      });
    },
    async (argv) => {
      let tasks;
      if (argv.user_id) tasks = getAssignedTasks(argv, client, argv.user_id);
      else {
        const user = await selectUser(argv, users);
        const userId = JSON.parse(user).id;
        tasks = getAssignedTasks(argv, client, userId);
      }

      if (argv.select) return await handleResults(selectTicket(tasks));
      return await handleResults(tasks);
    },
  )
  .demandCommand()
  .option("copy-to-clipboard", {
    alias: "c",
    desc: "Send results to clipboard",
    type: "boolean",
  })
  .option("just-id", {
    alias: "j",
    desc: "Return only the ID of the result",
    type: "boolean",
  })
  .help()
  .alias("help", "h")
  .strict()
  .parse();
