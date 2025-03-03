"use client";

import { ReactNode } from "react";
import { useWeb3 } from "@/lib/web3Context";

interface PermissionControlProps {
  children: ReactNode;
  ownerAddress?: string | null;
  requireAuth?: boolean;
  requireOwnership?: boolean;
}

/**
 * 权限控制组件
 *
 * @param children - 子组件
 * @param ownerAddress - 内容所有者的钱包地址（用于所有权检查）
 * @param requireAuth - 是否需要认证（默认：true）
 * @param requireOwnership - 是否需要所有权（默认：false）
 */
export default function PermissionControl({
  children,
  ownerAddress,
  requireAuth = true,
  requireOwnership = false,
}: PermissionControlProps) {
  const { isConnected, isAuthenticated, account } = useWeb3();

  // 检查认证状态
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // 检查所有权
  if (requireOwnership && ownerAddress) {
    const isOwner =
      account && account.toLowerCase() === ownerAddress.toLowerCase();

    if (!isOwner) {
      return null;
    }
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>;
}

/**
 * 创建按钮组件
 * 仅对已认证用户显示
 */
export function CreateButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <PermissionControl requireAuth={true} requireOwnership={false}>
      {children}
    </PermissionControl>
  );
}

/**
 * 编辑按钮组件
 * 仅对内容所有者显示
 */
export function EditButton({
  children,
  ownerAddress,
  onClick,
}: {
  children: ReactNode;
  ownerAddress: string;
  onClick: () => void;
}) {
  return (
    <PermissionControl
      requireAuth={true}
      requireOwnership={true}
      ownerAddress={ownerAddress}
    >
      {children}
    </PermissionControl>
  );
}

/**
 * 删除按钮组件
 * 仅对内容所有者显示
 */
export function DeleteButton({
  children,
  ownerAddress,
  onClick,
}: {
  children: ReactNode;
  ownerAddress: string;
  onClick: () => void;
}) {
  return (
    <PermissionControl
      requireAuth={true}
      requireOwnership={true}
      ownerAddress={ownerAddress}
    >
      {children}
    </PermissionControl>
  );
}
