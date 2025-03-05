"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useWeb3 } from "@/lib/web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import PermissionControl from "@/components/auth/PermissionControl";
import { getUsernameByWalletAddress } from "@/lib/auth/userService";
import { v4 as uuidv4 } from "uuid";

interface WikiItem {
  id?: string;
  词条名称: string;
  "定义/解释/翻译校对": string;
  "来源Soucre / 章节 Chapter": string;
  Property?: string;
  "人工智能生成 AI-generated": boolean;
  Date?: string;
  "Last edited time"?: string;
  人工智能模型?: string | null;
  内容: string;
  Author: string;
  wallet_address?: string | null;
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
  const [formData, setFormData] = useState<WikiItem>({
    词条名称: "",
    "定义/解释/翻译校对": "",
    "来源Soucre / 章节 Chapter": "",
    "人工智能生成 AI-generated": false,
    内容: "",
    Author: "",
    人工智能模型: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);

  const { isAuthenticated, account } = useWeb3();

  useEffect(() => {
    if (wikiItem && isEdit) {
      setFormData(wikiItem);

      if (wikiItem.Author) {
        fetchAuthorUsername(wikiItem.Author);
      }
    }
  }, [wikiItem, isEdit]);

  useEffect(() => {
    if (account) {
      setFormData((prev) => ({
        ...prev,
        Author: account,
      }));
    }
  }, [account]);

  const fetchAuthorUsername = async (walletAddress: string) => {
    try {
      const username = await getUsernameByWalletAddress(walletAddress);
      setAuthorUsername(username);
    } catch (error) {
      console.error("Failed to fetch author username:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      "人工智能生成 AI-generated": checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !account) {
      setError("请先连接钱包并登录");
      return;
    }

    // 验证表单数据
    if (!formData.词条名称.trim()) {
      setError("词条名称不能为空");
      return;
    }

    if (!formData["定义/解释/翻译校对"].trim()) {
      setError("定义/解释/翻译校对不能为空");
      return;
    }

    if (!formData["来源Soucre / 章节 Chapter"].trim()) {
      setError("来源/章节不能为空");
      return;
    }

    // 确保使用钱包地址作为作者
    const authorAddress = account;

    if (!formData.内容.trim()) {
      setError("内容不能为空");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      // 确保数据格式与数据库匹配
      const formattedData = {
        id: formData.id || uuidv4(), // 如果没有ID，生成一个新的UUID
        词条名称: formData.词条名称,
        "定义/解释/翻译校对": formData["定义/解释/翻译校对"],
        "来源Soucre / 章节 Chapter": formData["来源Soucre / 章节 Chapter"],
        Author: authorAddress, // 使用钱包地址作为作者
        "人工智能生成 AI-generated": formData["人工智能生成 AI-generated"]
          ? "true"
          : "false",
        内容: formData.内容,
        人工智能模型: formData.人工智能模型,
        // 不包含 Property 和 wallet_address 字段，因为 SQL 插入语句中没有这些字段
      };

      if (isEdit && wikiItem?.id) {
        // 检查所有权
        if (
          wikiItem.wallet_address &&
          wikiItem.wallet_address.toLowerCase() !== account.toLowerCase()
        ) {
          setError("您没有权限编辑此条目");
          setIsLoading(false);
          return;
        }

        // 更新现有条目
        const { error } = await supabase
          .from("wiki")
          .update({
            ...formattedData,
            "Last edited time": now,
          })
          .eq("id", wikiItem.id);

        if (error) {
          console.error("Supabase 更新错误:", error);
          throw new Error(`更新失败: ${error.message}`);
        }
      } else {
        const { error } = await supabase.from("wiki").insert([
          {
            ...formattedData,
            Date: now,
            "Last edited time": now,
          },
        ]);

        if (error) {
          console.error("Supabase 插入错误:", error);
          throw new Error(`创建失败: ${error.message}`);
        }
      }

      setIsDialogOpen(false);
      if (onSave) onSave();
    } catch (err) {
      // 详细记录错误信息
      if (err instanceof Error) {
        console.error("Save wiki entry error:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
      } else {
        console.error("Save wiki entry error:", err);
      }

      // 设置用户友好的错误消息
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError("Save failed, please try again later");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerButton = isEdit ? (
    <Button variant="outline" size="icon" className="h-8 w-8">
      <Pencil className="h-4 w-4" />
    </Button>
  ) : (
    <Button variant="outline" className="flex items-center gap-2 bg-[#FCFADE]">
      <Plus className="h-4 w-4" /> Add New Entry
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <PermissionControl
        requireAuth={true}
        requireOwnership={isEdit}
        ownerAddress={wikiItem?.wallet_address}
      >
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      </PermissionControl>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Wiki Entry" : "Add New Wiki Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="词条名称">Wiki Entry Name</Label>
            <Input
              id="词条名称"
              name="词条名称"
              value={formData.词条名称}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="定义/解释/翻译校对">
              Definition/explanation/translation
            </Label>
            <Textarea
              id="定义/解释/翻译校对"
              name="定义/解释/翻译校对"
              value={formData["定义/解释/翻译校对"]}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="来源Soucre / 章节 Chapter">Source/chapter</Label>
            <Input
              id="来源Soucre / 章节 Chapter"
              name="来源Soucre / 章节 Chapter"
              value={formData["来源Soucre / 章节 Chapter"]}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="内容">Content</Label>
            <Textarea
              id="内容"
              name="内容"
              value={formData.内容}
              onChange={handleChange}
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="人工智能生成 AI-generated"
              checked={formData["人工智能生成 AI-generated"]}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="人工智能生成 AI-generated">AI-generated</Label>
          </div>

          {formData["人工智能生成 AI-generated"] && (
            <div className="space-y-2">
              <Label htmlFor="人工智能模型">AI model</Label>
              <Input
                id="人工智能模型"
                name="人工智能模型"
                value={formData.人工智能模型 || ""}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="Author">Author</Label>
            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
              {account ? account : "Please connect your wallet"}
            </p>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                if (onCancel) onCancel();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateWikiButton({ onSave }: { onSave?: () => void }) {
  return <WikiEditor onSave={onSave} />;
}

export function EditWikiButton({
  wikiItem,
  onSave,
}: {
  wikiItem: WikiItem;
  onSave?: () => void;
}) {
  return <WikiEditor wikiItem={wikiItem} isEdit={true} onSave={onSave} />;
}

export function WikiEditorContent({
  wikiItem,
  onSave,
}: {
  wikiItem: WikiItem;
  onSave?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSave) onSave();
      }}
      className="space-y-4 mt-4"
    >
      <div className="space-y-2">
        <Label htmlFor="词条名称">Wiki Entry Name</Label>
        <Input
          id="词条名称"
          name="词条名称"
          defaultValue={wikiItem.词条名称}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="定义/解释/翻译校对">
          Definition/explanation/translation
        </Label>
        <Textarea
          id="定义/解释/翻译校对"
          name="定义/解释/翻译校对"
          defaultValue={wikiItem["定义/解释/翻译校对"]}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="来源Soucre / 章节 Chapter">Source/chapter</Label>
        <Input
          id="来源Soucre / 章节 Chapter"
          name="来源Soucre / 章节 Chapter"
          defaultValue={wikiItem["来源Soucre / 章节 Chapter"]}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="人工智能生成 AI-generated"
          name="人工智能生成 AI-generated"
          defaultChecked={wikiItem["人工智能生成 AI-generated"]}
        />
        <Label htmlFor="人工智能生成 AI-generated">AI Generated</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="内容">Content</Label>
        <Textarea
          id="内容"
          name="内容"
          defaultValue={wikiItem.内容}
          className="min-h-[200px]"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" className="bg-black text-white hover:bg-black/70">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
