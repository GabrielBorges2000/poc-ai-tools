import type { FastifyInstance } from "fastify";
import z, { ZodError } from "zod";

import { BadRequestError } from "@/modules/_errors/bad-request-error";
import { UnauthorizedError } from "@/modules/_errors/unauthorized-error";
import { ConflictExceptionError } from "./conflict-exception-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error",
      errors: z.flattenError(error).fieldErrors,
    });
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    });
  }

  if (error instanceof ConflictExceptionError) {
    reply.status(409).send({
      message: error.message,
    });
  }

  console.error(error);

  // send error to some observability platform

  reply.status(500).send({ message: "Internal server error" });
};
