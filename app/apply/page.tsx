"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ApplicationFormData {
  name: string;
  email: string;
  selectedBook: string;
  bookName: string;
  expectedReadWeeks: string;
  recommendation: string;
}

export default function ApplyPage() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    selectedBook: "",
    bookName: "",
    expectedReadWeeks: "",
    recommendation: "",
  });

  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.selectedBook.trim()) {
      newErrors.selectedBook = "Please select a book";
    }

    // Book recommendation fields are now optional
    if (
      formData.bookName.trim() &&
      (isNaN(Number(formData.expectedReadWeeks)) ||
        Number(formData.expectedReadWeeks) <= 0)
    ) {
      newErrors.expectedReadWeeks = "Please enter a valid number of weeks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          selectedBook: formData.selectedBook,
          bookName: formData.bookName,
          expectedReadWeeks: formData.expectedReadWeeks,
          recommendation: formData.recommendation,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      console.log("Application submitted successfully:", result);
      alert("Application submitted successfully! We'll be in touch soon.");

      // Reset form
      setFormData({
        name: "",
        email: "",
        selectedBook: "",
        bookName: "",
        expectedReadWeeks: "",
        recommendation: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFADE] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Join Raw School Bookclub
          </h1>
          <p className="text-lg text-gray-700">
            Apply to join our peer-to-peer book club. Please fill out the form
            below with your information and book recommendation.
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl text-black">
              Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`border-2 border-gray-300 focus:border-black ${
                        errors.name ? "border-red-500" : ""
                      }`}
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`border-2 border-gray-300 focus:border-black ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selectedBook" className="text-sm font-medium">
                    Select Book to Join *
                  </Label>
                  <select
                    id="selectedBook"
                    value={formData.selectedBook}
                    onChange={(e) =>
                      handleInputChange("selectedBook", e.target.value)
                    }
                    className={`w-full p-3 border-2 border-gray-300 focus:border-black rounded-md bg-white ${
                      errors.selectedBook ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Choose a book...</option>
                    <option value="《P2P共有资源宣言》米歇尔、瓦西里斯、亚历克斯">
                      《P2P共有资源宣言》米歇尔、瓦西里斯、亚历克斯
                    </option>
                    <option value="《货币的非国家化》弗里德里希·哈耶克">
                      《货币的非国家化》弗里德里希·哈耶克
                    </option>
                    <option value="《债:第一个5000年》大卫·格雷伯">
                      《债:第一个5000年》大卫·格雷伯
                    </option>
                    <option value="《The Bitcoin Standard: The decentralized Alternative to Central Banking》Saifedean Ammous">
                      《The Bitcoin Standard: The decentralized Alternative to
                      Central Banking》Saifedean Ammous
                    </option>
                    <option value="《Cypherpunk Ethics: Radical Ethics for the Digital Age》Patrick D. Anderson">
                      《Cypherpunk Ethics: Radical Ethics for the Digital
                      Age》Patrick D. Anderson
                    </option>
                    <option value="《Tokens: The future of money in the age of the platform》Rachel O'Dwyer">
                      《Tokens: The future of money in the age of the
                      platform》Rachel O'Dwyer
                    </option>
                    <option value="《Blockchain Radicals: How capitalism ruined crypto and how to fix it》Joshua Dávila">
                      《Blockchain Radicals: How capitalism ruined crypto and
                      how to fix it》Joshua Dávila
                    </option>
                  </select>
                  {errors.selectedBook && (
                    <p className="text-sm text-red-500">
                      {errors.selectedBook}
                    </p>
                  )}
                </div>
              </div>

              {/* Book Recommendation Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Book Recommendation (Optional)
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookName" className="text-sm font-medium">
                      Book Title
                    </Label>
                    <Input
                      id="bookName"
                      type="text"
                      placeholder="Enter the book title and author"
                      value={formData.bookName}
                      onChange={(e) =>
                        handleInputChange("bookName", e.target.value)
                      }
                      className={`border-2 border-gray-300 focus:border-black ${
                        errors.bookName ? "border-red-500" : ""
                      }`}
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
                      Expected Reading Time (Weeks)
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
                      className={`border-2 border-gray-300 focus:border-black ${
                        errors.expectedReadWeeks ? "border-red-500" : ""
                      }`}
                    />
                    {errors.expectedReadWeeks && (
                      <p className="text-sm text-red-500">
                        {errors.expectedReadWeeks}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      How many weeks do you think this book would take to read
                      and discuss?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="recommendation"
                      className="text-sm font-medium"
                    >
                      Why do you recommend this book?
                    </Label>
                    <Textarea
                      id="recommendation"
                      placeholder="Tell us why this book would be valuable for our book club discussion. What themes, ideas, or perspectives does it offer?"
                      value={formData.recommendation}
                      onChange={(e) =>
                        handleInputChange("recommendation", e.target.value)
                      }
                      className={`min-h-[120px] border-2 border-gray-300 focus:border-black resize-none ${
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

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-black/90 px-8 py-3 text-lg font-semibold border-2 border-black hover:border-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-2 border-black text-black hover:bg-black hover:text-white"
          >
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
