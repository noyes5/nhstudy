import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

export default async function (context, req) {
  const { quizData, bookmarked } = req.body;

  try {
    const database = client.database("quizdb");
    const container = database.container("reviewQuestions");

    await container.items.upsert({
      id: "quizData",
      quizData,
      bookmarked,
    });

    context.res = { status: 200, body: { message: "저장 성공" } };
  } catch (err) {
    context.res = { status: 500, body: { message: "저장 실패", error: err.message } };
  }
}
