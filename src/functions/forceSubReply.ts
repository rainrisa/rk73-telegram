import { NarrowedContext, Markup } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { ContextStartPayload } from "../types/rk73.js";

async function forceSubReply(
  ctx: NarrowedContext<ContextStartPayload, MountMap["text"]>,
  groupInviteLink: string | undefined,
  channelInviteLink: string | undefined
) {
  const replyMessage = `Hello ${ctx.message.from.first_name}\n\nAnda harus bergabung di Channel/Grup dibawah untuk menggunakan saya\n\nSilakan Join Terlebih Dahulu`;
  const groupIcon = "💠 Join Grup";
  const channelIcon = "🔰 Join Channel";
  const tryAgainIcon = "🥤 Try Again";
  const tryAgainLink = `https://t.me/${ctx.botInfo.username}?start=${ctx.startPayload}`;

  if (groupInviteLink && channelInviteLink) {
    await ctx.reply(replyMessage, {
      ...Markup.inlineKeyboard([
        [
          Markup.button.url(groupIcon, groupInviteLink),
          Markup.button.url(channelIcon, channelInviteLink),
        ],
        [Markup.button.url(tryAgainIcon, tryAgainLink)],
      ]),
    });
  }
  if (groupInviteLink && !channelInviteLink) {
    await ctx.reply(replyMessage, {
      ...Markup.inlineKeyboard([
        [Markup.button.url(groupIcon, groupInviteLink)],
        [Markup.button.url(tryAgainIcon, tryAgainLink)],
      ]),
    });
  }
  if (!groupInviteLink && channelInviteLink) {
    await ctx.reply(replyMessage, {
      ...Markup.inlineKeyboard([
        [Markup.button.url(channelIcon, channelInviteLink)],
        [Markup.button.url(tryAgainIcon, tryAgainLink)],
      ]),
    });
  }
}

export default forceSubReply;
