import { ResponseVid } from "../types/mdb.js";
import { MyContext } from "../types/rk73.js";

async function autopostch(ctx: MyContext, responseVid: ResponseVid) {
  await ctx.telegram.sendPhoto(
    Number(process.env.CHANNEL_ID),
    responseVid.image,
    {
      caption: `<strong>Nama:</strong> <code>${responseVid.name}.mp4</code>\n\n<strong>Link Download:</strong> <a href="https://t.me/${ctx.botInfo.username}?start=${responseVid.id}">Klik Disini</a>`,
      parse_mode: "HTML",
    }
  );
}

export default autopostch;
