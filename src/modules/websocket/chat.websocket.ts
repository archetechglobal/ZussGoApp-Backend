import { prisma } from "../../config/prisma_client.ts";

// Store active connections: userId → WebSocket
const connections = new Map<string, WebSocket>();

export function handleChatWebSocket(req: Request): Response {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("userId required", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    // Register this user's connection
    connections.set(userId, socket);
    console.log(`WS connected: ${userId} (${connections.size} online)`);
  });

  socket.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data);

      // Handle different message types
      switch (data.type) {
        case "message": {
          // Save message to database
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: userId,
              content: data.content,
            },
            include: {
              sender: {
                select: { id: true, fullName: true, profilePhotoUrl: true },
              },
            },
          });

          // Update conversation's last message
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: {
              lastMessage: data.content,
              lastMessageAt: new Date(),
            },
          });

          // Find the other person in this conversation
          const conversation = await prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: { match: { select: { userAId: true, userBId: true } } },
          });

          if (conversation) {
            const receiverId = conversation.match.userAId === userId
              ? conversation.match.userBId
              : conversation.match.userAId;

            // Send to receiver if they're online
            const receiverSocket = connections.get(receiverId);
            if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
              receiverSocket.send(JSON.stringify({
                type: "new_message",
                data: message,
              }));
            }

            // Send confirmation back to sender
            socket.send(JSON.stringify({
              type: "message_sent",
              data: message,
            }));
          }

          break;
        }

        case "typing": {
          // Forward typing indicator to the other person
          const convo = await prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: { match: { select: { userAId: true, userBId: true } } },
          });

          if (convo) {
            const receiverId = convo.match.userAId === userId
              ? convo.match.userBId
              : convo.match.userAId;

            const receiverSocket = connections.get(receiverId);
            if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
              receiverSocket.send(JSON.stringify({
                type: "typing",
                conversationId: data.conversationId,
                userId: userId,
              }));
            }
          }

          break;
        }

        case "read": {
          // Mark messages as read
          await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              senderId: { not: userId },
              isRead: false,
            },
            data: { isRead: true },
          });

          break;
        }
      }
    } catch (error) {
      console.error("WS message error:", error);
      socket.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
    }
  });

  socket.addEventListener("close", () => {
    connections.delete(userId);
    console.log(`WS disconnected: ${userId} (${connections.size} online)`);
  });

  socket.addEventListener("error", (error) => {
    console.error(`WS error for ${userId}:`, error);
    connections.delete(userId);
  });

  return response;
}

// Helper: check if a user is online
export function isUserOnline(userId: string): boolean {
  const socket = connections.get(userId);
  return socket !== undefined && socket.readyState === WebSocket.OPEN;
}

// Helper: get online user count
export function getOnlineCount(): number {
  return connections.size;
}