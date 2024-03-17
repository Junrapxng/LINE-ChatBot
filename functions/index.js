/* 0. Initial */
// 0.1. Install dependencies
// 0.2. Fill out values in .env

const { onRequest } = require("firebase-functions/v2/https");
const line = require("./utils/line");
const gemini = require("./utils/gemini");

//เก็บค่าไว้ใน module instance
const NodeCache = require("node-cache");
const cache = new NodeCache();
const CACHE_IMAGE = "image_";
const CACHE_CHAT = "chat_";

exports.webhook = onRequest(async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    const userId = event.source.userId;
    // console.log('userid',userId);

    switch (event.type) {
      case "message":
        if (event.message.type === "text") {
          const prompt = event.message.text;
        //   console.log('prompt',prompt)

          /* 3. Generate text from text-and-image input (multimodal) */
          // 3.5. Get cache image
          const cacheImage = cache.get(CACHE_IMAGE + userId);
          // 3.6. Check available cache
          // 3.7. Send a prompt to Gemini multimodal
          // 3.8. Reply a generated text
          if (cacheImage) {
            const text = await gemini.multimodal(prompt, cacheImage);
            await line.reply(event.replyToken, [{type:'text', text:text}]);
            break;
          }

          /* 1. Generate text from text-only input */
          // 1.1. Send a prompt to Gemini
          const text = await gemini.textOnly(prompt);
          // 1.2. Reply a generated text
          await line.reply(event.replyToken, [{type:'text', text:text}]);

          /* 2. Generate text from text-only input with contextual info */
          // 2.1. Send a prompt to Gemini
        //   const text = await gemini.textOnlyWithContext(prompt);

          // 2.2. Reply a generated text
        //   await line.reply(event.replyToken, [{type:'text', text:text}]);

          /* 4. Build multi-turn conversations (chat) */
          // 4.1. Get a cache chat history
        //   let chatHistory = cache.get(CACHE_CHAT + userId);

          // 4.2. Check available cache
        //   if (!chatHistory) {
        //     chatHistory = [];
        //   }

          // 4.3. Send a prompt to Gemini
        //   const text = await gemini.chat(chatHistory, prompt);

          // 4.4. Reply a generated text
        //   await line.reply(event.replyToken, [{type:'text',text:text}]);

          // 4.5. Push a new chat history
        //   chatHistory.push({ role: "user", parts: prompt});
        //   chatHistory.push({ role: "model", parts: text});

          // 4.6. Set a cache chat history
        //   cache.set(CACHE_CHAT + userId, chatHistory, 60);
        //   break;
        }

        if (event.message.type === "image") {
          /* 3. Generate text from text-and-image input (multimodal) */
          // 3.1. Get an image binary
          const imageBinary = await line.getImageBinary(event.message.id);
          // 3.2. Convert binary to base64
          const imageBase64 = Buffer.from(imageBinary, "binary").toString("base64");
          // 3.3. Set a cache image
          cache.set(CACHE_IMAGE + userId, imageBase64, 60); //ครบ 60 วิ cache จะหายไป
          // 3.4. Ask for prompt
          await line.reply(event.replyToken, [{type:'text',text:"ระบุสิ่งที่ต้องการทราบจากรูปภาพ: "}]);
          break;
        }
        break;
    }
  }
  res.end();
});