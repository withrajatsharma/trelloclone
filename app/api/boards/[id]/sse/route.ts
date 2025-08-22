import { NextResponse } from "next/server";
import { eventBus } from "@/lib/eventBus";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let isClosed = false;
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function safeEnqueue(text:any) {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // controller already closed
        }
      }

      function send(data:any) {
        safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      }

      // Subscribe to events for this board using the new event bus
      const unsubscribe = eventBus.on(`board:${id}`, (payload:any) => {
        send(payload);
      });

      // Heartbeat to keep the connection alive on some proxies
      const heartbeat = setInterval(() => {
        safeEnqueue(`: ping\n\n`);
      }, 25000);

      // Initial hello
      send({ type: "hello", boardId: id });

      const close = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(heartbeat);
        unsubscribe(); // Use the new unsubscribe function
        try {
          controller.close();
        } catch {}
      };

      cleanup = close;

      // Close when client disconnects
      // @ts-ignore - Request in Next has signal
      req.signal?.addEventListener("abort", close);
    },
    cancel() {
      isClosed = true;
      cleanup();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


