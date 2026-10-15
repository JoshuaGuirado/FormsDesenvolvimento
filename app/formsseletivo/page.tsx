import type { Metadata } from "next";
import FormPage from "@/components/FormPage/FormPage";
import { FORMS } from "@/lib/forms";

export const metadata: Metadata = {
  title: FORMS.seletivo.page.metaTitle,
  description: FORMS.seletivo.page.subtitle,
};

export default function SeletivoPage() {
  return <FormPage formId="seletivo" />;
}
