const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

// Cosmos DB Client initialization
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

            // success
            return {
                jsonBody: resource || { quizData: [], bookmarked: [] }
            };

        } catch (err) {
            context.log.error(`Error reading from Cosmos DB: ${err.message}`);
            
            // failure
            return {
                status: 500,
                body: `Database error: ${err.message}`
            };
        }
    }
});