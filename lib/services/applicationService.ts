"use server";

import { supabase } from "@/lib/supabaseClient";
import { logger } from "@/lib/logger";

export interface BookClubApplication {
  id?: string;
  name: string;
  email: string;
  selected_book: string;
  book_name?: string;
  expected_read_weeks?: number;
  recommendation?: string;
  status?: "pending" | "approved" | "rejected" | "waitlisted";
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function submitApplication(
  application: Omit<
    BookClubApplication,
    "id" | "status" | "created_at" | "updated_at"
  >
): Promise<{
  success: boolean;
  error?: string;
  application?: BookClubApplication;
}> {
  try {
    const { data, error } = await supabase
      .from("recommendation")
      .insert([application])
      .select()
      .single();

    if (error) {
      logger.error("Failed to submit application", error);
      return { success: false, error: "Failed to submit application" };
    }

    // Send notification email to community manager
    await sendApplicationNotificationEmail(data);

    logger.info("Application submitted successfully", { id: data.id });
    return { success: true, application: data };
  } catch (error) {
    logger.error("Error submitting application", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getAllApplications(): Promise<{
  success: boolean;
  applications?: BookClubApplication[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("recommendation")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch applications", error);
      return { success: false, error: "Failed to fetch applications" };
    }

    return { success: true, applications: data || [] };
  } catch (error) {
    logger.error("Error fetching applications", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: BookClubApplication["status"],
  admin_notes?: string,
  reviewed_by?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };

    if (admin_notes) updateData.admin_notes = admin_notes;
    if (reviewed_by) updateData.reviewed_by = reviewed_by;

    const { error } = await supabase
      .from("recommendation")
      .update(updateData)
      .eq("id", id);

    if (error) {
      logger.error("Failed to update application status", error);
      return { success: false, error: "Failed to update application status" };
    }

    logger.info("Application status updated", { id, status });
    return { success: true };
  } catch (error) {
    logger.error("Error updating application status", error);
    return { success: false, error: "Internal server error" };
  }
}

// Email notification function
async function sendApplicationNotificationEmail(
  application: BookClubApplication
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, just log the application - you can add email functionality later
    logger.info("New application received", {
      id: application.id,
      name: application.name,
      email: application.email,
      selectedBook: application.selected_book,
      book: application.book_name,
    });

    return { success: true };
  } catch (error) {
    logger.error("Error sending application notification", error);
    return { success: false, error: "Failed to send notification" };
  }
}
