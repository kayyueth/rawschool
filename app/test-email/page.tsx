"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [isTestingBasic, setIsTestingBasic] = useState(false);
  const [isTestingVerification, setIsTestingVerification] = useState(false);
  const [testResults, setTestResults] = useState<{
    basic?: any;
    verification?: any;
  }>({});

  const testBasicEmail = async () => {
    setIsTestingBasic(true);
    try {
      const response = await fetch("/api/test-email-debug", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Basic email test successful!");
        setTestResults((prev) => ({ ...prev, basic: data }));
      } else {
        toast.error(`Basic email test failed: ${data.error}`);
        setTestResults((prev) => ({ ...prev, basic: data }));
      }
    } catch (error) {
      toast.error("Basic email test failed");
      console.error("Basic email test error:", error);
    } finally {
      setIsTestingBasic(false);
    }
  };

  const testEmailVerification = async () => {
    setIsTestingVerification(true);
    try {
      const response = await fetch("/api/test-email-verification", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email test successful!");
        setTestResults((prev) => ({ ...prev, verification: data }));
      } else {
        toast.error(`Verification email test failed: ${data.error}`);
        setTestResults((prev) => ({ ...prev, verification: data }));
      }
    } catch (error) {
      toast.error("Verification email test failed");
      console.error("Verification email test error:", error);
    } finally {
      setIsTestingVerification(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Service Testing</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Email Test */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Email Test</CardTitle>
              <CardDescription>
                Test basic email sending functionality with your new domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testBasicEmail}
                disabled={isTestingBasic}
                className="w-full"
              >
                {isTestingBasic ? "Testing..." : "Test Basic Email"}
              </Button>

              {testResults.basic && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-semibold mb-2">Result:</h4>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(testResults.basic, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Verification Test */}
          <Card>
            <CardHeader>
              <CardTitle>Email Verification Test</CardTitle>
              <CardDescription>
                Test the complete email verification flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testEmailVerification}
                disabled={isTestingVerification}
                className="w-full"
              >
                {isTestingVerification
                  ? "Testing..."
                  : "Test Email Verification"}
              </Button>

              {testResults.verification && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-semibold mb-2">Result:</h4>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(testResults.verification, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Click "Test Basic Email" to verify your new domain can send
                emails
              </li>
              <li>
                Check your email (yukiyukaiyue@gmail.com) for the test message
              </li>
              <li>
                Click "Test Email Verification" to test the full verification
                flow
              </li>
              <li>
                Check your email for the verification message with the styled
                template
              </li>
              <li>
                If both tests pass, your email verification system is working
                correctly
              </li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The verification test will send a real
                verification email with a test token. You can click the
                verification link to test the verification page, though it won't
                actually verify anything since it's a test token.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
