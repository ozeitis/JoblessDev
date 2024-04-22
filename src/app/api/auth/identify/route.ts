import { LoopsClient } from "loops";
import { auth, clerkClient } from "@clerk/nextjs";

export async function GET(request: Request) {
  const { userId } = auth();
  const user = await clerkClient.users.getUser(userId || "");
  if (!user || !user.emailAddresses.length) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }
  return new Response(JSON.stringify(user.emailAddresses[0].emailAddress), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
