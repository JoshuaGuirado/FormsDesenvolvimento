// Endereço antigo do envio do briefing, mantido para páginas abertas antes da mudança.
import { handleSubmission } from "@/lib/submit";

export const POST = (request: Request) => handleSubmission(request, "briefing");
