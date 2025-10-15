import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });

export default async function (context, req) {
  try {
    const database = client.database("quizdb");
    const container = database.container("reviewQuestions");

    const { resource } = await container.item("quizData", "quizData").read();

    context.res = {
      status: 200,
      body: resource || { quizData: [], bookmarked: [] },
    };
  } catch (err) {
    context.res = { status: 500, body: { message: "불러오기 실패", error: err.message } };
  }
}
