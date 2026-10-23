import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContact = {
  email: string;
  phone: string;
  address: string;
  postal: string;
  hours: string;
};

export const DEFAULT_CONTACT: SiteContact = {
  email: "leapgeneration01@gmail.com",
  phone: "0707781307",
  address: "Kevote Market Grounds, near St Paul's Kevote Catholic Church, Runyenjes, Embu County",
  postal: "P.O. Box 24-60100, Embu",
  hours: "Mon – Sat, 8:00am – 5:00pm",
};

export type SiteHome = { headline: string; intro: string };
export const DEFAULT_HOME: SiteHome = {
  headline: "Youth-powered. Community-led. A bold leap toward a brighter future.",
  intro:
    "L.E.A.P. Generation is a registered community-based organisation in Embu County, Kenya, empowering young people with knowledge, skills, confidence and opportunities to build stronger, sustainable communities.",
};

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `tel:+254${digits.slice(1)}` : `tel:+${digits}`;
}

export function useSiteContent<T extends object>(key: string, defaults: T) {
  return useQuery({
    queryKey: ["site_content", key],
    queryFn: async (): Promise<T> => {
      const { data } = await supabase.from("site_content").select("data").eq("key", key).maybeSingle();
      return { ...defaults, ...((data?.data as Partial<T> | null) ?? {}) };
    },
    placeholderData: defaults,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
