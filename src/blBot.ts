import path from "node:path";
import * as fs from 'fs';
import { InputFile } from "./Entities/InputFile";
import { ReplyKeyboardMarkup } from "./Entities/ReplyKeyboardMarkup";
import { ReplyKeyboardRemove } from "./Entities/ReplyKeyboardRemove";
import { Result } from "./Entities/Result";
import { readUpdateId, saveUpdateId } from "./utils";
import { InputMediaVideo } from "./Entities/InputMediaVideo";
import { InputMediaAudio } from "./Entities/InputMediaAudio";
import { InputMediaDocument } from "./Entities/InputMediaDocument";
import { InputMediaPhoto } from "./Entities/InputMediaPhoto";
import { Update } from "./Entities/Update";
import { InlineKeyBoard } from "./Entities/InlineKeyBoard";
import { ActionType } from "./Entities/Action";




export class blBot {
    private token: string = "";
    public message: Update;
    private updateId: number | undefined = 0;
    constructor(token: string) {
        this.token = `${token}`;
        this.updateId = Number(readUpdateId());

    }
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async Polling(main: () => void) {
        while (true) {
            try {
                const sendRequest = await fetch(`https://tapi.bale.ai/bot${this.token}/getUpdates?offset=${this.updateId}`);
                const responseJson: Result = await sendRequest.json();
                if (responseJson.ok && responseJson.result && responseJson.result.length > 0) {
                    responseJson["result"].forEach((item: Update) => {
                        if (item.update_id != this.updateId) {

                            this.message = item;
                            if (this.updateId) {
                                this.updateId += 1;
                                saveUpdateId(this.updateId.toString());
                            }
                            else {
                                throw new Error("update_id is undifined");
                            }
                            main()
                        }
                    });
                }
            } catch (error) {
                console.log(error)
                throw new Error("can't send request");
            }


            await this.sleep(7000);
        }
    }
    // Test token of bot
    async getMe() {
        try {
            const sendRequest = await fetch(`https://tapi.bale.ai/bot${this.token}/getMe`);
            const responseJson = await sendRequest.json();
            return responseJson;
        }
        catch (error) {
            console.log(error);
        }
    }
    // Send a message via bot to specific chat or user
    async sendMessage(chatId: string | number | undefined, text: string, reply_to_message_id?: number, reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        try {
            const formData = new FormData();
            formData.append("chat_id", `${chatId}`);
            formData.append("text", `${text}`);
            if (reply_to_message_id) {
                formData.append("reply_to_message_id", `${reply_to_message_id}`)
            }
            if (reply_markup) {
                formData.append("reply_markup", `${JSON.stringify(reply_markup)}`)
            }
            console.log(reply_markup);

            const sendRequest = await fetch(`https://tapi.bale.ai/bot${this.token}/sendMessage`, { method: "POST", body: formData });

            const responseJson = await sendRequest.json();
            console.log(responseJson);
        }
        catch (error) {
            console.log(error);
        }

    }

    async forwardMessage(chatId: string | number, from_chat_id: string | number, message_id: number) {
        try {
            const sendRequest = await fetch(`https://tapi.bale.ai/bot${this.token}/forwardMessage?chat_id=${chatId}&from_chat_id=${from_chat_id}&message_id=${message_id}`);

            const responseJson = await sendRequest.json();
            console.log(responseJson);
        }
        catch (error) {
            console.log(error);
        }
    }

    async copyMessage(chatId: string | number, from_chat_id: string | number, message_id: number) {
        try {
            const sendRequest = await fetch(`https://tapi.bale.ai/bot${this.token}/copyMessage?chat_id=${chatId}&from_chat_id=${from_chat_id}&message_id=${message_id}`);

            const responseJson = await sendRequest.json();
            console.log(responseJson);
        }
        catch (error) {
            console.log(error);
        }
    }
    // Send Photo file using string or InputFile
    private async sendContent(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        content: InputFile | string,
        content_type: string,
        caption: string = "",
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove,
        method?: string
    ) {
        try {
            if (!method) {
                throw new Error("the method argument is empty");
            }
            const formData = new FormData();

            formData.append("chat_id", String(chatId));
            formData.append("from_chat_id", String(from_chat_id));
            if (caption) formData.append("caption", caption);

            if (reply_to_message_id && reply_to_message_id > 0) {
                formData.append("reply_to_message_id", String(reply_to_message_id));
            }

            if (reply_markup) {
                formData.append("reply_markup", JSON.stringify(reply_markup));
            }

            // --- حالت‌های مختلف photo ---
            if (typeof content === "string") {
                // file_id یا URL
                formData.append(`${content_type}`, content);
                console.log(`Appending content as string: ${content}`);
            }
            else if (content instanceof fs.ReadStream) {
                // تبدیل ReadStream به Blob
                const chunks: Buffer[] = [];
                for await (const chunk of content) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const blob = new Blob([buffer]);
                const fileName = path.basename(content.path);
                formData.append(`${content_type}`, blob, fileName);
                console.log(`Appending content as stream: ${fileName}`);
            }
            else {
                throw new Error("Invalid type for photo parameter.");
            }

            // --- ارسال ---
            const response = await fetch(`https://tapi.bale.ai/bot${this.token}/${method}`, {
                method: "POST",
                body: formData,
            });

            // --- بررسی پاسخ ---
            const text = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }

            try {
                const json = JSON.parse(text);
                console.log(json);
                return json;
            } catch {
                throw new Error(`Invalid JSON response from server: ${text}`);
            }
        } catch (error) {
            console.error("Error sending content:", error);
            throw error;
        }
    }
    async sendPhoto(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        photo: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, photo, "photo", caption, reply_to_message_id, reply_markup, "sendPhoto");
    }
    async sendAudio(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        Audio: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, Audio, "audio", caption, reply_to_message_id, reply_markup, "sendAudio");
    }

    async sendDocument(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        document: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, document, "document", caption, reply_to_message_id, reply_markup, "sendDocument");
    }

    async sendVideo(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        video: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, video, "video", caption, reply_to_message_id, reply_markup, "sendVideo");
    }
    async sendAnimation(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        animation: InputFile | string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, animation, "animation", "", reply_to_message_id, reply_markup, "sendAnimation");
    }

    async sendVoice(
        chatId: string | number | undefined,
        from_chat_id: string | number | undefined,
        voice: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        await this.sendContent(chatId, from_chat_id, voice, "voice", caption, reply_to_message_id, reply_markup, "sendVoice");
    }

    async sendMediaGroup(
        chatId: string | number | undefined,
        media: Array<InputMediaVideo | InputMediaAudio | InputMediaDocument | InputMediaPhoto>,
        reply_to_message_id?: number
    ) {

        try {

            if (!chatId) {
                throw new Error("chat_id is empty");
            }
            if (!media) {
                throw new Error("media is empty")
            }
            const formData = new FormData();

            formData.append("chat_id", String(chatId));
            formData.append("media", JSON.stringify(media));
            console.log(JSON.stringify(media))
            if (reply_to_message_id) {
                formData.append("reply_to_message_id", String(reply_to_message_id));
            }

            const response = await fetch(`https://tapi.bale.ai/bot${this.token}/sendMediaGroup`, { method: "POST", body: formData });
            const responseJson = await response.text()

            if (response.ok) {
                console.log(responseJson);
                return JSON.stringify(responseJson);
            }
            console.log(responseJson);
            return JSON.stringify(responseJson);
        }
        catch (error) {
            console.log(error)
        }
    }

    async sendLocation(
        chatId: string | number,
        latitude: number,
        longitude: number,
        horizontal_accuracy?: number,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove
    ) {
        try {
            const formData = new FormData();

            formData.append("chat_id", `${chatId}`);
            formData.append("latitude", `${latitude}`);
            formData.append("longitude", `${longitude}`);

            if (horizontal_accuracy !== undefined)
                formData.append("horizontal_accuracy", String(horizontal_accuracy));

            if (reply_to_message_id !== undefined)
                formData.append("reply_to_message_id", String(reply_to_message_id));

            if (reply_markup !== undefined)
                formData.append("reply_markup", JSON.stringify(reply_markup));

            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/sendLocation`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const json = await response.json();
            console.log(json);
            return json;

        } catch (error) {
            console.error(error);
        }
    }

    async sendContact(
        chatId: string | number,
        phone_number: string | number,
        first_name: string,
        last_name?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove
    ) {
        try {
            const formData = new FormData();

            formData.append("chat_id", `${chatId}`);
            formData.append("phone_number", `${phone_number}`);
            formData.append("first_name", `${first_name}`);

            if (last_name !== undefined)
                formData.append("last_name", String(last_name));

            if (reply_to_message_id !== undefined)
                formData.append("reply_to_message_id", String(reply_to_message_id));

            if (reply_markup !== undefined)
                formData.append("reply_markup", JSON.stringify(reply_markup));
            console.log(JSON.stringify(reply_markup))
            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/sendContact`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const json = await response.json();
            console.log(json);
            return json;

        } catch (error) {
            console.error(error);
        }
    }

    async sendChatAction(chatId: string | number, action: ActionType) {
        try {
            const formData = new FormData();
            formData.append("chat_id", `${chatId}`);
            formData.append("action", `${action}`);

            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/sendChatAction`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const json = await response.json();
            console.log(json);
            return json;

        } catch (error) {
            console.error(error);
        }
    }
    /* this method return something like this json

    {"ok":true,"result":{"file_id":"213---1538:782065596---6566275:0:88d---66831f3488","file_unique_id":"213---1538:782065596---6566275:0:88d---66831f3488","file_size":85,"file_path":"213---1538:782065596---6566275:0:88d---66831f3488"}}
    */
    async getFile(file_id: string) {
        try {
            const formData = new FormData();
            formData.append("file_id", `${file_id}`);

            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/getFile`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const json = await response.json();
            console.log(json);
            return json;

        } catch (error) {
            console.error(error);
        }
    }
    //-i think this method does not support by bale 
    async downloadFile(output_path: string, file_path: string) {
        try {
            if (!file_path) {
                throw new Error("the file_path parameter is empty!");
            }

            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/${file_path}`,
            );
            if (!response.ok) {
                throw new Error("something is wrong");
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            fs.writeFileSync(output_path, buffer);

        } catch (error) {
            console.error(error);
        }
    }

    async askReview(user_id: number, delay_seconds: number) {
        try {
            if (!user_id) {
                throw new Error("the user_id parameter is empty!");
            }
            if (!delay_seconds) {
                throw new Error("the user_id parameter is empty!");
            }
            const response = await fetch(
                `https://tapi.bale.ai/bot${this.token}/askReview?user_id=${user_id}&delay_seconds=${delay_seconds}`,
            );
            if (!response.ok) {
                throw new Error("something is wrong");
            }
            const responseJson = await response.json();
            
            return responseJson

        } catch (error) {
            console.error(error);
        }
    }

}

