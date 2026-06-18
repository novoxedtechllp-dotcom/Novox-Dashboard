import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { askRagBot } from "../services/rag.service.js";

const askQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question) {
    throw new ApiError(400, "Question is required");
  }

  // Assuming req.user contains the authenticated user's details
  const userRole = req.user?.role || 'UNKNOWN';
  
  if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
    throw new ApiError(403, "You do not have permission to use the RAG bot.");
  }

  try {
    const answer = await askRagBot(question, userRole);
    
    return res.status(200).json(
      new ApiResponse(200, { answer }, "Question answered successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message || "An error occurred while answering the question.");
  }
});

export { askQuestion };
