// api/getQuizData.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database("quizdb");
const container = database.container("reviewQuestions");

app.http('getQuizData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`Http function 'getQuizData' processed request.`);
    try {
      const nickname = request.query.get("nickname");
      context.log(`Requested nickname: ${nickname}`);

      // 기본 문제 세트 불러오기
      const { resource: quizDoc } = await container.item("quizData", "quizData").read();
      const quizData = quizDoc?.quizData || [];

      // 닉네임별 북마크 불러오기
      let bookmarked = [];
      if (nickname) {
        try {
          const { resource: userDoc } = await container
  .item(`bookmark_${nickname}`, `bookmark_${nickname}`)
  .read();
          bookmarked = userDoc?.bookmarked || [];
        } catch {
          context.log(`No bookmark found for ${nickname}`);
        }
      }

      return {
        jsonBody: { quizData, bookmarked },
      };
    } catch (err) {
      context.log.error(`Error reading from Cosmos DB: ${err.message}`);
      return { status: 500, body: `Database error: ${err.message}` };
    }
  },
});
