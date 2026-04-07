import { createOllama } from "ollama-ai-provider-v2";

const ollamURL = process.env.OLLAMA_HOMESERVER_URL;

console.log("Ollama URL:", ollamURL);

if (!ollamURL) {
  console.log("OLLAMA_HOMESERVER_URL não configurado");
}

export const ollama = createOllama({
  baseURL: ollamURL,
});
