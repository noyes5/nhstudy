// api/getQuizData.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

// Cosmos DB 클라이언트 설정
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database("quizdb");
const container = database.container("reviewQuestions");

app.http('getQuizData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`Http function 'getQuizData' processed request for url "${request.url}"`);
    try {
      const nickname = request.query.get("nickname"); // URL 쿼리에서 닉네임 읽기

      // 기본 문제 세트(quizData)
      const { resource: quizDoc } = await container.item("quizData", "quizData").read();
      const quizData = quizDoc?.quizData || [];

      // 닉네임별 북마크
      let bookmarked = [];
      if (nickname) {
        try {
          const { resource: bookmarkDoc } = await container
            .item(`bookmark_${nickname}`, "bookmark")
            .read();
          bookmarked = bookmarkDoc?.bookmarked || [];
        } catch {
          context.log(`No bookmark data found for nickname "${nickname}"`);
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
