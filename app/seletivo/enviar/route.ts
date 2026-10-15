import { handleSubmission } from "@/lib/submit";

export const POST = (request: Request) => handleSubmission(request, "seletivo");
