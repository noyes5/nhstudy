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
    try {
      const { quizData, bookmarked, nickname } = await request.json();

      if (!nickname) {
        return { status: 400, body: "닉네임이 필요합니다." };
      }

      // 북마크 데이터만 닉네임별로 따로 저장
      await container.items.upsert({
        id: `bookmark_${nickname}`,
        partitionKey: "bookmark",
        nickname,
        bookmarked,
      });

      // quizData는 공용 문서로 유지
      if (quizData) {
        await container.items.upsert({
          id: "quizData",
          partitionKey: "quizData",
          quizData,
        });
      }

      return {
        status: 200,
        jsonBody: { message: "저장 성공" },
      };
    } catch (err) {
      context.log.error(`Error saving to Cosmos DB: ${err.message}`);
      return { status: 500, body: `Database error: ${err.message}` };
    }
  },
});
