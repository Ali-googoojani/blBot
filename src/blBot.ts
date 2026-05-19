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
import { Message } from "./Entities/Message";
import { User } from "./Entities/User";
import { File } from "./Entities/File";


/**
 * Bale Bot Client
 * 
 * A lightweight client for interacting with Bale Bot API.
 * Supports polling, webhook management, and basic messaging.
 */
class blBot {
    /** Bot access token */
    private token: string = "";
    /** Base API URL (default: tapi.bale.ai but supports api.telegram.org too) */
    public baseUrl: BaseUrl = "tapi.bale.ai"
    /** Last processed update ID */
    private updateId: number = 0;
    /** Maximum concurrent handlers */
    private conCurrency = 100;
    /** Number of currently running handlers */
    private running = 0;
    /** Internal update queue */
    private queue: Update[] = [];


    /**
         * Create new Bale bot instance.
         * @param token - Bot access token provided by @BotFather
    */
    constructor(token: string) {
        this.token = token;

    }

    /**
        * Sleep helper utility.
        * Used internally for polling delay.
        * 
        * @param ms - Duration in milliseconds
    */
    private sleep(ms: number): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    /**
        * Adds an update to internal processing queue.
        * 
        * @param update - Incoming update object
        * @param main - Main update handler function
    */
    async enqueue(update: Update, main: (message: Update) => Promise<void>) {
        this.queue.push(update);
        this.pump(main);
    }

    /**
         * Internal queue processor.
         * Controls concurrency and executes update handlers.
         * 
         * @param main - Main update handler
    */
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

    /**
         * Starts long polling to receive updates.
         * 
         * This method continuously requests updates from Bale servers.
         * Suitable for bots hosted on servers without webhook support.
         * 
         * @param main - Async handler function for processing each update
    */
    async Polling(main: (message: Update) => Promise<void>, limit: number = 100, timeout: number = 15) {
        if (!this.updateId) this.updateId = 0;

        while (true) {
            // console.log("last updateId:", this.updateId);

            try {
                const res = await fetch(
                    `https://${this.baseUrl}/bot${this.token}/getUpdates?offset=${this.updateId}&limit=${limit}&timeout=${timeout}`
                );

                const json: Result = await res.json();

                if (json.ok && Array.isArray(json.result) && json.result.length) {
                    for (const item of json.result) {
                        this.updateId = item.update_id + 1;

                        await this.enqueue(item as Update, main);
                    }
                }
            } catch (error: any) {
                console.error("Polling error:", error);
            }

            await this.sleep(2000);
        }
    }

    // ----------------------->BOT SECTION START FROM HERE<-----------------------

    /**
        * Sets webhook URL for receiving updates.
        * 
        * @param url - Public HTTPS endpoint
        * @returns API response object
    */
    async setWebhook(url: string) {
        if (!url) {
            throw new Error("the url is empty!");
        }
        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/setWebhook?url=${url}`)

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Deletes currently configured webhook.
         * 
         * @returns API response object
     */
    async deleteWebhook() {

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/deleteWebhook`)
            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Retrieves webhook status and metadata.
         * 
         * @returns Webhook information object
     */
    async getWebhookInfo() {

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/getWebhookInfo`)
            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as WebhookInfo }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
        * Tests a regular expression against given text.
        * 
        * Useful for validating user input or command patterns.
        * 
        * @param regex - Regular expression pattern
        * @param text - Text to test against
    */
    async testRegex(regex: string, text: string): Promise<Record<string, any>> {
        try {
            const regExp = new RegExp(regex);
            const match = regExp.test(text);
            return { ok: true, result: `${match}` }
        } catch (error: any) {
            throw new Error(`an error occur:${error.message}`);
        }
    }

    /**
        * Verifies bot token and retrieves bot profile info.
        * 
        * @returns Bot information object
    */
    async getMe() {
        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/getMe`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as User }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Sends text message to a specific chat.
         * 
         * @param chat_id - Target chat ID or username
         * @param text - Message content
         * @param reply_to_message_id - Optional reply message ID
         * @param reply_markup - Optional keyboard markup
         * 
         * @returns API response object
   */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message }

        }
        catch (error: any) {
            throw new Error(`{ ok: false, message: ${error.message} }`);

        }

    }


    /**
         * Forwards a message from one chat to another.
         *
         * This method wraps the Bale Telegram-like API `forwardMessage`.
         *
         * @param chat_id - The unique identifier for the target chat (where to forward).
         * @param from_chat_id - The unique identifier for the source chat (where the message is).
         * @param message_id - The message identifier inside the source chat.
         * @returns A Promise resolving to an API response object.
         * @throws {Error} If required parameters are missing or a network/processing error occurs.
    */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message }
        }
        catch (error: any) {
            throw new Error(`{ ok: false, message: ${error.message} }`);
        }
    }

    /**
         * Copies a message from one chat to another.
         *
         * This method wraps the Bale Telegram-like API `copyMessage`.
         *
         * @param chat_id - The unique identifier for the target chat.
         * @param from_chat_id - The unique identifier for the source chat.
         * @param message_id - The message identifier inside the source chat.
         * @returns A Promise resolving to an API response object.
         * @throws {Error} If required parameters are missing or a network/processing error occurs.
     */
    async copyMessage(chat_id: string | number, from_chat_id: string | number, message_id: number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!from_chat_id) {
            throw new Error("the from_chat_id is empty!");
        }
        if (!message_id) {
            throw new Error("the message_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/copyMessage?chat_id=${chat_id}&from_chat_id=${from_chat_id}&message_id=${message_id}`);
            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message }
        }
        catch (error: any) {

            return { ok: false, message: `${error.message}` }
        }
    }
    /**
         * Internal helper to send media/content with optional caption, reply, and keyboard markup.
         *
         * This method is designed to be used by higher-level send methods (sendPhoto, sendDocument, sendVideo, ...).
         * It supports:
         * - content as `string` (usually a URL or base64-like string depending on API expectations)
         * - content as `InputFile` (e.g., fs.ReadStream)
         *
         * @param chat_id - Target chat id/username.
         * @param from_chat_id - Source chat id/username (required by your API style / wrapper design).
         * @param content - The content to send. Either a string or an InputFile (e.g., fs.ReadStream).
         * @param content_type - API field name for the content (e.g., "photo", "document", etc.).
         * @param caption - Optional caption.
         * @param reply_to_message_id - Optional message id to reply to.
         * @param reply_markup - Optional keyboard markup to attach to the message.
         * @param method - The API method name to call (e.g., "sendPhoto").
         * @returns A Promise resolving to an API response object.
         * @throws {Error} If required parameters are missing, method is empty, or content type is invalid.
    */
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
                body: formData
            });

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            try {
                const responseJson = await response.json();
                return { ok: true, statusCode: response.status, result: responseJson.result as Message }
            } catch {

                throw new Error(`Invalid JSON response from server`);
            }
        } catch (error: any) {
            throw new Error(`an error occur ${error.message}`);
        }
    }

    /**
         * Sends a photo to a specified chat.
         * Wraps the private `sendContent` method for sending photos.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param photo - The photo to send. Can be a file path (string) or an InputFile object (e.g., fs.ReadStream).
         * @param caption - Optional caption for the photo.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendPhoto(
        chat_id: string | number,
        from_chat_id: string | number,
        photo: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'photo' as the content type.
        const res = await this.sendContent(chat_id, from_chat_id, photo, "photo", caption, reply_to_message_id, reply_markup, "sendPhoto");
        return res
    }

    /**
         * Sends audio files to a specified chat.
         * Wraps the private `sendContent` method for sending audio.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param Audio - The audio file to send. Can be a file path (string) or an InputFile object.
         * @param caption - Optional caption for the audio.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendAudio(
        chat_id: string | number,
        from_chat_id: string | number,
        Audio: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'audio' as the content type.
        const res = await this.sendContent(chat_id, from_chat_id, Audio, "audio", caption, reply_to_message_id, reply_markup, "sendAudio");
        return res
    }

    /**
         * Sends documents to a specified chat.
         * Wraps the private `sendContent` method for sending documents.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param document - The document file to send. Can be a file path (string) or an InputFile object.
         * @param caption - Optional caption for the document.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendDocument(
        chat_id: string | number,
        from_chat_id: string | number,
        document: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'document' as the content type.
        const res = await this.sendContent(chat_id, from_chat_id, document, "document", caption, reply_to_message_id, reply_markup, "sendDocument");
        return res;
    }

    /**
         * Sends video files to a specified chat.
         * Wraps the private `sendContent` method for sending videos.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param video - The video file to send. Can be a file path (string) or an InputFile object.
         * @param caption - Optional caption for the video.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendVideo(
        chat_id: string | number,
        from_chat_id: string | number,
        video: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'video' as the content type.
        const res = await this.sendContent(chat_id, from_chat_id, video, "video", caption, reply_to_message_id, reply_markup, "sendVideo");
        return res;
    }

    /**
         * Sends animations (e.g., GIF files) to a specified chat.
         * Wraps the private `sendContent` method for sending animations.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param animation - The animation file to send. Can be a file path (string) or an InputFile object.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendAnimation(
        chat_id: string | number,
        from_chat_id: string | number,
        animation: InputFile | string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'animation' as the content type.
        // Caption is optional and defaults to empty string if not provided.
        const res = await this.sendContent(chat_id, from_chat_id, animation, "animation", "", reply_to_message_id, reply_markup, "sendAnimation");
        return res;
    }


    /**
         * Sends voice messages to a specified chat.
         * Wraps the private `sendContent` method for sending voice messages.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param from_chat_id - The unique identifier for the source chat (used internally by sendContent).
         * @param voice - The voice file to send. Can be a file path (string) or an InputFile object.
         * @param caption - Optional caption for the voice message.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendVoice(
        chat_id: string | number,
        from_chat_id: string | number,
        voice: InputFile | string,
        caption?: string,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove) {
        // Use the internal sendContent method, specifying 'voice' as the content type.
        const res = await this.sendContent(chat_id, from_chat_id, voice, "voice", caption, reply_to_message_id, reply_markup, "sendVoice");
        return res;
    }


    /**
         * Sends a group of photos and videos to a specified chat.
         * This method handles the formatting of the media array as required by the API.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param media - An array of media objects (InputMediaVideo, InputMediaAudio, InputMediaDocument, InputMediaPhoto).
         * @param reply_to_message_id - Optional message ID to reply to.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
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

            const response = await fetch(`https://${this.baseUrl}/bot${this.token}/sendMediaGroup`, {
                method: "POST",
                body: formData
            });


            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message[] }
        }
        catch (error: any) {
            throw new Error(`an error occur:${error.message}`);
        }
    }


    /**
         * Sends a location to a specified chat.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param latitude - Latitude of the location in degrees.
         * @param longitude - Longitude of the location in degrees.
         * @param horizontal_accuracy - Optional. The radius of uncertainty for the location, measured in meters.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async sendLocation(
        chat_id: string | number,
        latitude: number,
        longitude: number,
        horizontal_accuracy?: number,
        reply_to_message_id?: number,
        reply_markup?: InlineKeyBoard | ReplyKeyboardMarkup | ReplyKeyboardRemove
    ) {
        // Corrected validation: throw error if values are missing, not if they exist.
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }

            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    /**
         * Sends contact information to a specified chat.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param phone_number - The contact's phone number.
         * @param first_name - The contact's first name.
         * @param last_name - Optional. The contact's last name.
         * @param reply_to_message_id - Optional message ID to reply to.
         * @param reply_markup - Optional custom keyboard markup.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
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

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/sendContact`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as Message }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    /**
         * Sends a chat action to a specified chat.
         * This can be used to inform the user that the bot is typing, recording audio, etc.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param action - The type of action to broadcast. See {@link ActionType} for possible values.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
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
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message} `);
        }
    }
    /**
         * Retrieves information about a file.
         *
         * @param file_id - The identifier for the file.
         * @returns A Promise resolving to an API response object containing file information, or throws an error.
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as File }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Downloads a file from a given file path and saves it to the specified output path.
         * This method assumes a Node.js environment with `fs` and `Buffer` available.
         *
         * @param output_path - The local path where the file should be saved.
         * @param file_path - The path to the file on the server (obtained from `getFile` method).
         * @returns A Promise resolving to an object indicating success or failure, including the saved path on success, or throws an error.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
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

    async answerCallbackQuery(callback_query_id: string, text?: string, show_alert?: boolean) {
        if (!callback_query_id) {
            throw new Error("the callback_query_id is empty!");
        }
        try {

            const formData = new FormData();
            formData.append("file_id", callback_query_id);
            if (text) {
                formData.append("text", text);
            }
            if (show_alert) {
                formData.append("show_alert", `${show_alert}`);
            }
            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/answerCallbackQuery`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) {
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    /**
         * Sends a review request to a user after a specified delay.
         *
         * @param user_id - The unique identifier for the target user.
         * @param delay_seconds - The delay in seconds before sending the review request.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }
    /**
         * Bans a member from a chat.
         * Note: The method signature in the provided code has a potential issue where `chat_id` is passed
         * to `user_id` parameter of fetch, and `user_id` is passed to `chat_id` parameter of fetch.
         * This JSDoc assumes the intention is to ban `user_id` from `chat_id`.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param user_id - The unique identifier of the user to be banned.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Unbans a previously banned member from a chat.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param user_id - The unique identifier of the user to be unbanned.
         * @param only_if_banned - Pass True, if the user is already not in the chat.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Promotes a member of a chat to be an administrator.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param user_id - The unique identifier of the user to be promoted.
         * @param can_change_info - Pass True, if the member can change chat title, photo and other settings.
         * @param can_post_messages - Pass True, if the member can send text messages, photos and other types of opinions.
         * @param can_edit_messages - Pass True, if the member can edit messages sent by other users.
         * @param can_delete_messages - Pass True, if the member can delete messages sent by other users.
         * @param can_manage_video_chats - Pass True, if the member can start and manage video chats.
         * @param can_invite_users - Pass True, if the member can invite new users to the chat.
         * @param can_restrict_members - Pass True, if the member can restrict, ban or unban chat members.
         * @returns A Promise resolving to an API response object, or throws an error.
     */
    async promoteChatMember(chat_id: string | number, user_id: number, can_change_info?: boolean, can_post_messages?: boolean, can_edit_messages?: boolean, can_delete_messages?: boolean, can_manage_video_chats?: boolean, can_invite_users?: boolean, can_restrict_members?: boolean) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        try {
            // Constructing the URL with optional parameters.
            // Boolean values are automatically converted to strings 'true'/'false' by template literals.
            const queryParams = [
                `chat_id=${chat_id}`,
                `user_id=${user_id}`,
                can_change_info !== undefined ? `can_change_info=${can_change_info}` : null,
                can_post_messages !== undefined ? `can_post_messages=${can_post_messages}` : null,
                can_edit_messages !== undefined ? `can_edit_messages=${can_edit_messages}` : null,
                can_delete_messages !== undefined ? `can_delete_messages=${can_delete_messages}` : null,
                can_manage_video_chats !== undefined ? `can_manage_video_chats=${can_manage_video_chats}` : null,
                can_invite_users !== undefined ? `can_invite_users=${can_invite_users}` : null,
                can_restrict_members !== undefined ? `can_restrict_members=${can_restrict_members}` : null,
            ].filter(Boolean).join('&'); // Filter out nulls and join with '&'

            const response = await fetch(
                `https://${this.baseUrl}/bot${this.token}/promoteChatMember?${queryParams}`
            );

            if (!response.ok) {
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Sets a new profile photo for a chat.
         * Requires Node.js environment for `fs`, `Buffer`, `Blob`, `path`, and `FormData`.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param photo - The photo to upload. Can be a file path (string) or an InputFile object (e.g., fs.ReadStream).
         * @returns A Promise resolving to an API response object, or throws an error.
    */
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
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }

    async setChatDescription(chat_id: string | number, description: string) {

        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        if (!description) {
            throw new Error("the description is empty!");
        }



        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/setChatDescription?chat_id=${chat_id}&description=${description}`);

            if (!response.ok) {
                return {
                    ok: true, statusCode: response.status,statusMessage:response.statusText
                };
            }
            const responseJson = await response.json();
            return { ok: true, statusCode: response.status, result: responseJson.result as boolean }

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * A helper method to execute API calls that only require a chat_id.
         * This is used internally by methods like leaveChat, getChat, etc.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @param type - The specific API method to call (e.g., "leaveChat", "getChat").
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    private async FunctionsWithChatIdOnly(chat_id: string | number, type: string) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/${type}?chat_id=${chat_id}`);
            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    /**
         * Leaves a specified chat.
         * Uses the internal `FunctionsWithChatIdOnly` helper method.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @returns A Promise resolving to an API response object, or throws an error.
    */
    async leaveChat(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "leaveChat");
        if (res.ok) {
            return { ok: true, status: res.statusCode, result: res.result as Boolean };
        }


        return { ok: false, status: res.statusCode, message: res.statusMessage };

    }
    /**
         * Gets information about a specific chat.
         * Uses the internal `FunctionsWithChatIdOnly` helper method.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @returns A Promise resolving to a ChatFullInfo object on success, or an error object on failure.
    */
    async getChat(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChat");
        if (res?.ok) {
            return {
                ok: true,
                status: res.statusCode,
                result: res.result as ChatFullInfo
            };
        }

        return {
            ok: false,
            status: res.statusCode ?? null,
            message: res.statusMessage ?? "Unknown error"
        }

    }


    /**
         * Gets a list of administrators in a specific chat.
         * Uses the internal `FunctionsWithChatIdOnly` helper method.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @returns A Promise resolving to an array of ChatMember objects (administrators) on success, or an error object on failure.
     */
    async getChatAdministrators(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChatAdministrators");
        if (res.ok) {
            return {
                ok: true,
                status: res.statusCode ?? null,
                result: res.result.result as ChatMember[]
            };
        }

        return {
            ok: false,
            status: res.statusCode ?? null,
            message: res.statusMessage ?? "Unknown error"
        };
    }
    /**
         * Gets the total number of members in a specific chat.
         * Uses the internal `FunctionsWithChatIdOnly` helper method.
         *
         * @param chat_id - The unique identifier for the target chat or username.
         * @returns A Promise resolving to the member count (number) on success, or an error object on failure.
     */
    async getChatMembersCount(chat_id: string | number) {
        const res = await this.FunctionsWithChatIdOnly(chat_id, "getChatMembersCount");
        if (res?.ok) {
            return {
                ok: true,
                status: res.statusCode ?? null,
                result: res.result as Number
            };
        }

        return {
            ok: false,
            status: res.statusMessage ?? null,
            message: res.statusMessage ?? "Unknown error"
        };
    }
    /**
         * Use this method to get a recent information about a chat member.
         * On success, returns a ChatMember object.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param user_id - Unique identifier of the target user.
         * @returns A Promise resolving to a ChatMember object on success, or an error object on failure.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as ChatMember };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Pins a message in a chat. Requires administration privileges.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of a message to be pinned.
         * @param disable_notification - Optional. Send `True` if the message should be pinned without a notification.
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
    */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as Boolean };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Unpins a specific message in a chat. Requires administration privileges.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of a message to be unpinned.
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Unpins all messages in a chat. Requires administration privileges.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
     */
    async unpinAllChatMessages(chat_id: string | number) {
        if (!chat_id) {
            throw new Error("the chat_id is empty!");
        }

        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/unpinAllChatMessages?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Edits the name of a chat. Limits:
         * - Private chats: the title can be changed by any chat member.
         * - Basic groups: only the `all_members` can change the title.
         * - Supergroups and channels: only the `creator` or `administrators` with `can_change_info` permission can change the title.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param title - New chat title, 1-128 characters.
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    /**
         * Deletes a chat photo. Requires administration privileges.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
     */
    async deleteChatPhoto(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/deleteChatPhoto?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Creates an invite link for a chat. Requires administrator privileges.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param expire_date - Optional. Point in time (Unix timestamp) when the link will expire.
         * @param member_limit - Optional. Maximum number of users that can be used by the link.
         * @param creates_join_request - Optional. True, if users joining via the link should be presented in a join request.
         * @returns A Promise resolving to an InviteLink object on success, or an error object on failure.
     */
    async createChatInviteLink(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/createChatInviteLink?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as Map<string, string | number> };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    /**
         * Revokes an invite link created by the chat administrator.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param invite_link - The invite link to revoke.
         * @returns A Promise resolving to an InviteLink object on success, or an error object on failure.
     */
    async revokeChatInviteLink(chat_id: string | number, invite_link: string) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/revokeChatInviteLink?chat_id=${chat_id}&invite_link=${invite_link}`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as Map<string, string | number> };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Exports an invite link for a previously created chat.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @returns A Promise resolving to a string (the invite link) on success, or an error object on failure.
     */
    async exportChatInviteLink(chat_id: string | number) {
        try {
            const response = await fetch(`https://${this.baseUrl}/${this.token}/exportChatInviteLink?chat_id=${chat_id}`);

            if (!response.ok) {
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as Map<string, string | number> };

        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }
    /**
         * Edits text of messages. On success, returns the edited Message.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of the message to be edited.
         * @param text - New text of the message.
         * @param reply_markup - Optional. Inline keyboard attached to the message.
         * @param parse_mode - Optional. Send "MarkdownV2" or "HTML" if you want Telegram to format the message.
         * @param disable_web_page_preview - Optional. Disables link previews for links in this message.
         * @returns A Promise resolving to the edited Message object on success, or an error object on failure.
    */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }

    /**
         * Edits the caption of messages. On success, returns the edited Message.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of the message to be edited.
         * @param caption - New caption of the message, 0-1024 characters.
         * @param reply_markup - Optional. Inline keyboard attached to the message.
         * @param parse_mode - Optional. Send "MarkdownV2" or "HTML" if you want Telegram to format the caption.
         * @returns A Promise resolving to the edited Message object on success, or an error object on failure.
    */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    /**
         * Deletes a message.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of the message to delete.
         * @returns A Promise resolving to an API response object on success, or an error object on failure.
    */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }

    }
    /**
         * Edits only the reply markup of messages.
         * Other editable fields of the message are not changed.
         *
         * @param chat_id - Unique identifier for the target chat or username of the target channel (in the format @channelusername).
         * @param message_id - Identifier of the message to edit.
         * @param reply_markup - A JSON-serialized object for an inline keyboard.
         * @returns A Promise resolving to the edited Message object on success, or an error object on failure.
    */
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

            return { ok: true, statusCode: response.status, result: responseJson }

        } catch (error: any) {
            throw new Error(`an error occur: ${error.message}`);
        }
    }

    /**
         * Uploads a sticker file to be used in a sticker set.
         * Requires a user to be in the Telegram Premium subscription to upload stickers.
         *
         * @param user_id - Unique identifier of the user that uploaded the sticker.
         * @param sticker - File to upload. The file can be sent either as a URL or as a file/multipart form-data.
         * @returns A Promise resolving to a File object on success, or an error object on failure.
    */
    async uploadStickerFile(user_id: string | number, sticker: InputFile) {
        if (!user_id) {
            throw new Error("the user_id is empty!");
        }
        if (!sticker) {
            throw new Error("the sticker is empty!");
        }
        try {
            const formData = new FormData()


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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as File };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    /**
         * Creates a new sticker set for a user.
         *
         * @param user_id - User identifier for whom the sticker set is to be created.
         * @param name - Sticker set name. Set name, must end with substring `_by_<bot_username>`. Can contain only ASCII letters, digits and underscores.
         * @param title - Sticker set title. Length between 1 and 64 characters.
         * @param sticker - A `InputSticker` object with the sticker.
         * @param stickers_emoji_list - List of 1-20 emoji corresponding to the sticker.
         * @param needs_repainting_the_sticker_set - Pass `True` if the sticker set requires a custom emoji sticker.
         * @returns A Promise resolving to `True` on success, or an error object on failure.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };
        }
        catch (error: any) {
            throw new Error(`an error occur: ${error.message}`)
        }
    }

    /**
         * Adds a new sticker to a set created by the user.
         *
         * @param user_id - User identifier of owner of the set.
         * @param name - Sticker set name.
         * @param sticker - A `InputSticker` object with the sticker.
         * @param stickers_emoji_list - List of 1-20 emoji corresponding to the sticker.
         * @returns A Promise resolving to `True` on success, or an error object on failure.
     */
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
                return { ok: false, statusCode: response.status, statusMessage: response.statusText };
            }

            const responseJson = await response.json();

            return { ok: true, statusCode: response.status, result: responseJson.result as boolean };
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