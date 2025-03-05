"use client";

import { useState } from "react";
import { useWeb3 } from "@/lib/web3Context";
import { createBookclubReview } from "@/lib/services/userContent";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  onSuccess,
}: AddReviewModalProps) {
  const { user, account } = useWeb3();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !account) {
      toast.error("请先连接钱包");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }

    try {
      setIsSubmitting(true);
      await createBookclubReview(user.id, account, title, content);
      toast.success("评论创建成功");
      setTitle("");
      setContent("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("创建评论失败:", error);
      toast.error("创建评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加读书评论</DialogTitle>
          <DialogDescription>分享你对书籍的见解和感受</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入评论标题"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入评论内容"
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : "提交"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
