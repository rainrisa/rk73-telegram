import { deunionize, Scenes, session, Telegraf } from "telegraf";
import axios from "axios";
import { AccountInfo, RemoteUploadResponse } from "./types/dstream.js";
import { ResponseVid } from "./types/mdb.js";
import { MyContext } from "./types/rk73.js";
import getInviteLink from "./functions/getInviteLink.js";
import forceSubReply from "./functions/forceSubReply.js";
import alreadyJoinChat from "./functions/alreadyJoinChat.js";
import sendVidLink from "./functions/sendVidLink.js";
import autopostch from "./functions/autopostch.js";
import "dotenv/config";

if (!process.env.BOT_TOKEN) {
  console.log("Please provide BOT_TOKEN");
  process.exit();
}
if (!process.env.DSTREAM_API_KEY) {
  console.log("Please provide DSTREAM_API_KEY");
  process.exit();
}
if (!process.env.SERVER_URL) {
  console.log("Please provide SERVER_URL");
  process.exit();
}
if (!process.env.ADMINS) {
  console.log("Please provide at least one ADMIN");
  process.exit();
}

const ADMINS = process.env.ADMINS.split(" ").map((x) => +x);
const DSTREAM_API_KEY = process.env.DSTREAM_API_KEY;
const SERVER_URL = process.env.SERVER_URL;
const CHANNEL_ID = Number(process.env.CHANNEL_ID);
const GROUP_ID = Number(process.env.GROUP_ID);

let START_TIME: number;

const createVidScene = new Scenes.WizardScene<MyContext>(
  "create-vid-scene",
  async (ctx) => {
    await ctx.reply("Send the video you want to posted");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = deunionize(ctx.message);

    if (message && message.video) {
      if (message.video.file_size && message.video.file_size < 20000000) {
        ctx.scene.session.vidHash = message.video.file_id;
        await ctx.reply("Now input the name of the video");
        return ctx.wizard.next();
      } else {
        ctx.reply("File is too large");
      }
    } else ctx.reply("Please provide the right vid");
  },
  async (ctx) => {
    const message = deunionize(ctx.message);

    if (message && message.text) {
      ctx.scene.session.vidName = message.text;
      await ctx.reply("Send the image preview of the vid");
      return ctx.wizard.next();
    } else ctx.reply("Please provide the right name");
  },
  async (ctx) => {
    const message = deunionize(ctx.message);
    const vidImage = message?.photo?.at(-1);

    const waitingMessage = await ctx.reply("<code>Generate vid link..</code>", {
      parse_mode: "HTML",
    });

    if (message && message.photo && vidImage !== undefined) {
      const telegramVidLink = await app.telegram.getFileLink(
        ctx.scene.session.vidHash
      );
      const response = await axios.get(
        `https://doodapi.com/api/upload/url?key=${DSTREAM_API_KEY}&url=${telegramVidLink}&new_title=${ctx.scene.session.vidName}`
      );
      const remoteUploadResponse: RemoteUploadResponse = response.data;
      const vidName = ctx.scene.session.vidName;
      const vidHash = ctx.scene.session.vidHash;
      const vidLink = `https://dood.pm/d/${remoteUploadResponse.result.filecode}`;

      const saveDataIntoDatabase = await axios.post(`${SERVER_URL}/vids`, {
        name: vidName,
        image: vidImage.file_id,
        hash: vidHash,
        link: vidLink,
      });
      const responseVid: ResponseVid = saveDataIntoDatabase.data;
      await autopostch(ctx, responseVid);

      await app.telegram.deleteMessage(
        waitingMessage.chat.id,
        waitingMessage.message_id
      );
      await ctx.reply(
        `<strong>ID:</strong> <code>${responseVid.id}</code>\n<strong>Name:</strong> <code>${responseVid.name}</code>\n<strong>Link:</strong> ${responseVid.link}`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
      return ctx.scene.leave();
    } else {
      await app.telegram.deleteMessage(
        waitingMessage.chat.id,
        waitingMessage.message_id
      );
      ctx.reply("Please provide the right picture");
    }
  }
);

const app = new Telegraf<MyContext>(process.env.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([createVidScene]);

app.use(session());
app.use(stage.middleware());

app.start(async (ctx) => {
  if (ctx.startPayload) {
    const waitingMessage = await ctx.reply("<code>Terminal Running</code>", {
      parse_mode: "HTML",
    });

    if (ADMINS.includes(ctx.message.from.id)) {
      await sendVidLink(ctx);
    } else if (CHANNEL_ID && GROUP_ID) {
      const groupInviteLink = await getInviteLink(app, GROUP_ID);
      const channelInviteLink = await getInviteLink(app, CHANNEL_ID);

      const alreadyJoinChannel = await alreadyJoinChat(ctx, CHANNEL_ID);
      const alreadyJoinGroup = await alreadyJoinChat(ctx, GROUP_ID);

      if (!alreadyJoinChannel && !alreadyJoinGroup) {
        await forceSubReply(ctx, groupInviteLink, channelInviteLink);
      } else if (!alreadyJoinChannel && alreadyJoinGroup) {
        await forceSubReply(ctx, undefined, channelInviteLink);
      } else if (alreadyJoinChannel && !alreadyJoinGroup) {
        await forceSubReply(ctx, groupInviteLink, undefined);
      } else {
        await sendVidLink(ctx);
      }
    } else if (CHANNEL_ID && !GROUP_ID) {
      const channelInviteLink = await getInviteLink(app, CHANNEL_ID);
      const alreadyJoinChannel = await alreadyJoinChat(ctx, CHANNEL_ID);

      if (!alreadyJoinChannel) {
        await forceSubReply(ctx, undefined, channelInviteLink);
      } else {
        await sendVidLink(ctx);
      }
    } else if (!CHANNEL_ID && GROUP_ID) {
      const groupInviteLink = await getInviteLink(app, GROUP_ID);
      const alreadyJoinGroup = await alreadyJoinChat(ctx, GROUP_ID);

      if (!alreadyJoinGroup) {
        await forceSubReply(ctx, groupInviteLink, undefined);
      } else {
        await sendVidLink(ctx);
      }
    } else {
      await sendVidLink(ctx);
    }
    await app.telegram.deleteMessage(
      waitingMessage.chat.id,
      waitingMessage.message_id
    );
  }
  try {
    await axios.post(`${SERVER_URL}/users/${ctx.message.from.id}`);
  } catch (err) {}
});
app.command("/createvid", (ctx) => {
  if (ADMINS.includes(ctx.message.from.id)) ctx.scene.enter("create-vid-scene");
  else ctx.reply("Maaf, fitur ini hanya untuk admin");
});
app.command("/uptime", async (ctx) => {
  let uptimeTotal = Math.abs(+new Date() - START_TIME) / 1000;
  const uptimeHours = Math.floor(uptimeTotal / 3600);
  uptimeTotal -= uptimeHours * 3600;
  const uptimeMinutes = Math.floor(uptimeTotal / 60) % 60;
  uptimeTotal -= uptimeMinutes * 60;
  const uptimeSeconds = (uptimeTotal % 60).toFixed();

  if (uptimeHours !== 0 && uptimeMinutes !== 0)
    await ctx.reply(`${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`);
  else if (uptimeHours === 0 && uptimeMinutes !== 0)
    await ctx.reply(`${uptimeMinutes}m ${uptimeSeconds}s`);
  else await ctx.reply(`${uptimeSeconds}s`);
});

app.launch().then(async () => {
  START_TIME = +new Date();

  const response = await axios.get(
    `https://doodapi.com/api/account/info?key=${DSTREAM_API_KEY}`
  );
  const dstream: AccountInfo = response.data;
  const me = await app.telegram.getMe();
  console.log(`Successfully login to dstream as ${dstream.result.email}`);
  console.log(`App running as @${me.username}`);
});

process.once("SIGINT", () => app.stop("SIGINT"));
process.once("SIGTERM", () => app.stop("SIGTERM"));
