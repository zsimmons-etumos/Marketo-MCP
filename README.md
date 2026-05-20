# Marketo MCP Server

An MCP (Model Context Protocol) server that exposes the full Marketo REST API as tools. Connect any MCP-compatible AI agent (Claude, LangChain, etc.) to your Marketo instance and let it query leads, manage lists, run campaigns, inspect assets, and more — all through natural language.

## What It Does

This server wraps the Marketo REST API into MCP tools that AI agents can call. Instead of writing API calls by hand, you connect an agent and ask it things like:

- "Find all leads with email domain @acme.com"
- "Add these 50 leads to the Q2 Campaign list"
- "Show me all smart campaigns in the Nurture program"
- "What email assets do we have for the product launch?"
- "Describe the lead schema — what custom fields are available?"

## Available Tools (40+)

### Lead Database
- **Leads** — get by filter, get by ID, create/update, delete, describe schema, merge, associate, push, submit form
- **Lists** — get, get by ID, get members, add/remove leads, check membership
- **Companies** — describe, get, create/update, delete
- **Opportunities** — describe, get, create/update, delete
- **Opportunity Roles** — describe, get, create/update, delete
- **Sales Persons** — describe, get, create/update, delete

### Activities
- **Activity Types** — list all types
- **Lead Activities** — get with paging token
- **Lead Changes** — get field change history

### Assets (Programs, Emails, Landing Pages, Forms)
- **Programs** — get by ID, get by name, browse/list all, browse by tag
- **Smart Campaigns** — get by ID, list by program, trigger, request/schedule
- **Emails** — get by ID, get by name, browse, get content
- **Landing Pages** — get by ID, get by name, browse
- **Forms** — get by ID, get by name, browse

### Custom Objects
- **List** — list all custom object types
- **Describe** — get schema for a custom object
- **Get** — query records
- **Create/Update** — upsert records
- **Delete** — remove records

### Bulk Operations
- **Import Leads** — CSV bulk import
- **Export Leads** — create, enqueue, check status, download

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- A Marketo instance with API access (REST API enabled, LaunchPoint service configured)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/zsimmons-etumos/Marketo-MCP.git
cd Marketo-MCP
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Marketo credentials:

```env
# Required — Marketo API
MARKETO_BASE_URL=https://xxx-xxx-xxx.mktorest.com
MARKETO_IDENTITY_URL=https://xxx-xxx-xxx.mktorest.com/identity
MARKETO_CLIENT_ID=your-client-id
MARKETO_CLIENT_SECRET=your-client-secret

# Optional — Server config
MARKETO_MCP_PORT=3201
MCP_API_KEY=your-secret-key

# Optional — HTTPS (provide cert paths)
MARKETO_MCP_HTTPS_PORT=3444
MCP_TLS_CERT=/path/to/cert.pem
MCP_TLS_KEY=/path/to/key.pem
```

### 3. Getting Marketo API Credentials

1. In Marketo, go to **Admin > Integration > LaunchPoint**
2. Click **New > New Service**
3. Service type: **Custom**, API Only User: select or create one
4. Copy the **Client ID** and **Client Secret**
5. Go to **Admin > Integration > Web Services** to find your **REST API Endpoint URL** (this is your `MARKETO_BASE_URL`)
6. The Identity URL is your base URL + `/identity`

### 4. Run the Server

```bash
# Development (hot reload)
pnpm dev

# Production
pnpm build
pnpm start
```

The server starts on port 3201 (HTTP) by default. If TLS certs are configured, HTTPS also starts on port 3444.

## Connecting an Agent

### With the included LangChain agent

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run the interactive agent
pnpm agent
```

This starts a REPL where you can chat with a Claude-powered agent that has access to all Marketo tools.

### With Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "marketo": {
      "url": "http://localhost:3201/mcp",
      "headers": {
        "Authorization": "Bearer your-mcp-api-key"
      }
    }
  }
}
```

### With any MCP client

The server exposes two transport options:
- **Streamable HTTP** (recommended): `POST http://localhost:3201/mcp`
- **SSE** (legacy): `GET http://localhost:3201/sse`

If `MCP_API_KEY` is set, all requests must include `Authorization: Bearer <key>`.

## API Authentication

The server handles Marketo OAuth2 automatically — it fetches and caches access tokens, refreshing them before expiry. You don't need to manage tokens yourself.

If `MCP_API_KEY` is set in your `.env`, the MCP server itself requires bearer auth on all incoming requests. This protects your Marketo instance from unauthorized agent connections.

## Project Structure

```
src/
  server.ts        # MCP server — all Marketo tools registered here
  agent.ts         # LangChain ReAct agent (optional, for interactive use)
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Language | TypeScript 5.6+ (strict) |
| MCP SDK | @modelcontextprotocol/sdk |
| Schema | Zod |
| Agent (optional) | LangChain + LangGraph |
| AI Model (optional) | Claude via @langchain/anthropic |
