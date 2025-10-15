const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

// Cosmos DB 클라이언트는 한 번만 초기화합니다.
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database("quizdb");
const container = database.container("reviewQuestions");

app.http('saveQuizData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function 'saveQuizData' processed request.`);

        try {
            // POST 요청의 본문(body)을 읽어옵니다.
            const { quizData, bookmarked } = await request.json();

            if (!quizData) {
                return { status: 400, body: "quizData is required." };
            }

            await container.items.upsert({
                id: "quizData",
                partitionKey: "quizData", // 여기에 실제 파티션 키 필드 이름을 넣으세요. 없다면 id와 동일하게.
                quizData,
                bookmarked,
            });

            context.log("Successfully saved item to Cosmos DB.");

            return {
                status: 200,
                jsonBody: { message: "저장 성공" }
            };

        } catch (err) {
            context.log.error(`Error saving to Cosmos DB: ${err.message}`);
            return {
                status: 500,
                body: `Database error: ${err.message}`
            };
        }
    }
});