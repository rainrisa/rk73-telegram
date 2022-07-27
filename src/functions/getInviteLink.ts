import { deunionize, Telegraf } from "telegraf";
import { MyContext } from "../types/rk73.js";

async function getInviteLink(app: Telegraf<MyContext>, chatId: number) {
  const chat = await app.telegram.getChat(chatId);
  const inviteLink = deunionize(chat).invite_link;

  if (inviteLink) return inviteLink;
  else return await app.telegram.exportChatInviteLink(chatId);
}

export default getInviteLink;
