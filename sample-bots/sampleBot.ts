import { blBot } from "../blBot/index";
import { Update } from "../blBot/index";
import { InputMediaPhoto } from "../blBot";


const blbot = new blBot("808050001:dbmLxFSLG2Pfy767Fd2M6UcBG6_XGZrjMAE");

blbot.Polling(async (update: Update) => {

    if (update.message?.text) {

        if (update.message.text.split(" ")[0] === "/start") {

            if (update.message.chat?.id && update.message.message_id) {

                await blbot.sendMessage(update.message.chat.id,
                    `Hello my friend
                    `
                    , update.message.message_id
                );


            }
            return;
        }
        // get chat info and return chat title
        if (update.message.text.split(" ")[0] === "/getInfo") {
            if (update?.message?.chat?.id) {
                const res = await blbot.getChat(update.message.chat.id)
                if (res.result?.title) {
                    await blbot.sendMessage(update.message.chat.id, res.result?.title);
                }
            }

        }
        // return two images as media group
        if (update.message.text.split(" ")[0] === "/img") {
            if (update.message.chat?.id && update.message.from?.id) {

                const inputPhotoArray: InputMediaPhoto[] = [{ type: "photo", caption: "images", media: "https://cdn.soft98.ir/K-Lite.jpg" }, { type: "photo", caption: "", media: "https://cdn.soft98.ir/K-Lite.jpg" }];

                await blbot.sendMediaGroup(update.message.chat.id, inputPhotoArray);
            }
            return;
        }
        // echo any messages
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