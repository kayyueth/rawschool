"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
}

export interface ApplicationFormData {
  name: string;
  email: string;
  bookName: string;
  expectedReadWeeks: string;
  recommendation: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    bookName: "",
    expectedReadWeeks: "",
    recommendation: "",
  });

  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ApplicationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.bookName.trim()) {
      newErrors.bookName = "Book name is required";
    }

    if (!formData.expectedReadWeeks.trim()) {
      newErrors.expectedReadWeeks = "Expected read weeks is required";
    } else if (
      isNaN(Number(formData.expectedReadWeeks)) ||
      Number(formData.expectedReadWeeks) <= 0
    ) {
      newErrors.expectedReadWeeks = "Please enter a valid number of weeks";
    }

    if (!formData.recommendation.trim()) {
      newErrors.recommendation = "Recommendation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        email: "",
        bookName: "",
        expectedReadWeeks: "",
        recommendation: "",
      });
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (
    field: keyof ApplicationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Join Our Book Club
          </DialogTitle>
          <DialogDescription className="text-base">
            Apply to join our peer-to-peer book club. Please fill out the form
            below with your information and book recommendation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Book Recommendation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Book Recommendation
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookName" className="text-sm font-medium">
                  Book Title *
                </Label>
                <Input
                  id="bookName"
                  type="text"
                  placeholder="Enter the book title and author"
                  value={formData.bookName}
                  onChange={(e) =>
                    handleInputChange("bookName", e.target.value)
                  }
                  className={errors.bookName ? "border-red-500" : ""}
                />
                {errors.bookName && (
                  <p className="text-sm text-red-500">{errors.bookName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expectedReadWeeks"
                  className="text-sm font-medium"
                >
                  Expected Reading Time (Weeks) *
                </Label>
                <Input
                  id="expectedReadWeeks"
                  type="number"
                  min="1"
                  max="52"
                  placeholder="e.g., 4"
                  value={formData.expectedReadWeeks}
                  onChange={(e) =>
                    handleInputChange("expectedReadWeeks", e.target.value)
                  }
                  className={errors.expectedReadWeeks ? "border-red-500" : ""}
                />
                {errors.expectedReadWeeks && (
                  <p className="text-sm text-red-500">
                    {errors.expectedReadWeeks}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  How many weeks do you think this book would take to read and
                  discuss?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation" className="text-sm font-medium">
                  Why do you recommend this book? *
                </Label>
                <Textarea
                  id="recommendation"
                  placeholder="Tell us why this book would be valuable for our book club discussion. What themes, ideas, or perspectives does it offer?"
                  value={formData.recommendation}
                  onChange={(e) =>
                    handleInputChange("recommendation", e.target.value)
                  }
                  className={`min-h-[120px] ${
                    errors.recommendation ? "border-red-500" : ""
                  }`}
                />
                {errors.recommendation && (
                  <p className="text-sm text-red-500">
                    {errors.recommendation}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Share your thoughts on why this book would contribute to
                  meaningful discussions.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-black text-white hover:bg-black/90"
            >
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
