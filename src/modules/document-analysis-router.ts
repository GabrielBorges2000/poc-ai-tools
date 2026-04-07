import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import sharp from "sharp";
import { analyzeDocument } from "@/ai/document-analyzer";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 2MB
const MAX_IMAGE_SIZE = 768;

export async function documentAnalysis(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/document-analysis",
    {
      schema: {
        tags: ["ai"],
        summary: "Analisar documento com IA",
        consumes: ["multipart/form-data"],
        querystring: z.object({
          documentName: z
            .string()
            .min(1, "Nome do documento é obrigatório")
            .describe("Nome do documento (ex: RG, CPF, CNH)"),
          validate: z
            .string()
            .optional()
            .describe("Data de validação do documento (opcional)"),
        }),
        body: z.null(),
        response: {
          200: z.object({
            result: z.any(),
            description: z.string(),
            processingTime: z.number(),
            tokensUsed: z.number(),
            modelUsed: z.string(),
            dataValidade: z.string().optional(),
            errorFilds: z.string().optional(),
          }),
          400: z.object({
            result: z.any(),
            description: z.string(),
            processingTime: z.number(),
            tokensUsed: z.number(),
            modelUsed: z.string(),
            dataValidade: z.string().optional(),
            errorFilds: z.string().optional(),
          }),
          413: z.object({
            result: z.any(),
            description: z.string(),
            processingTime: z.number(),
            tokensUsed: z.number(),
            modelUsed: z.string(),
            dataValidade: z.string().optional(),
            errorFilds: z.string().optional(),
          }),
          415: z.object({
            result: z.any(),
            description: z.string(),
            processingTime: z.number(),
            tokensUsed: z.number(),
            modelUsed: z.string(),
            dataValidade: z.string().optional(),
            errorFilds: z.string().optional(),
          }),
          500: z.object({
            result: z.any(),
            description: z.string(),
            processingTime: z.number(),
            tokensUsed: z.number(),
            modelUsed: z.string(),
            dataValidade: z.string().optional(),
            errorFilds: z.string().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();
      const { documentName, validate } = request.query;

      console.log({ documentName, validate });

      try {
        // Get file from multipart
        const file = await request.file();

        if (!file) {
          return reply.status(400).send({
            result: "ERRO",
            description: "Arquivo é obrigatório",
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            modelUsed: "N/A",
          });
        }

        const fileBuffer = await file.toBuffer();
        const mimeType = (
          file.mimetype || "application/octet-stream"
        ).toLowerCase();
        const filename = file.filename;
        const fileSize = fileBuffer.length;

        console.log(
          `[DocumentAnalysis] File: ${filename}, Type: ${mimeType}, Size: ${(fileSize / 1024).toFixed(2)}KB, Document: ${documentName}, expected validate: ${validate ?? "indeterminado"}`,
        );

        // Validate file size
        if (fileSize > MAX_FILE_SIZE) {
          return reply.status(413).send({
            result: "ERRO",
            description: `Arquivo muito grande. Máximo: 10MB`,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            modelUsed: "N/A",
          });
        }

        // Process file content
        let imageBase64: string | undefined;
        let fileContent: string | undefined;

        if (isImageType(mimeType)) {
          imageBase64 = await processImage(fileBuffer, mimeType);
        } else if (mimeType === "application/pdf") {
          fileContent = await processPDF(fileBuffer);
        } else if (isTextType(mimeType)) {
          fileContent = fileBuffer.toString("utf-8");
        } else {
          return reply.status(415).send({
            result: "ERRO",
            description: `Tipo de arquivo não suportado: ${mimeType}. Use: imagens (JPG, PNG), PDF, ou texto.`,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            modelUsed: "N/A",
          });
        }

        // Analyze document
        const analysisResult = await analyzeDocument({
          documentName: documentName.trim(),
          imageBase64,
          fileContent,
          validate: request.query.validate,
        });

        // Save processing log
        await saveProcessingLog({
          documentName: documentName.trim(),
          fileType: mimeType,
          fileSize,
          status: analysisResult.result === "ERRO" ? "ERROR" : "SUCCESS",
          processingTime: analysisResult.processingTime,
          tokensUsed: analysisResult.tokensUsed,
          modelUsed: analysisResult.modelUsed,
          result: analysisResult.result,
          description: analysisResult.description,
          validate: analysisResult.dataValidade,
          fieldErrors: analysisResult.errorFilds,
        });

        return reply.send(analysisResult);
      } catch (error) {
        console.error("[DocumentAnalysis] Error:", error);

        // Save error log
        await saveProcessingLog({
          documentName: documentName || "unknown",
          fileType: "unknown",
          fileSize: 0,
          status: "ERROR",
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelUsed: "N/A",
          result: "ERRO",
          description: getErrorMessage(error),
        });

        return reply.status(500).send({
          result: "ERRO",
          description: getErrorMessage(error),
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          modelUsed: "N/A",
        });
      }
    },
  );

  // Route to get processing logs
  app.withTypeProvider<ZodTypeProvider>().get(
    "/processing-logs",
    {
      schema: {
        tags: ["ai"],
        summary: "Listar logs de processamento",
        querystring: z.object({
          limit: z.coerce.number().default(50),
          offset: z.coerce.number().default(0),
        }),
      },
    },
    async (request, reply) => {
      const { limit, offset } = request.query;

      const logs = await prisma.processingLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.processingLog.count();

      return reply.send({ logs, total, limit, offset });
    },
  );
}

async function saveProcessingLog(data: {
  documentName: string;
  fileType: string;
  fileSize: number;
  status: string;
  processingTime: number;
  tokensUsed: number;
  modelUsed: string;
  result: string | null;
  description: string | null;
  validate?: string;
  fieldErrors?: string;
}) {
  try {
    return await prisma.processingLog.create({
      data: {
        documentName: data.documentName.toString(),
        fileType: data.fileType,
        fileSize: data.fileSize,
        status: data.status,
        processingTime: data.processingTime,
        tokensUsed: data.tokensUsed,
        modelUsed: data.modelUsed,
        result: data.result?.toString(),
        description: data.description,
        validate: data.validate?.toString() ?? null,
        fieldErrors: data.fieldErrors?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error("[DocumentAnalysis] Failed to save log:", error);
  }
}

function isImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.some((type) => mimeType.includes(type));
}

function isTextType(mimeType: string): boolean {
  return (
    mimeType.includes("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml" ||
    mimeType === "text/plain"
  );
}

async function processImage(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Convert HEIC/HEIF to JPEG
    let processed = buffer;
    if (mimeType.includes("heic") || mimeType.includes("heif")) {
      processed = await sharp(buffer).toFormat("jpeg").toBuffer();
    }

    // Resize and compress
    const compressed = await sharp(processed)
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    console.log(
      `[Image] Processed: ${(compressed.length / 1024).toFixed(2)}KB`,
    );

    return `data:image/jpeg;base64,${compressed.toString("base64")}`;
  } catch (error) {
    console.error("[Image] Processing error:", error);
    throw new Error(
      `Falha ao processar imagem: ${error instanceof Error ? error.message : "Formato de imagem inválido ou corrupto"}`,
    );
  }
}

async function processPDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text;

    // Extract images from all pages if available
    const imageResult = await parser.getImage();
    const images = imageResult.pages
      .flatMap((page) => page.images || [])
      .filter((img) => img.dataUrl)
      .slice(0, 5); // Limit to 5 images to avoid excessive tokens

    // Build combined content
    let content = text;

    // Prepend images as base64 data URLs for multi-page document analysis
    if (images.length > 0) {
      const imageTexts = images
        .map((img) => `[Imagem do documento: ${img.dataUrl}]`)
        .join("\n");
      content = `${imageTexts}\n\n--- Texto Extraído ---\n${text}`;
    }

    // Truncate to avoid excessive tokens
    const maxLength = 10000;
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "\n\n[PDF truncado...]";
    }

    return content;
  } catch (error) {
    console.error("[PDF] Processing error:", error);
    throw new Error("Falha ao extrair texto do PDF");
  } finally {
    await parser.destroy();
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.substring(0, 200);
  }
  return String(error).substring(0, 200);
}
