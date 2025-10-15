import { CosmosClient } from "@azure/cosmos";

export default async function (context, req) {
  try {

    context.log("Function 'getQuizData' has started.");

    // 2. 환경 변수가 제대로 로드되었는지 확인하는 로그
    if (!endpoint || !key) {
      context.log.error("Cosmos DB environment variables are missing!");
      context.res = {
        status: 500,
        body: { message: "서버 설정 오류: 데이터베이스 자격 증명 누락." },
      };
      return; // 여기서 함수 실행 중단
    }
    context.log("Successfully loaded environment variables.");

    const client = new CosmosClient({ endpoint, key });
    context.log("CosmosClient has been initialized.");

    const database = client.database("quizdb");
    const container = database.container("reviewQuestions");

    const { resource } = await container.item("quizData", "quizData").read();

    context.res = {
      status: 200,
      body: resource || { quizData: [], bookmarked: [] },
    };
  } catch (err) {
    context.log.error(err); // 로그 추가
    context.res = {
      status: 500,
      body: { message: "불러오기 실패", error: err.message },
    };
  }
}
