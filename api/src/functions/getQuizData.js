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
    try {
      const nickname = request.query.get("nickname");

      // 기본 문제 세트
      const { resource: quizDoc } = await container.item("quizData", "quizData").read();
      let quizData = quizDoc?.quizData || [];

      // 닉네임별 북마크
      let bookmarked = [];
      if (nickname) {
        const { resource: bookmarkDoc } = await container
          .item(`bookmark_${nickname}`, "bookmark")
          .read();
        bookmarked = bookmarkDoc?.bookmarked || [];
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
