import { ollama } from "@/lib/ollama";
import { generateText } from "ai";
import { prisma } from "@/lib/prisma";

const MODEL_NAME = "minimax-m3:cloud";

export interface AnalysisResult {
  result: string;
  description: string;
  processingTime: number;
  tokensUsed: number;
  modelUsed: string;
  dataValidade?: string;
  errorFilds?: string;
}

export interface AnalyzeDocumentParams {
  documentName: string;
  imageBase64?: string;
  fileContent?: string;
  validate?: string;
}

export async function analyzeDocument(
  params: AnalyzeDocumentParams,
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const { documentName, imageBase64, fileContent, validate } = params;

  try {
    const docType = await prisma.documentType.findFirst({
      where: {
        name: {
          contains: documentName.toLowerCase(),
        },
      },
    });

    let tokensUsed = 0;

    if (imageBase64) {
      // ==================== IMAGE ANALYSIS ====================
      const model = ollama(MODEL_NAME);

      const systemPrompt = buildPrompt(docType?.fields, documentName, validate);

      console.log({ systemPrompt, type: "IMAGE" });

      const answer = await generateText({
        model,
        temperature: 0,
        maxOutputTokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                Analise este documento como: ${documentName} e veja se le tem as caracteristicas necessárias!
                Conteúdo:\n${fileContent}
                `,
              },
              { type: "image", image: imageBase64 },
            ],
          },
        ],
      });

      tokensUsed = answer.usage?.totalTokens ?? 0;

      return parseAndFormatResponse(
        answer.text ?? "",
        tokensUsed,
        Date.now() - startTime,
      );
    }

    if (fileContent) {
      // ==================== TEXT/FILE ANALYSIS ====================
      const model = ollama(MODEL_NAME);

      const systemPrompt = buildPrompt(docType?.fields, documentName);

      console.log({ systemPrompt, type: "TEXT/FILE" });

      const answer = await generateText({
        model,
        temperature: 0,
        maxOutputTokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `
            Analise este documento como: ${documentName} e veja se le tem as caracteristicas necessárias com base no nome informado!
            Conteúdo:\n${fileContent}
            `,
          },
        ],
      });

      tokensUsed = answer.usage?.totalTokens ?? 0;

      return parseAndFormatResponse(
        answer.text ?? "",
        tokensUsed,
        Date.now() - startTime,
      );
    }

    // No content
    return {
      result: "ERRO",
      description: "Nenhum conteúdo para analisar",
      processingTime: Date.now() - startTime,
      tokensUsed: 0,
      modelUsed: MODEL_NAME,
    };
  } catch (error) {
    console.error("[DocumentAnalyzer] Error:", error);

    return {
      result: "ERRO",
      description: getErrorMessage(error),
      processingTime: Date.now() - startTime,
      tokensUsed: 0,
      modelUsed: MODEL_NAME,
    };
  }
}

function buildPrompt(
  storedFields: string | null | undefined,
  documentName: string,
  validate?: string,
): string {
  const fieldsInfo = storedFields
    ? `\nCAMPOS ESPERADOS (da base de conhecimento):\n${storedFields.toString()}`
    : `\nCAMPOS ESPERADOS: Não encontrados na base. Use análise genérica. com base no nome do arquivo: ${documentName}`;

  const currentDate = new Date().toISOString().split("T")[0];

  console.log({ currentDate });

  return `Você é um sistema PROFISSIONAL E RIGOROSO de validação de documentos.

DOCUMENTO: ${documentName}
VALIDADE INFORMADA PELO USUÁRIO: ${validate ?? "VALIDADE Não informada"}

${fieldsInfo}

PROCEDIMENTO:
1) Analise a imagem com cuidado
2) Identifique o tipo de documento
3) Verifique os campos obrigatórios
4) Verifique elementos visuais opcionais (fotos, assinaturas, hologramas, qr code, etc.)
5) Verifique se a data do documento corresponde com a data informada pelo usuário
6) Verifique padrões de cor e layout

REGRAS DE DATA (CRÍTICO):
- Sempre interpretar datas no contexto do país do documento
- Formatos comuns:
  - Brasil: DD/MM/YYYY
  - EUA: MM/DD/YYYY
  - Internacional: YYYY-MM-DD
- Quando houver ambiguidade (ex: 05/06/2026):
  - Use contexto do documento (idioma, país, layout)
  - Se não for possível determinar com segurança → ANALISE_MANUAL
- Converter TODAS as datas para o formato YYYY-MM-DD antes de comparar
- Comparar apenas datas (ignorar horas e timezone)
- DATA ATUAL para comparação: ${currentDate}
- Caso tenha uma data é obrigatório que seja maior ou igual a data atual para ser aprovado, caso contrário reprovado ou análise manual dependendo da proximidade da data

CRITÉRIOS DE REJEIÇÃO:
- Falta de campos obrigatórios
- Imagem parcial ou de baixa qualidade
- Não parece ser o documento esperado
- Caso os dados de cada campo não seja legivel ou com dificuldade de ler
- Se a data de vencimento do documento for menor que a data atual: ${currentDate}

CRITÉRIOS DE APROVAÇÃO:
- Todos os campos obrigatórios presentes
- Layout e elementos visuais corretos
- Qualidade suficiente para validação
- Obrigatóriamente deve ter uma qualidade legivel para identificar os dados!
- Se a data de vencimento do documento for maior que a data atual: ${currentDate}

OBSERVAÇÕES:
- Deverá ser aceito documentos em vários idiomas
- Em caso de datas próximas ao vencimento deverá receber o status de "ANALISE MANUAL"

SAÍDA (JSON obrigatório, sem texto extra):

{
  "status": "APROVADO | REPROVADO | ANALISE_MANUAL",
  "resultado": "Gere um score de 0 a 1000",
  "descricao": "Explicação breve (max 1-2 linhas)",
  "dataValidade": "YYYY-MM-DD ou 'indeterminado'",
  "errorFilds": "campo1, campo2, campo3"
}

Nada além do JSON.
REGRAS IMPORTANTES:
- Nunca inventar dados
- Se houver dúvida → ANALISE_MANUAL
- Datas devem ser normalizadas para YYYY-MM-DD
- Campos com erro devem ser listados como texto separado por vírgula
- Não retornar arrays
- Não retornar nada fora do JSON
`;
}

function parseAndFormatResponse(
  resposta: string,
  tokensUsed: number,
  processingTime: number,
): AnalysisResult {
  try {
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn(
        "[Parse] Nenhum JSON encontrado:",
        resposta.substring(0, 100),
      );
      return {
        result: "ERRO",
        description: "Não foi possível processar a resposta",
        processingTime,
        tokensUsed,
        modelUsed: MODEL_NAME,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      result: parsed.resultado,
      description: String(parsed.descricao ?? "Sem descrição").substring(
        0,
        500,
      ),
      processingTime,
      tokensUsed,
      modelUsed: MODEL_NAME,
      dataValidade: parsed.dataValidade,
      errorFilds: parsed.errorFilds,
    };
  } catch {
    return {
      result: "ERRO",
      description: "Erro ao processar resposta do modelo",
      processingTime,
      tokensUsed,
      modelUsed: MODEL_NAME,
    };
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("ECONNREFUSED")) {
      return "Ollama não está acessível. Verifique se está rodando.";
    }
    if (error.message.includes("timeout")) {
      return "Timeout ao processar. Tente arquivo menor.";
    }
    if (error.message.includes("404")) {
      return `Modelo ${MODEL_NAME} não encontrado. Execute: ollama pull ${MODEL_NAME}`;
    }
    return error.message.substring(0, 200);
  }
  return "Erro desconhecido";
}
