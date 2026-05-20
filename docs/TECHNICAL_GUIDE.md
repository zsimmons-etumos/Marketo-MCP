# Marketo MCP Server — Technical Guide

This guide is for developers and MOPs engineers who will be deploying, configuring, and extending the Marketo MCP server. It covers architecture, all available tools, configuration options, transport protocols, security, and troubleshooting.

---

## Architecture

```
┌──────────────────┐     MCP Protocol      ┌──────────────────┐     REST API     ┌──────────────┐
│                  │  (Streamable HTTP/SSE) │                  │   (OAuth2 JWT)   │              │
│   MCP Client     │ ────────────────────── │  Marketo MCP     │ ──────────────── │   Marketo    │
│   (Claude, etc.) │                        │  Server (:3201)  │                  │   Instance   │
│                  │ ◄───────────────────── │                  │ ◄────────────────│              │
└──────────────────┘     JSON responses     └──────────────────┘   JSON responses └──────────────┘
```

The server is a stateless MCP bridge:

1. An MCP client (Claude Desktop, LangChain agent, custom code) sends a tool-call request over Streamable HTTP or SSE.
2. The server validates the request, authenticates with Marketo via OAuth2 client credentials, and calls the corresponding REST API endpoint.
3. The raw Marketo JSON response is returned to the client as a text content block.

Token management is automatic — the server caches the OAuth2 access token and refreshes it 60 seconds before expiry.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| pnpm / npm / yarn | Any recent |
| TypeScript | 5.6+ (included) |
| Marketo | REST API access with LaunchPoint API-only user |

---

## Installation

```bash
git clone https://github.com/zsimmons-etumos/Marketo-MCP.git
cd Marketo-MCP
pnpm install
```

---

## Configuration

All configuration is via environment variables. Copy `.env.example` to `.env` and fill in:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MARKETO_BASE_URL` | Your Marketo REST API base URL | `https://123-ABC-456.mktorest.com` |
| `MARKETO_IDENTITY_URL` | Your Marketo identity endpoint | `https://123-ABC-456.mktorest.com/identity` |
| `MARKETO_CLIENT_ID` | LaunchPoint service client ID | `abcdef12-3456-7890-...` |
| `MARKETO_CLIENT_SECRET` | LaunchPoint service client secret | `aBcDeFgHiJkLmNoPqRsT` |

### Optional — Server

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKETO_MCP_PORT` | `3201` | HTTP listen port |
| `MCP_API_KEY` | (none) | If set, all MCP requests require `Authorization: Bearer <key>` |

### Setting Up an MCP API Token

The `MCP_API_KEY` controls who can connect to your MCP server. This is separate from your Marketo credentials — it protects the MCP server itself.

**How it works:** You choose any secret string and set it as `MCP_API_KEY` in your `.env` file. The server then requires all incoming requests to include `Authorization: Bearer <your-key>` in the HTTP headers. Requests without a valid key get a `401 Unauthorized` response.

**Step-by-step:**

1. **Generate a random key** (or pick any strong secret string):
   ```bash
   # Option A: generate a random 32-character hex string
   openssl rand -hex 32

   # Option B: generate a UUID
   uuidgen
   ```

2. **Add it to your `.env` file:**
   ```
   MCP_API_KEY=your-generated-key-here
   ```

3. **Configure your MCP client to send the key:**

   - **Claude Desktop** — add an `Authorization` header in `claude_desktop_config.json`:
     ```json
     {
       "mcpServers": {
         "marketo": {
           "url": "http://localhost:3201/mcp",
           "headers": {
             "Authorization": "Bearer your-generated-key-here"
           }
         }
       }
     }
     ```

   - **Built-in agent** — the agent connects locally and reads from the same `.env`, so no extra config is needed.

   - **cURL / custom clients** — include the header in every request:
     ```bash
     curl -X POST http://localhost:3201/mcp \
       -H "Authorization: Bearer your-generated-key-here" \
       -H "Content-Type: application/json" \
       -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
     ```

4. **Restart the server** after changing `.env`.

**If you don't set `MCP_API_KEY`:** The server runs without authentication. Anyone who can reach port 3201 can make Marketo API calls through your server. This is fine for local development but **never do this in production or on a public network.**

### Optional — HTTPS

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKETO_MCP_HTTPS_PORT` | `3444` | HTTPS listen port |
| `MCP_TLS_CERT` | (none) | Path to TLS certificate PEM |
| `MCP_TLS_KEY` | (none) | Path to TLS private key PEM |

### Optional — Agent

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | (none) | Required only if using the included LangChain agent |
| `MARKETO_MCP_URL` | `http://localhost:3201/mcp` | MCP endpoint the agent connects to |
| `LANGCHAIN_MODEL` | `claude-sonnet-4-20250514` | Model for the agent |

---

## Getting Marketo API Credentials

1. **Admin > Integration > LaunchPoint** — click "New > New Service"
2. Set service type to **Custom**, select or create an **API Only User**
3. Copy the **Client ID** and **Client Secret**
4. **Admin > Integration > Web Services** — copy the **REST API Endpoint URL** (this is your `MARKETO_BASE_URL`)
5. Your identity URL is: `{MARKETO_BASE_URL}/identity`

### API Only User Permissions

The API user's role determines which tools will succeed. For full functionality, the role needs:

| Permission | Required For |
|------------|-------------|
| Read-Only Lead | get_leads_by_filter, get_lead_by_id, describe_lead, get_lead_fields |
| Read-Write Lead | create_update_leads, delete_leads, merge_leads, push_lead_to_marketo |
| Read-Only Activity | get_activity_types, get_lead_activities, get_lead_changes |
| Read-Only Assets | get_programs, get_emails, get_landing_pages, get_forms, get_folders |
| Read-Write Assets | create_program, create_email, update_email, approve_email, etc. |
| Read-Only Campaign | get_smart_campaigns, get_smart_lists |
| Execute Campaign | trigger_campaign, schedule_campaign |
| Read-Only Custom Object | list_custom_objects, describe_custom_object, get_custom_objects |
| Read-Write Custom Object | create_update_custom_objects, delete_custom_objects |
| Read-Only Named Account | get_named_accounts, get_named_account_lists |
| Read-Write Named Account | create_update_named_accounts, delete_named_accounts |
| Bulk Export/Import | All bulk export/import tools |
| Access API > Daily Usage | get_daily_usage, get_last_7_days_usage, get_daily_errors |

---

## Running the Server

```bash
# Development (hot reload via tsx --watch)
pnpm dev

# Build + production
pnpm build
pnpm start
```

On startup, the server logs:
```
[MCP] Marketo MCP server listening on HTTP :3201
[MCP] Marketo MCP server listening on HTTPS :3444   # only if TLS configured
```

---

## Transport Protocols

The server supports two MCP transports:

### Streamable HTTP (recommended)

```
POST http://localhost:3201/mcp
Content-Type: application/json
Authorization: Bearer <MCP_API_KEY>   # only if MCP_API_KEY is set

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": { "name": "get_leads_by_filter", "arguments": { "filterType": "email", "filterValues": "user@example.com" } },
  "id": 1
}
```

### SSE (legacy)

```
GET http://localhost:3201/sse
Authorization: Bearer <MCP_API_KEY>
```

The SSE endpoint establishes a persistent connection. Tool calls are sent as POST requests to the message endpoint returned in the initial SSE handshake.

---

## Complete Tool Reference

### Lead Database (17 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_leads_by_filter` | GET | Query leads by filter type (email, id, cookie, etc.) |
| `get_lead_by_id` | GET | Get a single lead by Marketo ID |
| `create_update_leads` | POST | Upsert up to 300 leads (createOnly, updateOnly, createOrUpdate, createDuplicate) |
| `delete_leads` | DELETE | Delete leads by ID |
| `describe_lead` | GET | Get lead field schema — all fields, types, metadata |
| `describe_lead2` | GET | Extended schema with searchable fields and relationships |
| `get_lead_partitions` | GET | List all lead partitions |
| `merge_leads` | POST | Merge losing leads into a winning lead |
| `associate_lead` | POST | Associate a lead with a munchkin cookie |
| `push_lead_to_marketo` | POST | Push leads via the ingestion endpoint |
| `submit_form` | POST | Submit a Marketo form programmatically |
| `get_lists` | GET | Browse static lists (filter by ID, name, program, workspace) |
| `get_list_by_id` | GET | Get a single static list |
| `get_leads_by_list` | GET | Get all leads in a static list |
| `add_leads_to_list` | POST | Add leads to a static list |
| `remove_leads_from_list` | DELETE | Remove leads from a static list |
| `is_lead_member_of_list` | GET | Check list membership for leads |

### Companies (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `describe_company` | GET | Get company object schema |
| `get_companies` | GET | Query companies by filter |
| `create_update_companies` | POST | Upsert company records |
| `delete_companies` | POST | Delete company records |

### Opportunities & Roles (8 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `describe_opportunity` | GET | Get opportunity object schema |
| `get_opportunities` | GET | Query opportunities by filter |
| `create_update_opportunities` | POST | Upsert opportunity records |
| `delete_opportunities` | POST | Delete opportunity records |
| `describe_opportunity_role` | GET | Get opportunity role schema |
| `get_opportunity_roles` | GET | Query opportunity roles |
| `create_update_opportunity_roles` | POST | Upsert opportunity role records |
| `delete_opportunity_roles` | POST | Delete opportunity role records |

### Sales Persons (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `describe_sales_person` | GET | Get sales person schema |
| `get_sales_persons` | GET | Query sales persons by filter |
| `create_update_sales_persons` | POST | Upsert sales person records |
| `delete_sales_persons` | POST | Delete sales person records |

### Named Accounts & Lists (7 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `describe_named_account` | GET | Get named account schema |
| `get_named_accounts` | GET | Query named accounts |
| `create_update_named_accounts` | POST | Upsert named accounts |
| `delete_named_accounts` | POST | Delete named accounts |
| `get_named_account_lists` | GET | List named account lists |
| `get_named_account_list_members` | GET | Get members of a named account list |
| `add_named_accounts_to_list` | POST | Add accounts to a named account list |
| `remove_named_accounts_from_list` | POST | Remove accounts from a named account list |

### Custom Objects (5 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `list_custom_objects` | GET | List all custom object types |
| `describe_custom_object` | GET | Get schema for a specific custom object |
| `get_custom_objects` | GET | Query custom object records |
| `create_update_custom_objects` | POST | Upsert custom object records |
| `delete_custom_objects` | POST | Delete custom object records |

### Program Members (4 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `describe_program_member` | GET | Get program member schema |
| `get_program_members` | GET | Get members of a program by filter |
| `create_update_program_members` | POST | Upsert program member data/status |
| `change_program_member_status` | POST | Change program status for leads |

### Activities (8 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_activity_types` | GET | List all activity types and attributes |
| `get_paging_token` | GET | Get a paging token (required before get_lead_activities) |
| `get_lead_activities` | GET | Get activity records using a paging token |
| `get_lead_changes` | GET | Get data value change activities |
| `get_deleted_leads` | GET | Get deleted lead records |
| `add_custom_activity` | POST | Submit custom activity records |
| `get_custom_activity_types` | GET | List custom activity types |
| `create_custom_activity_type` | POST | Define a new custom activity type |

### Programs (7 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_programs` | GET | Browse programs (filter by type, date, etc.) |
| `get_program_by_id` | GET | Get a single program |
| `get_program_by_name` | GET | Get a program by exact name |
| `create_program` | POST | Create a new program |
| `update_program` | POST | Update program metadata |
| `delete_program` | POST | Delete a program |
| `clone_program` | POST | Clone a program |

### Smart Campaigns (4 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_smart_campaigns` | GET | Browse smart campaigns |
| `get_smart_campaign_by_id` | GET | Get a single smart campaign |
| `trigger_campaign` | POST | Trigger a campaign for specific leads |
| `schedule_campaign` | POST | Schedule a batch campaign run |

### Smart Lists (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_smart_lists` | GET | Browse smart lists |
| `get_smart_list_by_id` | GET | Get a single smart list |
| `get_leads_by_smart_list` | GET | Get leads matching a smart list |

### Emails (12 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_emails` | GET | Browse email assets |
| `get_email_by_id` | GET | Get an email by ID |
| `get_email_by_name` | GET | Get an email by name |
| `get_email_content` | GET | Get editable content sections |
| `update_email_content_section` | POST | Update a content section (HTML) |
| `create_email` | POST | Create a new email |
| `update_email` | POST | Update email metadata |
| `approve_email` | POST | Approve an email draft |
| `unapprove_email` | POST | Revert email to draft |
| `discard_email_draft` | POST | Discard email draft changes |
| `clone_email` | POST | Clone an email |
| `delete_email` | POST | Delete an email |
| `send_sample_email` | POST | Send a test email |

### Email Templates (5 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_email_templates` | GET | Browse email templates |
| `get_email_template_by_id` | GET | Get a template by ID |
| `get_email_template_content` | GET | Get template HTML content |
| `create_email_template` | POST | Create a new email template |
| `approve_email_template` | POST | Approve a template draft |
| `unapprove_email_template` | POST | Revert template to draft |

### Landing Pages (10 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_landing_pages` | GET | Browse landing pages |
| `get_landing_page_by_id` | GET | Get a landing page by ID |
| `get_landing_page_by_name` | GET | Get a landing page by name |
| `get_landing_page_content` | GET | Get editable content sections |
| `create_landing_page` | POST | Create a new landing page |
| `update_landing_page` | POST | Update landing page metadata |
| `approve_landing_page` | POST | Approve a landing page draft |
| `unapprove_landing_page` | POST | Revert to draft |
| `discard_landing_page_draft` | POST | Discard draft changes |
| `clone_landing_page` | POST | Clone a landing page |
| `delete_landing_page` | POST | Delete a landing page |

### Landing Page Templates (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_landing_page_templates` | GET | Browse landing page templates |
| `get_landing_page_template_by_id` | GET | Get a template by ID |
| `get_landing_page_template_content` | GET | Get template HTML content |

### Forms (5 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_forms` | GET | Browse forms |
| `get_form_by_id` | GET | Get a form by ID |
| `get_form_fields` | GET | Get form field definitions |
| `approve_form` | POST | Approve a form draft |
| `clone_form` | POST | Clone a form |
| `delete_form` | POST | Delete a form |

### Tokens (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_tokens` | GET | Get My Tokens for a folder/program |
| `create_token` | POST | Create or update a My Token |
| `delete_token` | POST | Delete a My Token |

### Folders (5 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_folders` | GET | Browse folders |
| `get_folder_by_id` | GET | Get a folder by ID |
| `get_folder_by_name` | GET | Get a folder by name |
| `create_folder` | POST | Create a new folder |
| `delete_folder` | POST | Delete an empty folder |

### Files & Images (3 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_files` | GET | Browse files/images in a folder |
| `get_file_by_id` | GET | Get a file by ID |
| `get_file_by_name` | GET | Get a file by name |

### Snippets (5 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_snippets` | GET | Browse snippets |
| `get_snippet_by_id` | GET | Get a snippet by ID |
| `get_snippet_content` | GET | Get snippet editable content |
| `approve_snippet` | POST | Approve a snippet draft |
| `clone_snippet` | POST | Clone a snippet |
| `delete_snippet` | POST | Delete a snippet |

### Segmentations (2 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_segmentations` | GET | List all segmentations |
| `get_segments` | GET | Get segments within a segmentation |

### Tags & Channels (4 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_tags` | GET | List all tag types |
| `get_tag_by_name` | GET | Get a tag type by name |
| `get_channels` | GET | List all channels |
| `get_channel_by_name` | GET | Get a channel by name |

### Bulk Export (10 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `create_bulk_export_leads_job` | POST | Create a bulk lead export job |
| `enqueue_bulk_export_leads_job` | POST | Start a lead export job |
| `get_bulk_export_leads_job_status` | GET | Check export job status |
| `get_bulk_export_leads_file` | GET | Download completed export (CSV/TSV) |
| `cancel_bulk_export_leads_job` | POST | Cancel an export job |
| `get_bulk_export_leads_jobs` | GET | List all lead export jobs |
| `create_bulk_export_activities_job` | POST | Create a bulk activity export |
| `enqueue_bulk_export_activities_job` | POST | Start an activity export |
| `get_bulk_export_activities_job_status` | GET | Check activity export status |
| `get_bulk_export_activities_file` | GET | Download activity export |
| `create_bulk_export_custom_objects_job` | POST | Create custom object export |
| `enqueue_bulk_export_custom_objects_job` | POST | Start custom object export |
| `get_bulk_export_custom_objects_job_status` | GET | Check custom object export status |

### Bulk Import (4 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_bulk_import_leads_jobs` | GET | List bulk lead import jobs |
| `get_bulk_import_leads_job_status` | GET | Check import job status |
| `get_bulk_import_leads_failures` | GET | Download failure records |
| `get_bulk_import_leads_warnings` | GET | Download warning records |
| `get_bulk_import_custom_objects_jobs` | GET | List custom object import jobs |

### Lead Fields (2 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_lead_fields` | GET | List all lead fields (standard + custom) |
| `create_lead_field` | POST | Create a custom lead field |

### Usage & Stats (4 tools)

| Tool | Method | Description |
|------|--------|-------------|
| `get_daily_usage` | GET | API call count for today |
| `get_last_7_days_usage` | GET | API call count for last 7 days |
| `get_daily_errors` | GET | API errors for today |
| `get_last_7_days_errors` | GET | API errors for last 7 days |

---

## Client Connection Examples

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

### LangChain / LangGraph (TypeScript)

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const mcpClient = new MultiServerMCPClient({
  marketo: {
    transport: "sse",
    url: "http://localhost:3201/mcp",
  },
});

const tools = await mcpClient.getTools();
const model = new ChatAnthropic({ model: "claude-sonnet-4-20250514" });
const agent = createReactAgent({ llm: model, tools });

const result = await agent.invoke({
  messages: [{ role: "human", content: "Find leads with email domain @acme.com" }],
});
```

### Python (MCP SDK)

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client("http://localhost:3201/mcp") as (r, w, _):
    async with ClientSession(r, w) as session:
        await session.initialize()
        tools = await session.list_tools()
        result = await session.call_tool("get_leads_by_filter", {
            "filterType": "email",
            "filterValues": "user@example.com"
        })
```

### cURL

```bash
curl -X POST http://localhost:3201/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-mcp-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_daily_usage",
      "arguments": {}
    },
    "id": 1
  }'
```

---

## Included Agent (REPL)

The repo includes a standalone LangChain ReAct agent for interactive use:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pnpm agent
```

This connects to the MCP server, loads all tools, and drops you into a REPL:

```
Connecting to Marketo MCP server at http://localhost:3201/mcp...
Loaded 100+ Marketo tools.

Marketo Agent ready. Type your request (Ctrl+C to exit).

you> How many API calls have we made today?
agent> You've made 1,247 API calls today out of your 50,000 daily limit...
```

The agent automatically:
- Chains multiple tool calls to answer complex questions
- Formats data into readable tables/summaries
- Confirms before running destructive operations (deletes, merges)

---

## Security Considerations

1. **MCP_API_KEY** — Always set this in production. Without it, anyone who can reach port 3201 can execute Marketo API calls through your server.

2. **HTTPS** — For remote deployments, configure TLS certificates. The server supports simultaneous HTTP + HTTPS.

3. **Marketo API User Permissions** — Use the principle of least privilege. Create a dedicated API-only user with only the permissions your use case needs.

4. **Environment Variables** — Never commit `.env` files. The `.gitignore` excludes them by default.

5. **Network Access** — In production, restrict access to the MCP port using firewall rules or a reverse proxy.

---

## Marketo API Rate Limits

Marketo imposes these limits (enforced per-instance, not per-user):

| Limit | Value |
|-------|-------|
| Daily API calls | 50,000 (default, varies by contract) |
| Concurrent API calls | 10 |
| Bulk export daily quota | 500 MB |
| Bulk import file size | 10 MB per file |
| Batch size (leads, etc.) | 300 records per call |

Use `get_daily_usage` and `get_last_7_days_usage` to monitor consumption. The server does not enforce rate limits itself — it passes through Marketo's error responses.

---

## Pagination

Many tools support pagination via `nextPageToken` and `batchSize`:

1. Make the initial call without `nextPageToken`
2. If the response includes `moreResult: true` and a `nextPageToken`, pass that token in the next call
3. Repeat until `moreResult` is false or `nextPageToken` is absent

Activity queries are special — they require a paging token from `get_paging_token` before the first call to `get_lead_activities`.

Asset API tools (programs, emails, etc.) use `offset` + `maxReturn` pagination instead.

---

## Troubleshooting

### "Marketo auth failed: 401"
- Verify `MARKETO_CLIENT_ID` and `MARKETO_CLIENT_SECRET` are correct
- Ensure the LaunchPoint service is active (not expired or disabled)
- Check that `MARKETO_IDENTITY_URL` ends with `/identity` (not `/identity/oauth/token`)

### "FETCH_ERROR" on tool calls
- Confirm `MARKETO_BASE_URL` is correct (no trailing slash)
- Check network connectivity from the server to `*.mktorest.com`
- Marketo may be down for maintenance — check status.marketo.com

### "Access denied" errors (code 603)
- The API user's role lacks the required permission for that endpoint
- See the permissions table above

### Tools not loading in Claude Desktop
- Restart Claude Desktop after editing the config
- Ensure the server is running before opening Claude Desktop
- Check that the URL and API key match

### Bulk export stuck in "Queued"
- Marketo processes bulk jobs asynchronously. Check back with `get_bulk_export_leads_job_status`
- Only 2 bulk export jobs can run concurrently per instance

---

## Project Structure

```
Marketo-MCP/
├── src/
│   ├── server.ts          # MCP server — all tool registrations
│   └── agent.ts           # LangChain ReAct agent (optional)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variable template
├── .gitignore
├── README.md              # Project overview
└── docs/
    ├── TECHNICAL_GUIDE.md # This file
    └── USER_GUIDE.md      # Non-technical guide
```
