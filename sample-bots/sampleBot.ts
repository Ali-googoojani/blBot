import { blBot } from "../blBot/index";
import { Update } from "../blBot/index";
import { InputMediaPhoto } from "../blBot";


const blbot = new blBot("808050001:dbmLxFSLG2Pfy767Fd2M6UcBG6_XGZrjMAE");

blbot.Polling(async (update: Update) => {

    if (update.message?.text) {

        if (update.message.text.split(" ")[0] === "/start") {

            if (update.message.chat?.id && update.message.message_id) {

                await blbot.sendMessage(update.message.chat.id,
                    `سلام دوست خوب من!
                    `
                    , update.message.message_id
                );


            }
            return;
        }
        if (update.message.text.split(" ")[0] === "/getInfo") {
            if (update?.message?.chat?.id) {
                const res = await blbot.getChat(update.message.chat.id)
                if (res.result?.title) {
                    await blbot.sendMessage(update.message.chat.id, res.result?.title);
                }
            }

        }

        if (update.message.text.split(" ")[0] === "/img") {
            if (update.message.chat?.id && update.message.from?.id) {

                const inputPhotoArray: InputMediaPhoto[] = [{ type: "photo", caption: "helloi", media: "https://cdn.soft98.ir/K-Lite.jpg" }, { type: "photo", caption: "", media: "https://cdn.soft98.ir/K-Lite.jpg" }];

                const res = await blbot.sendMediaGroup(update.message.chat.id, inputPhotoArray);
                console.log({ message: res.statusMessage, status: res.statusCode });
            }
            return;
        }
        if (update.message.chat?.id && update.message.message_id) {
            await blbot.sendMessage(update.message.chat.id,
                `${update.message.text}
                    `
                , update.message.message_id
            )
            return;
        }
    }
})