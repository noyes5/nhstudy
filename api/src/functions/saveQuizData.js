// api/saveQuizData.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database("quizdb");
const container = database.container("reviewQuestions");

app.http('saveQuizData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log("Http function 'saveQuizData' called.");
    try {
      const { quizData, bookmarked, nickname } = await request.json();

      if (!nickname) {
        return { status: 400, body: "nickname is required" };
      }

      // 닉네임별 북마크 저장
      await container.items.upsert({
        id: `bookmark_${nickname}`,
        partitionKey: "bookmark",
        nickname,
        bookmarked,
        updatedAt: new Date().toISOString(),
      });

      // quizData는 공용으로 저장
      if (quizData) {
        await container.items.upsert({
          id: "quizData",
          partitionKey: "quizData",
          quizData,
        });
      }

      return {
        status: 200,
        jsonBody: { message: "Saved successfully" },
      };
    } catch (err) {
      context.log.error(`Error saving to Cosmos DB: ${err.message}`);
      return { status: 500, body: `Database error: ${err.message}` };
    }
  },
});
