"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/lib/web3Context";
import {
  operationsService,
  StudentProgress,
  OperationsStats,
} from "@/lib/services/operationsService";
import { stakingService } from "@/lib/services/stakingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Users,
  TrendingUp,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";

interface OperationsTabProps {
  isVisible: boolean;
}

export default function OperationsTab({ isVisible }: OperationsTabProps) {
  const { account, isConnected } = useWeb3();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState<OperationsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editParticipation, setEditParticipation] = useState<string>("");
  const [isOperationsManager, setIsOperationsManager] = useState(false);

  useEffect(() => {
    if (isVisible && isConnected && account) {
      checkOperationsAccess();
      fetchOperationsData();
    }
  }, [isVisible, isConnected, account]);

  const checkOperationsAccess = () => {
    if (!account) {
      console.log("🔒 Operations Access Check: No account connected");
      return;
    }

    console.log("🔍 Checking operations access for address:", account);
    const hasAccess = operationsService.isOperationsManager(account);
    console.log("✅ Operations access result:", hasAccess);

    setIsOperationsManager(hasAccess);

    if (hasAccess) {
      console.log("🎉 User has operations manager access!");
    } else {
      console.log("❌ User does not have operations manager access");
      console.log(
        "💡 To add access, update OPERATIONS_WHITELIST in operationsService.ts"
      );
    }
  };

  const fetchOperationsData = async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      const [studentsData, statsData] = await Promise.all([
        operationsService.getAllStudents(),
        operationsService.getOperationsStats(),
      ]);
      setStudents(studentsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching operations data:", error);
      toast.error("Failed to load operations data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditParticipation = (
    studentAddress: string,
    currentParticipation: number
  ) => {
    setEditingStudent(studentAddress);
    setEditParticipation(currentParticipation.toString());
  };

  const handleSaveParticipation = async () => {
    if (!editingStudent || !editParticipation) return;

    const participation = parseInt(editParticipation);
    if (isNaN(participation) || participation < 0 || participation > 100) {
      toast.error("Participation must be between 0 and 100");
      return;
    }

    try {
      await operationsService.updateStudentParticipation(
        editingStudent,
        participation
      );
      toast.success("Participation updated successfully");
      setEditingStudent(null);
      setEditParticipation("");
      fetchOperationsData(); // Refresh data
    } catch (error) {
      console.error("Error updating participation:", error);
      toast.error("Failed to update participation");
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditParticipation("");
  };

  const handleManuallyUnstake = async (studentAddress: string) => {
    if (
      !confirm(
        "Are you sure you want to manually unstake this student? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await operationsService.manuallyUnstakeStudent(studentAddress);
      toast.success("Student manually unstaked successfully");
      fetchOperationsData(); // Refresh data
    } catch (error) {
      console.error("Error manually unstaking student:", error);
      toast.error("Failed to manually unstake student");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getParticipationColor = (participation: number) => {
    if (participation >= 80) return "bg-green-100 text-green-800";
    if (participation >= 60) return "bg-blue-100 text-blue-800";
    if (participation >= 40) return "bg-yellow-100 text-yellow-800";
    if (participation > 0) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  if (!isOperationsManager) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600">
          You don't have permission to access the operations panel.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading operations data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Operations Stats */}
      {stats && (
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Activity className="h-6 w-6 text-blue-600" />
              Book Club Operations Overview
            </CardTitle>
            <CardDescription>
              Real-time statistics and management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalStudents}
                </p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {stats.activeStudents}
                </p>
                <p className="text-sm text-gray-600">Active Students</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-2">
                  {parseFloat(stats.totalStakedAmount).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Total Staked (USDC)</p>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.averageParticipation}%
                </p>
                <p className="text-sm text-gray-600">Avg Participation</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-2">
                  {parseFloat(stats.totalRefundedAmount).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Total Refunded (USDC)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Users className="h-6 w-6 text-green-600" />
            Student Progress Management
          </CardTitle>
          <CardDescription>
            Manage student participation and manually unstake when necessary
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.address}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {formatAddress(student.address)}
                        </h4>
                        <Badge
                          variant={student.refunded ? "secondary" : "default"}
                        >
                          {student.refunded ? "Refunded" : "Active"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Staked Amount:</span>
                          <p className="font-medium">
                            {parseFloat(student.stakedAmount).toFixed(2)} USDC
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Participation:</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getParticipationColor(
                                student.participation
                              )}
                            >
                              {student.participation}%
                            </Badge>
                            {editingStudent === student.address ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editParticipation}
                                  onChange={(e) =>
                                    setEditParticipation(e.target.value)
                                  }
                                  className="w-20 h-8 text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={handleSaveParticipation}
                                  className="h-8 px-2"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-8 px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditParticipation(
                                    student.address,
                                    student.participation
                                  )
                                }
                                className="h-8 px-2"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="font-medium">
                            {student.refunded ? "Refunded" : "Active"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Actions:</span>
                          <div className="flex gap-2 mt-1">
                            {!student.refunded && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleManuallyUnstake(student.address)
                                }
                                className="h-8 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
