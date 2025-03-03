"use client";

import { ethers } from "ethers";

/**
 * 创建签名消息
 */
export function createSignMessage(address: string, nonce: string): string {
  return `请签名此消息以验证您是钱包地址 ${address} 的所有者。\n\n随机码: ${nonce}\n\n此签名不会花费任何gas费用。`;
}

/**
 * 验证签名
 */
export function verifySignature(
  message: string,
  signature: string,
  address: string
): boolean {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("签名验证失败", error);
    return false;
  }
}
