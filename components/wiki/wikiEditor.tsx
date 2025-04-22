"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useWeb3 } from "@/lib/web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { getUsernameByWalletAddress } from "@/lib/auth/userService";
import { WikiItem } from "./types";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormValues {
  id: string;
  title: string;
  content: string;
  contentType: string;
  chapter: string;
  bookTitle: string;
  page: string;
  aiGenerated: boolean;
  aiModel: string;
}

interface WikiEditorProps {
  wikiItem?: WikiItem | null;
  isEdit?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function WikiEditor({
  wikiItem,
  isEdit = false,
  onSave,
  onCancel,
}: WikiEditorProps) {
  const defaultFormValues: FormValues = {
    id: wikiItem?.id || "",
    title: wikiItem?.["Wiki Name"] || "",
    content: wikiItem?.["Content"] || "",
    contentType: wikiItem?.["Content Type"] || "One Line",
    chapter: wikiItem?.["Chapter"] || "",
    bookTitle: wikiItem?.["Book Title / DOI / Website"] || "",
    page: wikiItem?.["Page"] || "",
    aiGenerated: wikiItem?.["AI-generated"] || false,
    aiModel: wikiItem?.["AI model"] || "",
  };

  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);
  const { account } = useWeb3();

  useEffect(() => {
    if (wikiItem) {
      setFormValues({
        id: wikiItem.id || "",
        title: wikiItem["Wiki Name"] || "",
        content: wikiItem["Content"] || "",
        contentType: wikiItem["Content Type"] || "One Line",
        chapter: wikiItem["Chapter"] || "",
        bookTitle: wikiItem["Book Title / DOI / Website"] || "",
        page: wikiItem["Page"] || "",
        aiGenerated: wikiItem["AI-generated"] || false,
        aiModel: wikiItem["AI model"] || "",
      });

      if (wikiItem["Editor"]) {
        fetchAuthorUsername(wikiItem["Editor"]);
      }
    }
  }, [wikiItem]);

  const fetchAuthorUsername = async (walletAddress: string) => {
    try {
      const username = await getUsernameByWalletAddress(walletAddress);
      setAuthorUsername(username);
    } catch (error) {
      console.error("Failed to fetch author username:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      aiGenerated: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      const now = new Date().toISOString();
      const username = await getUsernameByWalletAddress(account);

      const wikiData: Record<string, any> = {
        ...(formValues.id ? { id: formValues.id } : {}),
        "Wiki Name": formValues.title,
        Content: formValues.content,
        "Content Type": formValues.contentType,
        Chapter: formValues.chapter,
        Editor: account,
        "AI-generated": formValues.aiGenerated,
        "Book Title / DOI / Website": formValues.bookTitle || null,
        Page: formValues.page || null,
        Username: username,
        "Last edited time": now,
      };

      if (!isEdit) {
        wikiData["Date"] = now;
      }

      if (formValues.aiGenerated && formValues.aiModel) {
        wikiData["AI model"] = formValues.aiModel;
      }

      let { data, error: supabaseError } = isEdit
        ? await supabase
            .from("wiki")
            .update(wikiData)
            .eq("id", formValues.id)
            .select()
        : await supabase.from("wiki").insert([wikiData]).select();

      if (supabaseError) {
        console.error("Error saving wiki item:", supabaseError);
        toast.error(
          `Failed to ${isEdit ? "update" : "create"} wiki item: ${
            supabaseError.message
          }`
        );
        return;
      }

      toast.success(
        `Wiki item ${isEdit ? "updated" : "created"} successfully!`
      );
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving wiki item:", error);
      toast.error(
        `Failed to ${isEdit ? "update" : "create"} wiki item: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="text-black rounded-lg p-10 w-full mx-auto"
      style={{ position: "relative" }}
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Wiki Entry" : "Create Wiki Entry"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 " style={{ maxHeight: "calc(80vh - 100px)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bookTitle">Book Title / DOI / Website</Label>
              <Input
                id="bookTitle"
                name="bookTitle"
                value={formValues.bookTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Wiki Title</Label>
              <Input
                id="title"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={formValues.contentType}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    contentType: value as string,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One Line">One Line</SelectItem>
                  <SelectItem value="Paragraph">Paragraph</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Input
                id="chapter"
                name="chapter"
                value={formValues.chapter}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page">Page</Label>
              <Input
                id="page"
                name="page"
                type="text"
                value={formValues.page}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formValues.content}
              onChange={handleChange}
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-between">
            <div className="">
              <div className="space-x-2">
                <Checkbox
                  id="aiGenerated"
                  checked={formValues.aiGenerated}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="aiGenerated">AI-generated</Label>
              </div>
              <div className="flex space-x-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (onCancel) onCancel();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            {formValues.aiGenerated && (
              <div className="space-y-1 mt-2 grid">
                <Label htmlFor="aiModel">AI model</Label>
                <Input
                  id="aiModel"
                  name="aiModel"
                  value={formValues.aiModel}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export function CreateWikiButton({ onSave }: { onSave?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Create Wiki Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
        <div className="p-0 overflow-visible">
          <WikiEditor
            onSave={() => {
              setIsOpen(false);
              if (onSave) onSave();
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditWikiButton({
  wikiItem,
  onSave,
}: {
  wikiItem: WikiItem;
  onSave?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Edit size={14} /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Wiki Entry</DialogTitle>
        </DialogHeader>
        <div className="p-0 overflow-visible">
          <WikiEditor
            wikiItem={wikiItem}
            isEdit={true}
            onSave={() => {
              setIsOpen(false);
              if (onSave) onSave();
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WikiEditorContent({
  wikiItem,
  onSave,
}: {
  wikiItem: WikiItem;
  onSave?: () => void;
}) {
  return (
    <div className="p-4">
      <WikiEditor wikiItem={wikiItem} isEdit={!!wikiItem.id} onSave={onSave} />
    </div>
  );
}
