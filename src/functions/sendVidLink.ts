import axios from "axios";
import { NarrowedContext } from "telegraf";
import { MountMap } from "telegraf/typings/telegram-types";
import { ContextStartPayload } from "../types/rk73.js";
import { ResponseVid } from "./../types/mdb.js";

async function sendVidLink(
  ctx: NarrowedContext<ContextStartPayload, MountMap["text"]>
) {
  const { data }: { data: ResponseVid } = await axios.get(
    `${process.env.SERVER_URL}/vids/${ctx.startPayload}`
  );
  if (data) {
    await axios.post(
      `${process.env.SERVER_URL}/vids/${ctx.startPayload}/click`
    );
    await ctx.reply(data.link);
  } else await ctx.reply("Vid tidak ditemukan");
}

export default sendVidLink;
