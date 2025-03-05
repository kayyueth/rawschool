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

  const { isAuthenticated, account } = useWeb3();

  useEffect(() => {
    if (wikiItem && isEdit) {
      setFormData(wikiItem);
    }
  }, [wikiItem, isEdit]);

  // 当用户连接钱包时，自动设置 Author 为钱包地址
  useEffect(() => {
    if (account) {
      setFormData((prev) => ({
        ...prev,
        Author: account,
      }));
    }
  }, [account]);

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
        id: formData.id, // 保留 ID（如果有）
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
        // 创建新条目
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
        console.error("保存 Wiki 条目时出错:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
      } else {
        console.error("保存 Wiki 条目时出错:", err);
      }

      // 设置用户友好的错误消息
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError("保存失败，请稍后重试");
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
            <Label htmlFor="词条名称">词条名称</Label>
            <Input
              id="词条名称"
              name="词条名称"
              value={formData.词条名称}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="定义/解释/翻译校对">定义/解释/翻译校对</Label>
            <Textarea
              id="定义/解释/翻译校对"
              name="定义/解释/翻译校对"
              value={formData["定义/解释/翻译校对"]}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="来源Soucre / 章节 Chapter">来源/章节</Label>
            <Input
              id="来源Soucre / 章节 Chapter"
              name="来源Soucre / 章节 Chapter"
              value={formData["来源Soucre / 章节 Chapter"]}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="内容">内容</Label>
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
            <Label htmlFor="人工智能生成 AI-generated">人工智能生成</Label>
          </div>

          {formData["人工智能生成 AI-generated"] && (
            <div className="space-y-2">
              <Label htmlFor="人工智能模型">人工智能模型</Label>
              <Input
                id="人工智能模型"
                name="人工智能模型"
                value={formData.人工智能模型 || ""}
                onChange={handleChange}
              />
            </div>
          )}

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
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
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
