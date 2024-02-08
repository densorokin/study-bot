const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");
require("dotenv").config();
const { getRandomQuestion, getCorrectAnswer, getImage } = require("./utils");

const bot = new Bot(process.env.BOT_API_KEY);

bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard()
    .text("HTML")
    .text("CSS")
    .row()
    .text("JavaScript")
    .text("React")
    .row()
    .text("Random question")
    .text("Hebrew")
    .resized();

  await ctx.reply("Hello!");

  await ctx.reply("Choose the topic", {
    reply_markup: startKeyboard,
  });
});

bot.hears(
  ["HTML", "CSS", "JavaScript", "React", "Random question", "Hebrew"],
  async (ctx) => {
    const topic = ctx.message.text.toLowerCase();
    const { question, questionTopic } = getRandomQuestion(topic);
    let inlineKeyboard;

    if (question.hasOptions) {
      const buttonRows = question.options.map((option) => [
        InlineKeyboard.text(
          option.text,
          JSON.stringify({
            questionId: question.id,
            type: `${questionTopic}-option`,
            isCorrect: option.isCorrect,
          })
        ),
      ]);

      inlineKeyboard = InlineKeyboard.from(buttonRows);
    } else {
      inlineKeyboard = new InlineKeyboard().text(
        "To know the answer",
        JSON.stringify({ questionId: question.id, type: questionTopic })
      );
    }

    if (question.img) {
      const buttonRows = [
        [
          InlineKeyboard.text(
            "Image hint",
            JSON.stringify({
              questionId: question.id,
              type: questionTopic,
              btnName: "hint",
            })
          ),
        ],
        [
          InlineKeyboard.text(
            "To know the answer",
            JSON.stringify({ questionId: question.id, type: questionTopic })
          ),
        ],
      ];

      inlineKeyboard = InlineKeyboard.from(buttonRows);
    }

    await ctx.reply(question.text, {
      reply_markup: inlineKeyboard,
    });
  }
);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);
  const { questionId, type, btnName } = callbackData;
  if (!callbackData.type.includes("option")) {
    const answer = getCorrectAnswer(questionId, type);

    if (btnName === "hint") {
      const image = getImage(questionId, type);
      await ctx.replyWithPhoto(image);
      await ctx.answerCallbackQuery();
      return;
    }

    await ctx.reply(answer, {
      parse_mod: "HTML",
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();

    return;
  }

  if (callbackData.isCorrect) {
    // await ctx.replyWithPhoto({ source: "./assets/test.png" });
    await ctx.reply("✅ Correct");
    await ctx.answerCallbackQuery();

    return;
  }

  const answer = getCorrectAnswer(
    callbackData.questionId,
    callbackData.type.split("-")[0]
  );
  await ctx.reply(`❌ Not correct. The answer is: ${answer}`);
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
