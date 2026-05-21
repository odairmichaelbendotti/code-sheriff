import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CodeSheriff API",
      version: "1.0.0",
      description:
        "AI-powered GitHub Pull Request review API. Streams security, performance, and code quality findings in real-time.",
    },
    servers: [{ url: "http://localhost:4000", description: "Development" }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
        },
      },
      schemas: {
        PrFile: {
          type: "object",
          properties: {
            filename: { type: "string", example: "src/index.ts" },
            patch: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["added", "modified", "removed", "renamed"],
            },
            sha: { type: "string" },
            additions: { type: "integer" },
            deletions: { type: "integer" },
          },
          required: ["filename", "status", "sha", "additions", "deletions"],
        },
        Finding: {
          type: "object",
          properties: {
            agent: {
              type: "string",
              enum: ["security", "performance", "quality"],
            },
            severity: {
              type: "string",
              enum: ["critical", "warning", "suggestion"],
            },
            file: { type: "string" },
            line: { type: "integer", nullable: true },
            message: { type: "string" },
          },
          required: ["agent", "severity", "file", "message"],
        },
        Analysis: {
          type: "object",
          properties: {
            id: { type: "string" },
            owner: { type: "string" },
            repo: { type: "string" },
            prNumber: { type: "string" },
            criticalCount: { type: "integer" },
            warningCount: { type: "integer" },
            suggestionCount: { type: "integer" },
            findings: {
              type: "array",
              items: { $ref: "#/components/schemas/Finding" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.ts")],
};

export const swaggerSpec = swaggerJsdoc(options);
