import { readFileSync, writeFileSync } from "fs";
import select from "@inquirer/select";

const convertUserToOption = (user) => ({
  name: user.displayName,
  value: JSON.stringify(user),
  description: user.email,
});

export const selectUser = async (users, props) => {
  const rawUser = await select({
    message: "Select a user!",
    choices: users.map(convertUserToOption),
  });

  writeFileSync(".selected-user", rawUser);

  if (!props.p || (props.p && props.p.includes("a"))) return rawUser;
  else {
    const user = JSON.parse(rawUser);
    const obj = {};

    if (props.includes("i")) obj.id = user.id;
    if (props.includes("e")) obj.email = user.email;
    if (props.includes("n")) obj.name = user.displayName;

    return JSON.stringify(obj, null, 2);
  }
};

export const convertTicketToOption = (ticket) => ({
  name: ticket.number,
  value: JSON.stringify(ticket),
  description: ticket.title,
});

export const getLastSelectedUser = () =>
  JSON.parse(readFileSync(".selected-user")).id;

export const selectTicket = async (tickets, props) => {
  const rawTicket = await select({
    message: "Select a ticket!",
    choices: tickets.map(convertTicketToOption),
  });

  writeFileSync(".selected-ticket", rawTicket);
  return rawTicket;
};

export const getLastSelectedTicket = () =>
  JSON.parse(readFileSync(".selected-ticket"));
