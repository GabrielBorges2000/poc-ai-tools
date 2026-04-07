import type { FastifyInstanceProps } from "@/@types/fastify-instance";
import { documentAnalysis } from "./document-analysis-router";

export default function registerRoutes(app: FastifyInstanceProps) {
  app.register(documentAnalysis);
}
