import type { Metadata } from "next";
import FormPage from "@/components/FormPage/FormPage";
import { FORMS } from "@/lib/forms";

export const metadata: Metadata = {
  title: FORMS.briefing.page.metaTitle,
  description: FORMS.briefing.page.subtitle,
};

export default function BriefingPage() {
  return <FormPage formId="briefing" />;
}
