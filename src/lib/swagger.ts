import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from "fastify-type-provider-zod";

import type { FastifyInstanceProps } from "@/@types/fastify-instance";

export async function swaggerSetup(app: FastifyInstanceProps) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "AI Document Analysis POC API",
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
      title: "AI Document Analysis POC API",
    },
    uiConfig: {
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.register(require("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
    theme: {
      title: "AI Document Analysis POC API",
    },
    uiConfig: {
      filter: true,
      displayRequestDuration: true,
    },
  });
}
