export default async function (context, req) {
  context.log(">>> Hello World function was successfully triggered! <<<");

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "API is alive!" })
  };
}