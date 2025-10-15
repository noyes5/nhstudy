const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

// Cosmos DB 클라이언트는 함수 핸들러 바깥에서 한 번만 초기화하는 것이 좋습니다.
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
            const { resource } = await container.item("quizData", "quizData").read();
            context.log("Successfully read item from Cosmos DB.");

            // 성공 시, jsonBody를 사용해 JSON 응답을 보냅니다.
            return {
                jsonBody: resource || { quizData: [], bookmarked: [] }
            };

        } catch (err) {
            context.log.error(`Error reading from Cosmos DB: ${err.message}`);
            
            // 실패 시, status와 body를 포함한 객체를 반환합니다.
            return {
                status: 500,
                body: `Database error: ${err.message}`
            };
        }
    }
});