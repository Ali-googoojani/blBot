import path from "node:path";
import * as fs from 'fs';
import { InputFile } from "./Entities/InputFile";
import { ReplyKeyboardMarkup } from "./Entities/ReplyKeyboardMarkup";
import { ReplyKeyboardRemove } from "./Entities/ReplyKeyboardRemove";
import { Result } from "./Entities/Result";
import { InputMediaVideo } from "./Entities/InputMediaVideo";
import { InputMediaAudio } from "./Entities/InputMediaAudio";
import { InputMediaDocument } from "./Entities/InputMediaDocument";
import { InputMediaPhoto } from "./Entities/InputMediaPhoto";
import { Update } from "./Entities/Update";
import { InlineKeyBoard } from "./Entities/InlineKeyBoard";
import { ActionType } from "./Entities/Action";
import { ChatFullInfo } from "./Entities/ChatFullInfo";
import { ChatMember } from "./Entities/ChatMember";
import { InlineKeyboardButton } from "./Entities/InlineKeyboardButton";
import { InputSticker } from "./Entities/InputSticker";
import { BaseUrl } from "./Entities/BaseUrl";
import { WebhookInfo } from "./Entities/WebhookInfo";




class blBot {
    private token: string = "";
    public baseUrl: BaseUrl = "tapi.bale.ai"
    private updateId: number = 0;
    private conCurrency = 5;
    private running = 0;
    private queue: Update[] = [];
    constructor(token: string) {
        this.token = `${token}`;

    }
    private sleep(ms: number): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
    async enqueue(update: Update, main: (message: Update) => Promise<void>) {
        this.queue.push(update);
        this.pump(main);
    }

    private async pump(main: (message: Update) => Promise<void>) {

        while (this.running <= this.conCurrency && this.queue.length > 0) {
            const item = this.queue.shift()!;
            this.running++;

            Promise.resolve()
                .then(() => main(item))
                .catch((err) => console.error("main error:", err))
                .finally(() => {
                    this.running--;
                    this.pump(main);
                });
        }

    }

    async Polling(main: (message: Update) => Promise<void>) {
        if (!this.updateId) this.updateId = 0;

        while (true) {
            console.log("last updateId:", this.updateId);

            try {
                const res = await fetch(
                    `https://${this.baseUrl}/bot${this.token}/getUpdates?offset=${this.updateId}&timeout=10`
                );

                const json: Result = await res.json();

                if (json.ok && Array.isArray(json.result)) {
                    for (const item of json.result) {
                        this.updateId = item.update_id + 1;

                        await this.enqueue(item as Update, main);
                    }
                }
            } catch (error: any) {
                console.error("Polling error:", error);
            }

            await this.sleep(5000);
        }
    }

    // ----------------------->BOT SECTION START FROM HERE<-----------------------
    async setWebhook(url: string) {
        if (!url) {
            throw new Error("the url is empty!");
        }
        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/setWebhook?url=${url}`)

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async deleteWebhook() {

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/deleteWebhook`)
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    async getWebhookInfo() {

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/getWebhookInfo`)
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson: WebhookInfo = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async testRegex(regex: string, text: string): Promise<Record<string, any>> {
        try {
            const regExp = new RegExp(regex);
            const match = regExp.test(text);
            return { ok: true, result: `${match}` }
        } catch (error: any) {
            throw new Error(`an error occur:${error.message}`);
        }
    }
    // Test token of bot
    async getMe() {
        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/getMe`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    // Send a message via bot to specific chat or user
    async sendMessage(chat_id: string | number, text: string, reply_to_message_id?: number, reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!text) {
            throw new Error("the chat_id is empty!");
        }

        try {
            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("text", `${text}`);
            if (reply_to_message_id) {
                formData.append("reply_to_message_id", `${reply_to_message_id}`)
            }
            if (reply_markup) {
                formData.append("reply_markup", `${JSON.stringify(reply_markup)}`)
            }

            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/sendMessage`,
                {
                    method: "POST",
                    body: formData
                });
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }

        }
        catch (error: any) {
            throw new Error(`{ ok: false, message: ${error.message} }`);

        }

    }

    async forwardMessage(chat_id: string | number, from_chat_id: string | number, message_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!from_chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the chat_id is empty!");
        }
        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/forwardMessage?chat_id=${chat_id}&from_chat_id=${from_chat_id}&message_id=${message_id}`);
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }
        }
        catch (error: any) {
            throw new Error(`{ ok: false, message: ${error.message} }`);
        }
    }

    async copyMessage(chat_id: string | number, from_chat_id: string | number, message_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!from_chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the chat_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/copyMessage?chat_id=${chat_id}&from_chat_id=${from_chat_id}&message_id=${message_id}`);
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }
        }
        catch (error: any) {

            return { ok: false, message: `${error.message}` }
        }
    }
    // Send Photo file using string or InputFile
    private async sendContent(
        chat_id: string | number,
        from_chat_id: string | number,
        content: InputFile | string,
        content_type: string,
        caption: string = "",
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove,
        method?: string
    ) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!from_chat_id) {
            throw new Error("the from_chat_id is empty!");
        }
        if (!content) {
            throw new Error("the content is empty!");
        }
        if (!content_type) {
            throw new Error("the content_type is empty!");
        }
        if (!method) {
            throw new Error("the method is empty");
        }
        try {
            const formData = new FormData();

            formData.append("chat_id", String(chat_id));
            formData.append("from_chat_id", String(from_chat_id));
            if (caption) formData.append("caption", caption);

            if (reply_to_message_id && reply_to_message_id > 0) {
                formData.append("reply_to_message_id", String(reply_to_message_id));
            }

            if (reply_markup) {
                formData.append("reply_markup", JSON.stringify(reply_markup));
            }


            if (typeof content === "string") {

                formData.append(`${content_type}`, content);
                console.log(`Appending content as string: ${content}`);
            }
            else if (content instanceof fs.ReadStream) {

                const chunks: Buffer[] = [];
                for await (const chunk of content) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const blob = new Blob([buffer]);
                const fileName = path.basename(content.path.toString());
                formData.append(`${content_type}`, blob, fileName);
                console.log(`Appending content as stream: ${fileName}`);
            }
            else {
                throw new Error(`Invalid type for content parameter.`);
            }


            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/${method}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            try {
                const responseJson = await response.json();
                return { ok: true, status: response.status, result: `${responseJson}` }
            } catch {

                throw new Error(`Invalid JSON response from server`);
            }
        } catch (error: any) {
            throw new Error(`an error occur ${error.message}`);
        }
    }
    async sendPhoto(
        chat_id: string | number,
        from_chat_id: string | number,
        photo: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, photo, "photo", caption, reply_to_message_id, reply_markup, "sendPhoto");
        return res;
    }
    async sendAudio(
        chat_id: string | number,
        from_chat_id: string | number,
        Audio: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, Audio, "audio", caption, reply_to_message_id, reply_markup, "sendAudio");
        return res
    }

    async sendDocument(
        chat_id: string | number,
        from_chat_id: string | number,
        document: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, document, "document", caption, reply_to_message_id, reply_markup, "sendDocument");
        return res;
    }

    async sendVideo(
        chat_id: string | number,
        from_chat_id: string | number,
        video: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, video, "video", caption, reply_to_message_id, reply_markup, "sendVideo");
        return res;
    }
    async sendAnimation(
        chat_id: string | number,
        from_chat_id: string | number,
        animation: InputFile | string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, animation, "animation", "", reply_to_message_id, reply_markup, "sendAnimation");
        return res;
    }

    async sendVoice(
        chat_id: string | number,
        from_chat_id: string | number,
        voice: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        const res = await this.sendContent(chat_id, from_chat_id, voice, "voice", caption, reply_to_message_id, reply_markup, "sendVoice");
        return res;
    }

    async sendMediaGroup(
        chat_id: string | number,
        media: Array<InputMediaVideo | InputMediaAudio | InputMediaDocument | InputMediaPhoto>,
        reply_to_message_id?: number
    ) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!media) {
            throw new Error("the media is empty!");
        }
        try {
            const formData = new FormData();

            formData.append("chat_id", String(chat_id));
            formData.append("media", JSON.stringify(media));
            console.log(JSON.stringify(media));
            if (reply_to_message_id) {
                formData.append("reply_to_message_id", String(reply_to_message_id));
            }

            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/sendMediaGroup`, { method: "POST", body: formData });


            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();
            return { ok: true, status: response.status, result: responseJson }
        }
        catch (error: any) {
            throw new Error(`an error occur:${error.message}`);
        }
    }

    async sendLocation(
        chat_id: string | number,
        latitude: number,
        longitude: number,
        horizontal_accuracy?: number,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove
    ) {
        if (chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (latitude) {
            throw new Error("the latitude is empty!");
        }
        if (longitude) {
            throw new Error("the longitude is empty!");
        }
        try {
            const formData = new FormData();

            formData.append("chat_id", `${chat_id}`);
            formData.append("latitude", `${latitude}`);
            formData.append("longitude", `${longitude}`);

            if (horizontal_accuracy !== undefined)
                formData.append("horizontal_accuracy", String(horizontal_accuracy));

            if (reply_to_message_id !== undefined)
                formData.append("reply_to_message_id", String(reply_to_message_id));

            if (reply_markup !== undefined)
                formData.append("reply_markup", JSON.stringify(reply_markup));

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/sendLocation`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                throw new Error(`{ ok: false, status: ${response.status}, message: ${response.statusText} }`);
            }

            const responseJson = await response.json();
            return { ok: true, status: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async sendContact(
        chat_id: string | number,
        phone_number: string | number,
        first_name: string,
        last_name?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove
    ) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!phone_number) {
            throw new Error("the phone_number is empty!");
        }
        if (!first_name) {
            throw new Error("the first_name is empty!");
        }
        try {
            const formData = new FormData();

            formData.append("chat_id", `${chat_id}`);
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
                `https://${this.baseUrl}/bot${this.token}/sendContact`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                return {
                    ok: false, status: `${response.status}`, message: `${response.statusText}`
                };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async sendChatAction(chat_id: string | number, action: ActionType) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!action) {
            throw new Error("the action is empty!");
        }
        try {
            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("action", `${action}`);

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/sendChatAction`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                return {
                    ok: false, status: `${response.status}`, message: `${response.statusText}`
                };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message} `);
        }
    }

    /* this method return something like this

    {"ok":true,"result":{"file_id":"213---1538:782065596---6566275:0:88d---66831f3488","file_unique_id":"213---1538:782065596---6566275:0:88d---66831f3488","file_size":85,"file_path":"213---1538:782065596---6566275:0:88d---66831f3488"}}
    */
    async getFile(file_id: string) {
        if (!file_id) {
            throw new Error("the file_id is empty!");
        }
        try {

            const formData = new FormData();
            formData.append("file_id", `${file_id}`);

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/getFile`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();
            return { ok: true, status: response.status, result: `${responseJson}` }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    //-i think this method does not support by bale 
    async downloadFile(output_path: string, file_path: string) {
        if (!file_path) {
            throw new Error("the file_path is empty!");
        }
        if (!output_path) {
            throw new Error("the output_path is empty!");
        }
        try {


            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/${file_path}`
            );

            if (!response.ok) {
                return { ok: false, status: response.status, message: response.statusText };
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            fs.writeFileSync(output_path, buffer);

            return {
                ok: true,
                status: response.status,
                message: "file downloaded successfully",
                path: output_path
            };

        } catch (error: any) {
            return { ok: false, status: 500, message: `an error occurred: ${error.message}` };
        }
    }

    async askReview(user_id: number, delay_seconds: number) {
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        if (!delay_seconds) {
            throw new Error("the delay_seconds is empty!");
        }
        try {
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/askReview?user_id=${user_id}&delay_seconds=${delay_seconds}`,
            );
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: `${responseJson}` }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async banChatMember(chat_id: string | number, user_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        try {
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/banChatMember?chat_id=${user_id}&user_id=${user_id}`,
            );
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }


    async unbanChatMember(chat_id: string | number, user_id: number, only_if_banned: boolean) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        if (!only_if_banned) {
            throw new Error("the only_if_banned is empty!");
        }
        try {
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/unbanChatMember?chat_id=${chat_id}&user_id=${user_id}&only_if_banned=${only_if_banned}`,
            );
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: `${responseJson}` }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }


    async promoteChatMember(chat_id: string | number, user_id: number, can_change_info?: boolean, can_post_messages?: boolean, can_edit_messages?: boolean, can_delete_messages?: boolean, can_manage_video_chats?: boolean, can_invite_users?: boolean, can_restrict_members?: boolean) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        try {
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/promoteChatMember?chat_id=${chat_id}&user_id=${user_id}&can_change_info=${can_change_info}&can_post_messages=${can_post_messages}&can_edit_messages=${can_edit_messages}&can_delete_messages=${can_delete_messages}&can_manage_video_chats=${can_manage_video_chats}&can_invite_users=${can_invite_users}&can_restrict_members=${can_restrict_members}`,
            )

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    async setChatPhoto(chat_id: string | number, photo: InputFile) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!photo) {
            throw new Error("the photo is empty!");
        }
        try {
            const formData = new FormData();

            formData.append("chat_id", `${chat_id}`);
            if (photo instanceof fs.ReadStream) {
                const chunks: Buffer[] = [];
                for await (const chunk of photo) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const blob = new Blob([buffer]);
                const fileName = path.basename(photo.path.toString());
                formData.append(`photo`, blob, fileName);
                console.log(`Appending content as stream: ${fileName}`);

            }
            const response = await fetch(`https://${this.baseUrl}/${this.token}/setChatPhoto`,
                {
                    method: "POST",
                    body: formData
                });
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    async FunctionsWithChatIdOnly(chat_id: string | number, type: string) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/${type}?chat_id=${chat_id}`);
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }


    async leaveChat(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "leaveChat");
        return res;
    }

    async getChat(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChat");
        if (res?.ok) {
            return {
                ok: true,
                status: res.status,
                result: res.result as ChatFullInfo
            };
        }

        return {
            ok: false,
            status: res.status ?? null,
            message: res.message ?? "Unknown error"
        }

    }



    async getChatAdministrators(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChatAdministrators");
        if (res.ok) {
            return {
                ok: true,
                status: res.status ?? null,
                result: res.result.result as ChatMember[]
            };
        }

        return {
            ok: false,
            status: res.status ?? null,
            message: res.message ?? "Unknown error"
        };
    }

    async getChatMembersCount(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChatMembersCount");
        if (res?.ok) {
            return {
                ok: true,
                status: res.status ?? null,
                result: res.result
            };
        }

        return {
            ok: false,
            status: res.status ?? null,
            message: res.message ?? "Unknown error"
        };
    }

    async getChatMember(chat_id: string | number, user_id: string | number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/getChatMember?chat_id=${chat_id}&user_id=${user_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson: ChatMember = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    async pinChatMessage(chat_id: string | number, message_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the message_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/pinChatMessage?chat_id=${chat_id}&message_id=${message_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    async unPinChatMessage(chat_id: string | number, message_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the message_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/unPinChatMessage?chat_id=${chat_id}&message_id=${message_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    async unpinAllChatMessages(chat_id: string | number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/unpinAllChatMessages?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    async setChatTitle(chat_id: string | number, title: string) {

        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!title) {
            throw new Error("the title is empty!");
        }



        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/setChatTitle?chat_id=${chat_id}&title=${title}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }


    async deleteChatPhoto(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/deleteChatPhoto?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    async createChatInviteLink(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/createChatInviteLink?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }


    async revokeChatInviteLink(chat_id: string | number, invite_link: string) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/revokeChatInviteLink?chat_id=${chat_id}&invite_link=${invite_link}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    async exportChatInviteLink(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/exportChatInviteLink?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    async editMessageText(
        chat_id: string | number,
        message_id: number,
        text: string) {
        try {
            if (!chat_id) {
                throw new Error("the chat_id is empty!");
            }
            if (!message_id) {
                throw new Error("the message_id is empty!");
            }
            if (!text) {
                throw new Error("the text is empty!");
            }
            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("message_id", `${message_id}`);
            formData.append("text", `${text}`);

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/editMessageText`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    async editMessageCaption(
        chat_id: string | number,
        message_id: number,
        caption?: string,
        reply_markup?: InlineKeyboardButton) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the message_id is empty!");
        }

        try {

            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("message_id", `${message_id}`);
            if (caption) {
                formData.append("caption", `${caption}`);
            }
            if (reply_markup) {
                formData.append("caption", `${JSON.stringify(reply_markup)}`);
            }

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/editMessageText`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    async deleteMessage(
        chat_id: string | number,
        message_id: number,
    ) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the message_id is empty!");
        }

        try {

            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("message_id", `${message_id}`);

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/deleteMessage`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    async editMessageReplyMarkup(
        chat_id: string | number,
        message_id: number,
        reply_markup: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        try {
            if (!chat_id) {
                throw new Error("the chat_id is empty!");
            }
            if (!message_id) {
                throw new Error("the user_id is empty!");
            }
            if (!reply_markup) {
                throw new Error("the reply_markup is empty!");
            }
            const formData = new FormData();
            formData.append("chat_id", `${chat_id}`);
            formData.append("message_id", `${message_id}`);
            formData.append("reply_markup", `${JSON.stringify(reply_markup)}`);
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/editMessageReplyMarkup`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {

                return {
                    ok: false, status: `${response.status}`, message: `${response.statusText}`
                };
            }
            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    async uploadStickerFile(user_id: string | number, sticker: InputFile) {
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        if (!sticker) {
            throw new Error("the sticker is empty!");
        }
        try {
            const formData = new FormData();

            formData.append("user_id", `${user_id}`);
            if (sticker instanceof fs.ReadStream) {
                const chunks: Buffer[] = [];
                for await (const chunk of sticker) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const blob = new Blob([buffer]);
                const fileName = path.basename(sticker.path.toString());
                formData.append(`sticker`, blob, fileName);
                console.log(`Appending content as stream: ${fileName}`);

            }
            const response = await fetch(`https://${this.baseUrl}/${this.token}/uploadStickerFile`,
                {
                    method: "POST",
                    body: formData
                });
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }


    async createNewStickerSet(user_id: string | number, name: string, title: string, sticker: InputSticker[]) {

        if (!user_id) {
            throw new Error("the user_id is empty!");
        }

        if (!name) {
            throw new Error("the name is empty!");
        }

        if (!title) {
            throw new Error("the title is empty!");
        }

        if (!sticker) {
            throw new Error("the sticker is empty!");
        }

        try {
            const formData = new FormData();

            formData.append("user_id", `${user_id}`);
            formData.append("name", `${name}`);
            formData.append("title", `${title}`);
            formData.append("sticker", `${JSON.stringify(sticker)}`);

            const response = await fetch(`https://${this.baseUrl}/${this.token}/createNewStickerSet`,
                {
                    method: "POST",
                    body: formData
                });
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }


    async addStickerToSet(user_id: string | number, name: string, sticker: InputSticker[]) {

        if (!user_id) {
            throw new Error("the user_id is empty!");
        }

        if (!name) {
            throw new Error("the name is empty!");
        }


        if (!sticker) {
            throw new Error("the sticker is empty!");
        }

        try {
            const formData = new FormData();

            formData.append("user_id", `${user_id}`);
            formData.append("name", `${name}`);
            formData.append("sticker", `${JSON.stringify(sticker)}`);
            const response = await fetch(`https://${this.baseUrl}/${this.token}/addStickerToSet`,
                {
                    method: "POST",
                    body: formData
                });
            if (!response.ok) {
                return { ok: false, status: `${response.status}`, message: `${response.statusText}` };
            }

            const responseJson = await response.json();

            return { ok: true, status: response.status, result: responseJson };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }




    // ----------------------->WALLET SECTION START FROM HERE<-----------------------

    /**
  * This method is currently under maintenance and is not functional.
  * It will be re-enabled or updated soon.
  *
  * @returns {Promise<null>} A Promise that resolves to `null` as a placeholder.
  */
    async sendInvoice() {

        return null;
    }
    /**
 * This method is currently under maintenance and is not functional.
 * It will be re-enabled or updated soon.
 *
 * @returns {Promise<null>} A Promise that resolves to `null` as a placeholder.
 */
    async createInvoiceLink() {
        return null;
    }
    /**
 * This method is currently under maintenance and is not functional.
 * It will be re-enabled or updated soon.
 *
 * @returns {Promise<null>} A Promise that resolves to `null` as a placeholder.
 */
    async answerPreCheckoutQuery() {
        return null
    }
    /**
 * This method is currently under maintenance and is not functional.
 * It will be re-enabled or updated soon.
 *
 * @returns {Promise<null>} A Promise that resolves to `null` as a placeholder.
 */
    async inquireTransaction() {
        return null
    }
}


export default blBot;