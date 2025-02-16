"use client";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BookclubData {
  id: number;
  season: string;
  title: string;
  people: string;
  description: string;
}

interface ContentProps {
  selectedData?: BookclubData | null;
}

export default function Content({ selectedData }: ContentProps) {
  const [content, setContent] = useState<BookclubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If selectedData is provided, use it directly
    if (selectedData) {
      setContent(selectedData);
      setLoading(false);
      return;
    }

    // Otherwise fetch the first record as default
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from("bookclub")
          .select("*")
          .order("month", { ascending: true })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setContent(data[0]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [selectedData]);

  if (loading) return <div>loading...</div>;
  if (!content) return <div>no content</div>;

  return (
    <div className="mr-20 mt-20 w-[25%] h-[70%] text-right">
      <h3 className="w-1/2 border border-black rounded-full p-2 text-center text-xl mt-20 ml-auto">
        {content.season}
      </h3>
      <h1 className="text-4xl font-bold mt-5">{content.title}</h1>
      <p className="text-2xl mt-6">Guest: {content.people}</p>
      <p className="mt-4 mb-6">{content.description}</p>
      <a href="/join" className="text-black text-xl font-bold flex justify-end">
        Sign Up to Join <ArrowRight className="ml-2" />
      </a>
    </div>
  );
}
