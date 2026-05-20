/**
 * @file src/agent.ts
 * @description LangGraph ReAct agent connected to the Marketo MCP server.
 *   Loads all Marketo tools via @langchain/mcp-adapters and exposes a
 *   conversational agent that can query/mutate Marketo on behalf of the user.
 */

import "dotenv/config";
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { HumanMessage } from "@langchain/core/messages";
import readline from "node:readline";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MARKETO_MCP_URL =
  process.env.MARKETO_MCP_URL ?? "http://localhost:3201/mcp";

const MODEL_NAME = process.env.LANGCHAIN_MODEL ?? "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function main() {
  // 1. Connect to Marketo MCP server
  const mcpClient = new MultiServerMCPClient({
    marketo: {
      transport: "sse" as const,
      url: MARKETO_MCP_URL,
    },
  });

  console.log(`Connecting to Marketo MCP server at ${MARKETO_MCP_URL}...`);
  const tools = await mcpClient.getTools();
  console.log(`Loaded ${tools.length} Marketo tools.`);

  // 2. Create Claude model
  const model = new ChatAnthropic({
    model: MODEL_NAME,
    temperature: 0,
    maxTokens: 4096,
  });

  // 3. Create ReAct agent
  const agent = createReactAgent({
    llm: model,
    tools,
    messageModifier:
      "You are a Marketo automation expert. You have access to the full Marketo REST API " +
      "via MCP tools. Help the user query leads, manage lists, run campaigns, inspect assets, " +
      "and perform any Marketo operation they need. Always confirm destructive operations before executing. " +
      "When returning data, format it clearly.",
  });

  // 4. Interactive REPL
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nMarketo Agent ready. Type your request (Ctrl+C to exit).\n");

  const prompt = () => {
    rl.question("you> ", async (input) => {
      const trimmed = input.trim();
      if (!trimmed) {
        prompt();
        return;
      }

      try {
        const result = await agent.invoke({
          messages: [new HumanMessage(trimmed)],
        });

        const lastMessage = result.messages[result.messages.length - 1];
        console.log(`\nagent> ${lastMessage.content}\n`);
      } catch (err) {
        console.error("Error:", err);
      }

      prompt();
    });
  };

  prompt();

  // Cleanup on exit
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await mcpClient.close();
    rl.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
