import { Response } from "express";

export const handleError = (res: Response, error: any, customMessage?: string) => {
  console.error("Error:", error);

  const message = error.message || customMessage || "Internal server error";

  // Handle specific error types
  if (message.includes("not found")) {
    return res.status(404).json({
      success: false,
      message
    });
  }

  if (message.includes("Forbidden") || message.includes("only")) {
    return res.status(403).json({
      success: false,
      message
    });
  }

  if (message.includes("required") || message.includes("Insufficient") || message.includes("empty")) {
    return res.status(400).json({
      success: false,
      message
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};
