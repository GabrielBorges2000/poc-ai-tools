import { ollama } from "ollama-ai-provider-v2";
import { prisma } from "@/lib/prisma";
import { generateText, stepCountIs, tool } from "ai";
import z from "zod";

export async function answerMessage({ message }: { message: string }) {
  try {
    const answer = await generateText({
      model: ollama("llama3.2"),
      prompt: message,
      temperature: 0.7,
      stopWhen: stepCountIs(3),
      maxRetries: 3,
      tools: {
        eventsFromDatabase: tool({
          description:
            "Buscar informações dos eventos no banco de dados. Use esta ferramenta quando o usuário perguntar sobre eventos.",
          inputSchema: z.object({}),
          execute: async () => {
            const events = await prisma.event.findMany({
              select: {
                name: true,
                description: true,
                status: true,
              },
            });

            console.log({ events });
            return JSON.stringify(events);
          },
        }),
      },
      system: `
        Você é o assistente oficial do sistema de gerenciamento de eventos.

        Objetivo:
        Responder única e exclusivamente ao que o usuário pediu, de forma direta, objetiva e sem floreios. Não exponha ferramentas, processos internos ou passos de execução. Não invente dados.

        Uso de Ferramentas:
        - Sempre que o usuário perguntar ou der a entender que deseja informações sobre eventos (lista, status, detalhes, nomes, resumo, eventos ativos/inativos), você DEVE usar a ferramenta "eventsFromDatabase".
        - Após receber o retorno da ferramenta, apresente somente o resultado final.
        - Se a ferramenta retornar um array vazio, responda exatamente: "Nenhuma informação encontrada para esta consulta."

        Formato das Respostas:
        - Responda no idioma solicitado pelo usuário; se não especificar, use português natural.
        - Não inclua explicações técnicas.
        - Não adicione informações que não vierem do banco ou do próprio usuário.
        - Não especule. Se a informação não existir, deixe claro sem inventar.

        Comportamento:
        - Se a solicitação não envolver dados sobre eventos, responda normalmente dentro do tema “gestão de eventos”.
        - Perguntas amplas como: "quais são meus eventos?", "tem algum evento ativo?", "me diga tudo sobre meus eventos" devem acionar a ferramenta.
        - Evite qualquer conteúdo fora do contexto do sistema.
        - Após entregar a resposta principal, inclua UMA sugestão curta, útil e prática, no estilo de assistentes modernos.
          • A sugestão deve sempre apontar para uma próxima ação relevante dentro do sistema.
          • A sugestão deve se adaptar ao conteúdo da resposta (ex.: se listou eventos, sugerir ver detalhes; se mostrou detalhes, sugerir editar; se não há eventos, sugerir criar um novo).
          • Nunca invente dados.
          • Não repita a mesma estrutura genérica toda vez.

        Exemplo interno (não exibir ao usuário):
        - Se a ferramenta retornar: []
          Responda: "Nenhuma informação encontrada para esta consulta."
      `.trim(),
    });
    const responseText =
      answer.text || "Desculpe, não consegui processar sua solicitação.";

    return { message: responseText };
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    return {
      message: "Desculpe, ocorreu um erro ao processar sua solicitação.",
    };
  }
}
