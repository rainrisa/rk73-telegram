import { Context, NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";

async function alreadyJoinChat(
  ctx: NarrowedContext<Context, MountMap["text"]>,
  chatId: number
) {
  const { status } = await ctx.telegram.getChatMember(
    chatId,
    ctx.message.from.id
  );
  return (
    status === "administrator" ||
    status === "creator" ||
    status === "member" ||
    status === "restricted"
  );
}

export default alreadyJoinChat;
