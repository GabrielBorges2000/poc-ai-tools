import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import multipart from "@fastify/multipart";
import { swaggerSetup } from "@/lib/swagger";
import { errorHandler } from "@/modules/_errors/error-handler";

import registerRoutes from "./modules";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

swaggerSetup(app);

app.register(fastifyCors);

registerRoutes(app);

export { app };
