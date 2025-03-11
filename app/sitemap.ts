import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://raw-visual.vercel.app";

  // Define your static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  try {
    // Fetch bookclub data
    const { data: bookclubData, error: bookclubError } = await supabase
      .from("bookclub")
      .select("id, updated_at")
      .order("id");

    if (bookclubError) {
      console.error("Error fetching bookclub data for sitemap:", bookclubError);
    } else if (bookclubData) {
      // Add bookclub entries to sitemap
      bookclubData.forEach((book) => {
        routes.push({
          url: `${baseUrl}?book=${book.id}`,
          lastModified: new Date(book.updated_at || new Date()),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        });
      });
    }

    // Fetch wiki data if available
    // This is a placeholder - adjust according to your actual database structure
    const { data: wikiData, error: wikiError } = await supabase
      .from("wiki")
      .select("id, title, updated_at")
      .order("id");

    if (wikiError) {
      console.error("Error fetching wiki data for sitemap:", wikiError);
    } else if (wikiData) {
      // Add wiki entries to sitemap
      wikiData.forEach((wiki) => {
        routes.push({
          url: `${baseUrl}?wiki=${encodeURIComponent(wiki.title)}`,
          lastModified: new Date(wiki.updated_at || new Date()),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return routes;
}
