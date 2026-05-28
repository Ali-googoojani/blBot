import { InlineKeyboardButton } from '../../blBot';
import { InlineKeyBoard } from '../../blBot';
import { blBot } from "../../blBot";
import { Update } from "../../blBot";
import { addBlock, blockChecker } from './utlis';
import { ADMIN_USER_ID, BOT_TOKEN } from './botSetting';

const bot = new blBot(BOT_TOKEN);

/**
 * Each user message has a separate record.
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
 * Only to keep track of which thread the admin currently wants to reply to.
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
                const res = await bot.sendMessage(chatId, `Hello, welcome to the bot\nIf you have a message, send it here.`);
                console.log(res.result?.message_id);
                return;
            }

            // Admin's Messages
            if (userId === ADMIN_USER_ID) {
                if (activeReplyTarget) {
                    const target = activeReplyTarget;

                    // Send the admin's reply to the user
                    // If you have bot.copyMessage and want to copy the full text/photo/file:
                    if (messageId) {
                        const res = await bot.copyMessage(target.userId, chatId, messageId);
                        console.log(res);
                    }
                    // Mark the thread as replied to.
                    const state = threads.get(target.key);
                    if (state) {
                        state.isWaitingForResponse = false;
                        threads.set(target.key, state);
                    }

                    await bot.sendMessage(chatId, `✅ Your message has been sent to user ${target.userId}.`);

                    // Reset active goal
                    activeReplyTarget = null;
                } else {
                    await bot.sendMessage(chatId, `Please click the "Reply" button on one of the messages first.`);
                }
                return;
            }

            // Check if the user is blocked
            const isBlocked = await blockChecker(userId);
            if (isBlocked) {
                await bot.sendMessage(chatId, "You have been blocked.");
                return;
            }

            // Create buttons for the admin
            const blockButton: InlineKeyboardButton = {
                text: "Block 🚫",
                callback_data: `block#${userId}#${messageId}`
            };

            const showInfoButton: InlineKeyboardButton = {
                text: "User info ℹ️",
                callback_data: `show#${userId}#${message?.message?.from?.frist_name || "no name"}#${message?.message?.from?.last_name || "no lastname"}#${message?.message?.from?.username || "no username"}`
            };

            const replyButton: InlineKeyboardButton = {
                text: "Reply ✍️",
                callback_data: `reply#${userId}#${messageId}`
            };

            const keyboardForAdmin: InlineKeyBoard = {
                inline_keyboard: [[replyButton], [blockButton, showInfoButton]]
            };

            // Send the user's message to the admin
            const forwarded = await bot.sendMessage(
                ADMIN_USER_ID,
                `📩 New Message From:${message.message.from?.username || userId}:\n\n${messageText || '(no text'}`,
                undefined,
                keyboardForAdmin
            );
            if (messageId) {
                // Save a separate thread for this message
                const key = makeKey(userId, messageId);
                threads.set(key, {
                    userId,
                    messageId,
                    chatId,
                    isWaitingForResponse: false
                });
            }
            // Confirm to the user
            await bot.sendMessage(chatId, "✅ Your message has been received and sent to the administrator.");
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
                    await bot.sendMessage(chatId, "This message is no longer available.");
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

                await bot.sendMessage(chatId, `✍️ Write your message ${originalUserId} `);

                await bot.editMessageText(
                    chatId,
                    adminMessageId,
                    `${message.callback_query.message?.text || ""}\n\n✅ selected`
                );
            }

            else if (callbackType === "block") {
                try {
                    const success = await addBlock(originalUserId);

                    if (success) {
                        await bot.editMessageText(
                            chatId,
                            adminMessageId,
                            `${message.callback_query.message?.text || ""}\n\n✅ Blocked`
                        );

                        await bot.sendMessage(originalUserId, "You are blocked");
                    } else {
                        await bot.sendMessage(chatId, "Can't block try again");
                    }
                } catch (error: any) {
                    console.error("Error blocking user:", error);
                    await bot.sendMessage(chatId, "error at blocking");
                }
            }

            else if (callbackType === "show") {
                const firstName = data[2] || "no name";
                const lastName = data[3] || "no lastname";
                const username = data[4] || "no username";

                const userInfo = `
User info:
name: ${firstName}
lastname: ${lastName}
username: ${username}
user_id: ${originalUserId}
                `.trim();

                await bot.sendMessage(chatId, userInfo);
            }
        }
    } catch (error: any) {
        console.error("Global Error Handler:", error);

        try {
            if (ADMIN_USER_ID && error?.message) {
                await bot.sendMessage(ADMIN_USER_ID, `an error occur:\n${error.message}`);
            }
        } catch (e) {
            console.error("Failed to send error notification to USERID:", e);
        }
    }
});
