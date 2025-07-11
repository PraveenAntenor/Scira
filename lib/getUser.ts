// lib/getUser.ts
import { auth } from "./auth";

export async function getUser(request: Request) {
  const response = await auth(request); // This returns a Response
  const session = await response.json(); // Parse the session

  if (!session || !session.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}
