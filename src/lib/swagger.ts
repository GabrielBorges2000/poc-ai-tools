import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import type { FastifyReply, FastifyRequest } from "fastify";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from "fastify-type-provider-zod";

import type { FastifyInstanceProps } from "@/@types/fastify-instance";
import { env } from "@/env";

export async function swaggerSetup(app: FastifyInstanceProps) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API POC AI TOOLS",
        version: "1.0.0",
        contact: {
          email: "contato@codeborges.com",
          name: "Gabriel Borges | CODEBORGE",
          url: "https://portfolio.codeborges.com.br/",
        },
        description: "API documentation",
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });

  app.register(fastifySwaggerUI, {
    routePrefix: "/api-docs",
    theme: {
      title: "API POC AI TOOLS",
    },
    uiConfig: {
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.register(require("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
    theme: {
      title: "API POC AI TOOLS",
    },
    uiConfig: {
      filter: true,
      displayRequestDuration: true,
    },
  });
}
