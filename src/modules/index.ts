import type { FastifyInstanceProps } from "@/@types/fastify-instance";
import { chatAi } from "./chat";

export default function registerRoutes(app: FastifyInstanceProps) {
  app.register(chatAi);
}
