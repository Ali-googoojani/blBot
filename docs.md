# blBot Library

## Getting Started with `blBot`
This guide is your entry point to building efficient, lightweight bots for Telegram and Bale. We’ll start with the essentials: importing the `blBot` class.

```typescript
import {blBot} from "blBot";
```

After importing `blBot`, create an instance of the `blBot` class.

```typescript
import {blBot} from "blBot";

const bot=new blBot({your_bot_token});
```

> ⚠️ Notice: This tutorial focuses exclusively on the `Polling` method for bot interaction.

Next, call the `Polling` method on your bot instance. This method requires an asynchronous function as an argument.

```typescript
import {blBot} from "blBot";

const bot=new blBot({your_bot_token});

bot.Polling(async(update)=>{

})
```

Inside the asynchronous function you provided to the `Polling` method, you can write your custom bot logic. For instance:

```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    const res = await bot.sendMessage(message.message.chat.id, "Hello");
    console.log(res);
    // The 'res' variable contains either:
    // 1. An object with:
    //    - ok: boolean
    //    - statusCode: number
    //    - statusMessage: string
    //    - result?: Message (a Message object, representing sent message)
    // OR
    // 2. An object with:
    //    - ok: boolean
    //    - statusCode: number
    //    - statusMessage: string
    //    - result?: undefined (no specific result data)
})
```

## Update Types

Every update the bot receives has a type, and we should manage it accordingly. Based on the Message structure, the key fields that indicate the type of update and its content include: `text` for text messages, `animation` for animations, `audio` for audio files, `document` for documents, `photo` for photos, `sticker` for stickers, `video` for videos, `voice` for voice messages, `caption` for captions associated with media, `contact` for shared contacts, `location` for shared locations, `new_chat_members` for new members joining a chat, `left_chat_member` for members leaving a chat, `invoice` for invoices, `successful_payment` for payment `confirmations`, `web_app_data` for data from web apps, and `reply_markup` which often indicates interactive elements like buttons.

So, the `Message` class includes all of these types, and we can handle them accordingly.
> ⚠️ **Notice**: The Update class contains a `Message` object.

```typescript
import { Animation } from "./Animation";
import { Audio } from "./Audio";
import { Chat } from "./Chat";
import { Contact } from "./Contact";
import { InlineKeyboardButton } from "./InlineKeyboardButton";
import { Invoice } from "./Invoice";
import { Location } from "./Location";
import { MessageEntity } from "./MessageEntity";
import { PhotoSize } from "./PhotoSize";
import { Sticker } from "./Sticker";
import { User } from "./User";
import { Video } from "./Video";
import { Voice } from "./Voice";
import { WebAppData } from "./WebAppData";

export class Message {
    public message_id?: number;
    public from?: User;
    public date?: number;
    public chat?: Chat
    public sender_chat?: Chat;
    public forward_from?: User;
    public forward_from_chat?: Chat;
    public forward_from_message_id?: number;
    public forward_date?: number;
    public reply_to_message?: Message;
    public edit_date?: number;
    public media_group_id?: string;
    public text?: string;
    public entities?: Array<MessageEntity>;
    public animation?: Animation;
    public audio?: Audio;
    public document?: Document;
    public photo?: Array<PhotoSize>;
    public sticker?: Sticker;
    public video?: Video;
    public voice?: Voice;
    public caption?: string;
    public caption_entities?: Array<MessageEntity>;
    public contact?: Contact;
    public location?: Location;
    public new_chat_members?: Array<User>;
    public left_chat_member?: User;
    public invoice?: Invoice;
    public successful_payment?: string;
    public web_app_data?: WebAppData;
    public reply_markup?: InlineKeyboardButton;
    constructor(
        message_id: number,
        from: User,
        date: number,
        chat: Chat,
        sender_chat: Chat,
        forward_from: User,
        forward_from_chat: Chat,
        forward_from_message_id: number,
        forward_date: number,
        reply_to_message: Message,
        edit_date: number,
        media_group_id: string,
        text: string,
        entities: Array<MessageEntity>,
        animation: Animation,
        audio: Audio,
        document: Document,
        photo: Array<PhotoSize>,
        sticker: Sticker,
        video: Video,
        voice: Voice,
        caption: string,
        caption_entities: Array<MessageEntity>,
        contact: Contact,
        location: Location,
        new_chat_members: Array<User>,
        left_chat_member: User,
        invoice: Invoice,
        successful_payment: string,
        web_app_data: WebAppData,
        reply_markup: InlineKeyboardButton,


    ) {
        this.message_id = message_id;
        this.from = from;
        this.date = date;
        this.chat = chat;
        this.sender_chat = sender_chat;
        this.forward_from = forward_from;
        this.forward_from_chat = forward_from_chat;
        this.forward_from_message_id = forward_from_message_id;
        this.forward_date = forward_date;
        this.reply_to_message = reply_to_message;
        this.edit_date = edit_date;
        this.media_group_id = media_group_id;
        this.text = text;
        this.entities = entities;
        this.animation = animation;
        this.audio = audio;
        this.document = document;
        this.photo = photo;
        this.sticker = sticker;
        this.video = video;
        this.voice = voice;
        this.caption = caption;
        this.caption_entities = caption_entities;
        this.contact = contact;
        this.location = location;
        this.new_chat_members = new_chat_members;
        this.left_chat_member = left_chat_member;
        this.invoice = invoice;
        this.successful_payment = successful_payment;
        this.web_app_data = web_app_data;
        this.reply_markup = reply_markup;
    }
}
```

We just need to use `Optional Chaining` to know message type.
```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    // if you sent any text message the bot return Hello 
    if(update?.message?.text){
        await bot.sendMessage(message.message.chat.id, "Text");
        console.log("text type");
    }
    else if(update?.message?.photo){
        await bot.sendMessage(message.message.chat.id, "Photo");
        console.log("Photo type");
    }
    .
    .
    .

})
```

If a message includes `reply_markup` and the user interacts with its buttons, you should use `Optional chaining` to safely access the relevant data.

```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    // If the user sends a text message, the bot replies with "Hello"
    if(update?.message?.text){
    const res = await bot.sendMessage(message.message.chat.id, "Hello");
    console.log(res);
    }
    // This section executes if the user presses any InlineKeyboardButtons
    if(update?.callback_query){
        if(update?.callback_query?.data){
            const callback_data=update?.callback_query?.data
            .
            .
            .
        }
    }
    // if user sends a photo this section execute 
    if(update?.message?.photo){
        .
        .
        .
    }

})
```


## Handle Inputs

To handle bot inputs, you can use regular expressions (`regex`). To do so, call the `testRegex` function from `blBot`.

```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    const testResult=await bot.testRegex("\/setname (?<name>.+)", update.message.text);
    if (testResult) {
        await bot.sendMessage(update.message.chat.id, "Ok");
    }
})

```

## Send Media

To send media, `blBot` provides dedicated methods for each media type, including `sendPhoto`, `sendAudio`, `sendDocument`, `sendVideo`, `sendAnimation`, `sendVoice`, `sendMediaGroup`, `sendLocation`, and `sendContact`.

> ℹ️ The `sendAnimation` method is used for sending silent videos, such as GIFs.

```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token});

bot.Polling(async (update) => {
    const isImage=await bot.testRegex("\/newImage", update.message.text);
    const isAudio=await bot.testRegex("\/newAudio", update.message.text);
    const isDocument=await bot.testRegex("\/newDocument", update.message.text);
    const isVideo=await bot.testRegex("\/newVideo", update.message.text);
    const isAnimation=await bot.testRegex("\/newAnimation", update.message.text);
    const isLocation=await bot.testRegex("\/newLocation", update.message.text);
    const isContact=await bot.testRegex("\/newContact", update.message.text);

    if (isImage) {
        
        // The 'file' argument accepts a string (for web content) or an InputFile object (Buffer or ReadStream)
        const file=createReadStream({file_path});
        await bot.sendPhoto(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendPhoto(update.message.chat.id,update.message.from.id,"https://.../");
    }
    else if(isAudio){
        const file=createReadStream({file_path});
        await bot.sendAudio(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendAudio(update.message.chat.id,update.message.from.id,"https://.../");
        
    }
    else if(isDocument){
        const file=createReadStream({file_path});
        await bot.sendDocument(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendDocument(update.message.chat.id,update.message.from.id,"https://.../");
    }
    else if(isVideo){
        const file=createReadStream({file_path});
        await bot.sendVideo(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendVideo(update.message.chat.id,update.message.from.id,"https://.../");
        
    }
   else if(isAnimation){
        const file=createReadStream({file_path});
        // This method is used for sending videos without audio, such as GIFs.
        await bot.sendAnimation(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendAnimation(update.message.chat.id,update.message.from.id,"https://.../");
        
    }
    else if(isVoice){
        const file=createReadStream({file_path});
        await bot.sendVoice(update.message.chat.id,update.message.from.id,file);
        // or
        await bot.sendVoice(update.message.chat.id,update.message.from.id,"https://.../");
        
    }
    else if(isLocation){
        const file=createReadStream({file_path});
        await bot.sendLocation(update.message.chat.id,latitude,longitude);
        
    }
    else if(isContact){
        const file=createReadStream({file_path});
        await bot.sendContact(update.message.chat.id,"+989130000000","Ali");
    }
})
```

All of the methods above work in the same way. However, when sending a group of photos or videos, you should use `sendMediaGroup`, as it works differently from the methods mentioned above.


```typescript
import {
blBot,
InputMediaPhoto,
InputMediaVideo,
InputMediaDocument,
InputMediaAudio,
InputMediaAnimation,
InputMedia} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    const testResult=await bot.testRegex("\/newImage", update.message.text);
    if (testResult) {
        
        // file argument type is string (for content on web) and InputFile(Buffer and ReadStream)
        const file=createReadStream({file_path});
        
        const mediaPhotoArray:InputMediaPhoto[]=[
        { type: "photo", caption: "Photo", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];

        const file=createReadStream({file_path});
        const mediaVideoArray:InputMediaVideo[]=[
        { type: "photo", caption: "Video", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];

        const file=createReadStream({file_path});
        const mediaDocumentArray:InputMediaDocument[]=[
        { type: "photo", caption: "Document", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];

        const file=createReadStream({file_path});
        const mediaAudioArray:InputMediaAudio[]=[
        { type: "photo", caption: "Audio", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];

        const file=createReadStream({file_path});
        const mediaAnimationArray:InputMediaAnimation[]=[
        { type: "photo", caption: "Animation", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];


        const file=createReadStream({file_path});
        const mediaArray:InputMedia[]=[
        { type: "photo", caption: "Media", media: "https://.../" },
        { type: "photo", caption: "", media: file },
        { type: "photo", caption: "", media: "https://.../" }];

        await bot.sendMediaGroup(update.message.chat.id,mediaPhotoArray);
        await bot.sendMediaGroup(update.message.chat.id,mediaVideoArray);
        await bot.sendMediaGroup(update.message.chat.id,mediaDocumentArray);
        await bot.sendMediaGroup(update.message.chat.id,mediaAudioArray);
        await bot.sendMediaGroup(update.message.chat.id,mediaAnimationArray);
        await bot.sendMediaGroup(update.message.chat.id,mediaArray);


    }
})
```

> ⚠️ Notice: You only need to provide content for one `caption` field. Do not fill out all `caption` fields as demonstrated in the examples.

#### InlineKeyboardButton / ReplyKeyboardMarkup

These are interactive buttons that can be attached directly to a message sent by a bot. They are used to enhance user interaction without requiring the user to type free-form text

**Key uses include:**

- **Direct Interaction with Messages:** Instead of typing a response, users can simply tap a button to perform an action or provide a specific input.

- **Sending Structured Data:** For example, in an e-commerce context, inline buttons can be displayed next to a product, offering options like “Add to Cart” or “View Details.”

- **Creating Interactive Menus:** Chatbots can present users with a menu of predefined options (e.g., in a support bot: “Payment Issue,” “Login Problem”). Tapping a button selects the option.

- **Quick Replies:** Users can select from a set of pre-defined answers by tapping a button, which then sends that specific text as a message to the bot.

Inline buttons streamline the user experience by offering clear, tappable choices, making bot interactions more efficient and user-friendly.

##### InlineKeyboard
```typescript
import {blBot,InlineKeyboardButton,InlineKeyBoard} from "blBot";

const bot = new blBot({your_bot_token});

const ADMIN_CHAT_ID="1234567";

bot.Polling(async (update) => {
    if(update?.message){
    const blockButton: InlineKeyboardButton = {
        text: "block 🚫",
        callback_data: `block#${userId}#${messageId}`
    };

    const showInfoButton: InlineKeyboardButton = {
        text: "user infoℹ️",
        callback_data: `show#${userId}#${message?.message?.from?.first_name || "no name"}#${message?.message?.from?.last_name || "no lastname"}#${message?.message?.from?.username || "no username"}`
    };

    const replyButton: InlineKeyboardButton = {
        text: "reply ✍️",
        callback_data: `reply#${userId}#${messageId}`
    };

    const keyboardForAdmin: InlineKeyBoard = {
        inline_keyboard: [[replyButton], [blockButton, showInfoButton]]
    };

    bot.sendMessage(ADMIN_CHAT_ID,update.message?.text,undefined,keyboardForAdmin);

    // This method can be used for all media types, such as sendPhoto, sendVideo, and etc.
    }
}
```
##### ReplyKeyboardMarkup
```typescript
import {blBot, KeyboardButton, ReplyKeyboardMarkup} from "./dist";

const bot = new blBot({your_bot_token});


bot.Polling(async (update) => {
    if(update?.message){
    const blockButton: KeyboardButton = {
     text:"hello world 1"
    };

    const showInfoButton: KeyboardButton = {
      text:"hello world 2"
    };

    const replyButton: KeyboardButton = {
    text:"hello world 3"
    };

    const keyboardForAdmin: ReplyKeyboardMarkup = {
        keyboard: [[replyButton], [blockButton, showInfoButton]]
    };
    if(update?.message?.text && update.message.chat?.id){
    bot.sendMessage(update.message.chat?.id,update.message?.text,undefined,keyboardForAdmin);
    }

    // This method can be used for all media types, such as sendPhoto, sendVideo, and etc.
    }
});
```

## Error Handling

This part is all about what might go wrong when you’re using our library and how to deal with it smoothly. We’ll walk you through the kinds of hiccups you might see, what the error messages will look like, and the best ways to catch and handle them so your application keeps running without a hitch. Think of it as your guide to handling the unexpected!.

```typescript
import {blBot} from "blBot";

const bot = new blBot({your_bot_token})

bot.Polling(async (update) => {
    const testResult=await bot.testRegex("\/setname (?<name>.+)", update.message.text);
    if (testResult) {
        const res=await bot.sendMessage(update.message.chat.id, "Ok");
        if(!res.ok){
            throw new Error(`${res.statusMessage} ${res.statusCode}`)
        }
    }
})
```
In the example above, imagine that `await bot.sendMessage(update.message.chat.id, "Ok");` throws an error.
In this library, all methods return a `Promise` with this type:

`Promise<{ ok: boolean; statusCode: number; statusMessage: string; result?: undefined; } | { ok: boolean; statusCode: number; result: Message[]; statusMessage?: undefined; }>`

You can detect errors by checking `res.ok`:
- If `res.ok` is `true`, the request was successful.
- If `res.ok` is `false`, an error occurred.

> ⚠️ Notice: throwing an error does not stop the bot.
If you want the bot to stop after throwing an error, add `process.exit(0);` after the `throw` statement.