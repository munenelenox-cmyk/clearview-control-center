import logo from "@/assets/leap-logo.jpg.asset.json";
import mark from "@/assets/leap-mark.jpg.asset.json";
import certificate from "@/assets/docs/certificate.pdf.asset.json";
import constitution from "@/assets/docs/constitution.docx.asset.json";
import minutes1 from "@/assets/docs/minutes-1.docx.asset.json";
import minutes2 from "@/assets/docs/minutes-2.docx.asset.json";

export const LOGO_URL = logo.url;
export const MARK_URL = mark.url;

export const DOCUMENTS = [
  {
    title: "Certificate of Registration",
    description: "Issued 10 Sep 2025 under the Community Groups Registration Act, No. 30 of 2022.",
    type: "PDF",
    size: certificate.size,
    url: certificate.url,
  },
  {
    title: "Group Constitution",
    description: "Objectives, membership, leadership, finance, meetings and amendment rules.",
    type: "Word",
    size: constitution.size,
    url: constitution.url,
  },
  {
    title: "Minutes – Inaugural meeting",
    description: "17 Aug 2025 · Registration resolution, activities and election of officials.",
    type: "Word",
    size: minutes1.size,
    url: minutes1.url,
  },
  {
    title: "Minutes – Members' meeting",
    description: "5 Sep 2025 · Registration follow-up, clean-up review and bank account.",
    type: "Word",
    size: minutes2.size,
    url: minutes2.url,
  },
] as const;

export const CORE_ACTIVITIES = [
  "Community projects",
  "Community empowerment",
  "Community advocacy",
  "Environmental conservation",
  "Youth empowerment",
  "Skill development",
] as const;
