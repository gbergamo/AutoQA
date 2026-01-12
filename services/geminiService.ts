import { GoogleGenAI, Type } from "@google/genai";
import { TestConfig, TestResult, TestStep, TestReport } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export const generateTestPlan = async (config: TestConfig): Promise<TestResult> => {
  const prompt = `
    You are an expert QA Automation Engineer. 
    Create a comprehensive automated test plan for the website found at: ${config.url}.
    
    Since the DOM source is not provided, you must generate a robust Playwright (TypeScript) script that uses resilient selector strategies (Accessibility roles, text labels, ARIA attributes).
    
    User requirements:
    1. **Authentication & Session**: If authentication is required (User provided: ${config.auth.requiresAuth}), perform the login action FIRST using username: "${config.auth.username || 'TEST_USER'}" and password: "${config.auth.password || 'TEST_PASS'}". Ensure the test script waits for the login to complete and the session to be established before proceeding.
    
    2. **Feature Discovery & Isolation**: 
       - **Identify Features**: Based on the URL and typical web application patterns, infer the key features likely present on this page (e.g., "Search Functionality", "Profile Settings", "Data Table Filters", "Add New Item", "Pagination").
       - **Test Separately**: Structure the test script to test each identified feature independently (using logical groups or steps). Do not just click everything randomly; perform complete, logical workflows for each feature.
    
    3. **Interaction & Handling**: 
       - **Inputs & Buttons**: For each feature, fill relevant inputs and click associated buttons.
       - **Modal/Dialog Handling**: If a feature triggers a modal, popup, or dialog (e.g., role="dialog"):
          - Explicitly wait for the modal to appear.
          - Interact with elements *inside* the modal (fill forms, click 'Save', 'Confirm', 'Cancel', etc.).
          - Verify the modal performs its function (e.g., closes, displays a success message, or updates the parent page).
          
    4. **Validation**: Validate that no console errors or network 500 errors occur after these interactions.
    
    Return the response in JSON format conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A brief executive summary listing the identified features and the strategy to test each one separately.",
            },
            playwrightCode: {
              type: Type.STRING,
              description: "The complete, runnable Playwright TypeScript code using test.describe/test.step for features.",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  action: { type: Type.STRING, description: "Type of action e.g., 'feature-test', 'fill', 'click', 'validate'" },
                  selector: { type: Type.STRING, description: "CSS selector or Playwright locator used" },
                  description: { type: Type.STRING, description: "Description of the step, noting which feature it belongs to" },
                  value: { type: Type.STRING, description: "Value input if applicable" },
                },
                required: ["id", "action", "selector", "description"],
              },
            },
          },
          required: ["summary", "playwrightCode", "steps"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TestResult;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate test plan. Please try again.");
  }
};

export const generateRunReport = async (url: string, steps: TestStep[]): Promise<TestReport> => {
  const prompt = `
    You are a QA Lead. A test run has just completed successfully for the website: ${url}.
    
    The following steps were executed:
    ${JSON.stringify(steps.map(s => s.description))}
    
    Please generate a professional, human-readable Test Execution Report.
    
    Requirements:
    1. **Executive Summary**: A professional paragraph summarizing the testing scope and success.
    2. **Coverage**: A list of high-level features that were verified.
    3. **Recommendations**: Suggestions for future testing or areas to watch.
    4. **Screenshots**: Identify 2-4 critical moments during this test run where a screenshot would be legally or technically necessary to serve as evidence (e.g., "Login Success", "Modal Opened", "Order Confirmation"). 
       For each, provide a title, a description of what is shown, and the type of view (modal, full-page, or component).
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            coverage: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING },
            screenshots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['modal', 'full-page', 'component'] }
                },
                required: ['title', 'description', 'type']
              }
            }
          },
          required: ['executiveSummary', 'coverage', 'recommendations', 'screenshots']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TestReport;
    }
    throw new Error("No report generated");
  } catch (error) {
    console.error("Gemini Report Error:", error);
    throw new Error("Failed to generate report.");
  }
};