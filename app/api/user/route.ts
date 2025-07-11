// app/api/something/route.ts
import { getUser } from "@/lib/getUser";

export async function GET(request: Request) {
  const user = await getUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
