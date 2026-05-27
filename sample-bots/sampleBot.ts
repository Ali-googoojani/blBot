import { blBot } from "../blBot/index";
import { Update } from "../blBot/index";
import { InputMediaPhoto } from "../blBot";


const blbot = new blBot("808050001:dbmLxFSLG2Pfy767Fd2M6UcBG6_XGZrjMAE");

blbot.Polling(async (message: Update) => {

    if (message.message?.text) {

        if (message.message.text.split(" ")[0] === "/start") {

            if (message.message.chat?.id && message.message.message_id) {

                await blbot.sendMessage(message.message.chat.id,
                    `سلام دوست خوب من!
                    `
                    , message.message.message_id
                );
                
                const res = await blbot.getChat(message.message.chat.id)

                console.log(res.result?.title);
            }
            return;
        }
        if (message.message.text.split(" ")[0] === "/getInfo") {
            if (message.message.chat) {
                const res = await blbot.getChat(message.message.chat.id);
            }

        }

        if (message.message.text.split(" ")[0] === "/img") {
            if (message.message.chat?.id && message.message.from?.id) {

                const inputPhotoArray: InputMediaPhoto[] = [{ type: "photo", caption: "helloi", media: "https://cdn.soft98.ir/K-Lite.jpg" }, { type: "photo", caption: "helloi", media: "https://cdn.soft98.ir/K-Lite.jpg" }];

                const res = await blbot.sendMediaGroup(message.message.chat.id, inputPhotoArray);
                console.log({ message: res.statusMessage, status: res.statusCode });
            }
            return;
        }
        if (message.message.chat?.id && message.message.message_id) {
            await blbot.sendMessage(message.message.chat.id,
                `${message.message.text}
                    `
                , message.message.message_id
            )
            return;
        }
    }
})