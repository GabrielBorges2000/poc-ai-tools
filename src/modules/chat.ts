import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { answerMessage } from "./answer.message-router";
import z from "zod";

export async function chatAi(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/messages",
    {
      schema: {
        tags: ["ai"],
        summary: "Send a message to the AI chat",
        body: z.object({
          message: z.string(),
        }),

      },
    },
    async (request, reply) => {
      const data = request.body;

      const { message } = await answerMessage({ message: data.message });

      return reply.status(200).send({ message });
    },
  );
}
