import { ethers } from "ethers";
import { stakingService } from "./stakingService";

// Operations whitelist - addresses that have operations access
const OPERATIONS_WHITELIST = [
  // Add operation manager addresses here
  "0x1BaC47611FACa45E540F1c07c27bFEfD03bCEd16",
];

// Normalized whitelist for case-insensitive comparison
const NORMALIZED_WHITELIST = OPERATIONS_WHITELIST.map((addr) =>
  addr.toLowerCase()
);

export interface StudentProgress {
  address: string;
  username?: string;
  stakedAmount: string;
  participation: number;
  refunded: boolean;
  stakeTime: number;
}

export interface OperationsStats {
  totalStudents: number;
  totalStakedAmount: string;
  totalRefundedAmount: string;
  activeStudents: number;
  averageParticipation: number;
}

export class OperationsService {
  private static instance: OperationsService;

  private constructor() {}

  public static getInstance(): OperationsService {
    if (!OperationsService.instance) {
      OperationsService.instance = new OperationsService();
    }
    return OperationsService.instance;
  }

  /**
   * Check if the given address has operations access
   */
  public isOperationsManager(address: string): boolean {
    if (!address) {
      console.log("🔒 OperationsService: No address provided");
      return false;
    }

    const normalizedAddress = address.toLowerCase();
    console.log("🔍 OperationsService: Checking address:", normalizedAddress);
    console.log(
      "📋 OperationsService: Current whitelist:",
      OPERATIONS_WHITELIST
    );
    console.log(
      "🔧 OperationsService: Normalized whitelist:",
      NORMALIZED_WHITELIST
    );

    const hasAccess = NORMALIZED_WHITELIST.includes(normalizedAddress);
    console.log("✅ OperationsService: Access result:", hasAccess);

    return hasAccess;
  }

  /**
   * Get the current operations whitelist (for debugging)
   */
  public getWhitelist(): string[] {
    return [...OPERATIONS_WHITELIST];
  }

  /**
   * Get all students with their progress information
   */
  public async getAllStudents(): Promise<StudentProgress[]> {
    try {
      const stakers = await stakingService.getAllStakers();

      return stakers.map((staker) => ({
        address: staker.address,
        stakedAmount: staker.amount,
        participation: staker.participation,
        refunded: staker.refunded,
        stakeTime: 0, // This would need to be fetched separately if needed
      }));
    } catch (error) {
      console.error("Error fetching all students:", error);
      throw error;
    }
  }

  /**
   * Update a student's participation percentage
   */
  public async updateStudentParticipation(
    studentAddress: string,
    participation: number
  ): Promise<void> {
    try {
      if (participation < 0 || participation > 100) {
        throw new Error("Participation must be between 0 and 100");
      }

      await stakingService.setParticipation(studentAddress, participation);
    } catch (error) {
      console.error("Error updating student participation:", error);
      throw error;
    }
  }

  /**
   * Update multiple students' participation percentages
   */
  public async updateMultipleStudentsParticipation(
    updates: { address: string; participation: number }[]
  ): Promise<void> {
    try {
      const addresses = updates.map((update) => update.address);
      const participations = updates.map((update) => update.participation);

      // Validate participations
      for (const participation of participations) {
        if (participation < 0 || participation > 100) {
          throw new Error("Participation must be between 0 and 100");
        }
      }

      await stakingService.setMultipleParticipation(addresses, participations);
    } catch (error) {
      console.error("Error updating multiple students participation:", error);
      throw error;
    }
  }

  /**
   * Manually unstake a student's tuition (emergency function)
   */
  public async manuallyUnstakeStudent(studentAddress: string): Promise<void> {
    try {
      // This would require a new contract function or using existing admin functions
      // For now, we'll use the emergency update function to mark as refunded
      await stakingService.emergencyUpdateStake(
        studentAddress,
        0, // Set amount to 0
        0, // Set participation to 0
        true // Mark as refunded
      );
    } catch (error) {
      console.error("Error manually unstaking student:", error);
      throw error;
    }
  }

  /**
   * Get operations statistics
   */
  public async getOperationsStats(): Promise<OperationsStats> {
    try {
      const students = await this.getAllStudents();
      const contractStats = await stakingService.getContractStats();

      const totalStudents = students.length;
      const activeStudents = students.filter((s) => !s.refunded).length;
      const totalStakedAmount = contractStats.totalStaked;
      const totalRefundedAmount = contractStats.totalRefunded;

      const totalParticipation = students.reduce(
        (sum, student) => sum + student.participation,
        0
      );
      const averageParticipation =
        totalStudents > 0 ? totalParticipation / totalStudents : 0;

      return {
        totalStudents,
        totalStakedAmount,
        totalRefundedAmount,
        activeStudents,
        averageParticipation: Math.round(averageParticipation),
      };
    } catch (error) {
      console.error("Error fetching operations stats:", error);
      throw error;
    }
  }
}

export const operationsService = OperationsService.getInstance();
