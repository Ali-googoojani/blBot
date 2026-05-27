import { InlineKeyboardButton } from '../dist';
import { InlineKeyBoard } from '../dist';
import {blBot} from "../dist";
import { Update } from "../dist";
import { addBlock, blockChecker } from './utlis';
import { USERID, BOT_TOKEN } from './botSetting';

const bot = new blBot(BOT_TOKEN);

/**
 * هر پیام کاربر یک رکورد جدا دارد
 * key = `${userId}:${messageId}`
 */
type ThreadState = {
    userId: number;
    messageId: number;
    chatId: number;
    isWaitingForResponse: boolean;
    adminMessageId?: number;
};

const threads = new Map<string, ThreadState>();

/**
 * فقط برای نگه‌داری اینکه ادمین الان می‌خواهد به کدام thread جواب بدهد
 */
let activeReplyTarget: {
    key: string;
    userId: number;
    messageId: number;
    chatId: number;
} | null = null;

function makeKey(userId: number, messageId: number) {
    return `${userId}:${messageId}`;
}

bot.Polling(async (message: Update) => {
    try {
        if (message.message) {
            const chatId = Number(message.message.chat?.id);
            const userId = Number(message.message.from?.id);
            const messageText = message.message.text?.trim();
            const messageId = message.message.message_id;
            // /start
            if (messageText?.startsWith("/start")) {
                const res=await bot.sendMessage(chatId, `سلام خوش آمدید به ربات\nاگر پیامی دارید همینجا بفرستید.`);
                console.log(res.result?.message_id);
                return;
            }

            // پیام‌های ادمین
            if (userId === USERID) {
                if (activeReplyTarget) {
                    const target = activeReplyTarget;

                    // ارسال پاسخ ادمین به کاربر
                    // اگر bot.copyMessage داری و می‌خواهی متن/عکس/فایل کامل کپی شود:
                    const res = await bot.copyMessage(target.userId, chatId, messageId);
                    console.log(res);
                    // علامت‌گذاری thread به عنوان پاسخ‌داده‌شده
                    const state = threads.get(target.key);
                    if (state) {
                        state.isWaitingForResponse = false;
                        threads.set(target.key, state);
                    }

                    await bot.sendMessage(chatId, `✅ پیام شما برای کاربر ${target.userId} ارسال شد.`);

                    // ریست هدف فعال
                    activeReplyTarget = null;
                } else {
                    await bot.sendMessage(chatId, `لطفاً ابتدا روی دکمه "پاسخ" مربوط به یکی از پیام‌ها بزنید.`);
                }
                return;
            }

            // بررسی بلاک بودن کاربر
            const isBlocked = await blockChecker(userId);
            if (isBlocked) {
                await bot.sendMessage(chatId, "شما بلاک شده‌اید.");
                return;
            }

            // ساخت دکمه‌ها برای ادمین
            const blockButton: InlineKeyboardButton = {
                text: "بلاک 🚫",
                callback_data: `block#${userId}#${messageId}`
            };

            const showInfoButton: InlineKeyboardButton = {
                text: "مشخصات کاربر ℹ️",
                callback_data: `show#${userId}#${message?.message?.from?.first_name || "بدون نام"}#${message?.message?.from?.last_name || "بدون نام"}#${message?.message?.from?.username || "بدون یوزرنیم"}`
            };

            const replyButton: InlineKeyboardButton = {
                text: "پاسخ ✍️",
                callback_data: `reply#${userId}#${messageId}`
            };

            const keyboardForAdmin: InlineKeyBoard = {
                inline_keyboard: [[replyButton], [blockButton, showInfoButton]]
            };

            // ارسال پیام کاربر به ادمین
            const forwarded = await bot.sendMessage(
                USERID,
                `📩 پیام جدید از ${message.message.from?.username || userId}:\n\n${messageText || '(بدون متن)'}`,
                undefined,
                keyboardForAdmin
            );

            // ذخیره thread جدا برای همین پیام
            const key = makeKey(userId, messageId);
            threads.set(key, {
                userId,
                messageId,
                chatId,
                isWaitingForResponse: false
            });

            // تایید به کاربر
            await bot.sendMessage(chatId, "✅ پیام شما دریافت شد و برای مدیر ارسال گردید.");
        }

        else if (message.callback_query) {
            const chatId = Number(message.callback_query.message?.chat?.id);
            const adminMessageId = Number(message.callback_query.message?.message_id);
            const data = message.callback_query.data?.split("#") ?? [];
            const callbackType = data[0];
            const originalUserId = Number(data[1]);
            const originalMessageId = Number(data[2]);

            const key = makeKey(originalUserId, originalMessageId);
            const state = threads.get(key);

            if (callbackType === "reply") {
                if (!state) {
                    await bot.sendMessage(chatId, "این پیام دیگر در دسترس نیست.");
                    return;
                }

                state.isWaitingForResponse = true;
                state.adminMessageId = adminMessageId;
                threads.set(key, state);

                activeReplyTarget = {
                    key,
                    userId: originalUserId,
                    messageId: originalMessageId,
                    chatId: state.chatId
                };

                await bot.sendMessage(chatId, `✍️ حالا پیام خود را بنویسید تا برای کاربر ${originalUserId} ارسال شود.`);

                await bot.editMessageText(
                    chatId,
                    adminMessageId,
                    `${message.callback_query.message?.text || ""}\n\n✅ انتخاب شد برای پاسخ`
                );
            }

            else if (callbackType === "block") {
                try {
                    const success = await addBlock(originalUserId);

                    if (success) {
                        await bot.editMessageText(
                            chatId,
                            adminMessageId,
                            `${message.callback_query.message?.text || ""}\n\n✅ کاربر بلاک شد.`
                        );

                        await bot.sendMessage(originalUserId, "شما توسط مدیر بلاک شدید.");
                    } else {
                        await bot.sendMessage(chatId, "خطا در بلاک کردن کاربر.");
                    }
                } catch (error: any) {
                    console.error("Error blocking user:", error);
                    await bot.sendMessage(chatId, "خطا در پردازش درخواست بلاک.");
                }
            }

            else if (callbackType === "show") {
                const firstName = data[2] || "بدون نام";
                const lastName = data[3] || "بدون نام";
                const username = data[4] || "بدون یوزرنیم";

                const userInfo = `
مشخصات کاربر:
نام: ${firstName}
نام خانوادگی: ${lastName}
یوزرنیم: ${username}
آیدی: ${originalUserId}
                `.trim();

                await bot.sendMessage(chatId, userInfo);
            }
        }
    } catch (error: any) {
        console.error("Global Error Handler:", error);

        try {
            if (USERID && error?.message) {
                await bot.sendMessage(USERID, `خطای کلی در ربات رخ داد:\n${error.message}`);
            }
        } catch (e) {
            console.error("Failed to send error notification to USERID:", e);
        }
    }
});
