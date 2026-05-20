# Marketo MCP Server — User Guide

This guide is for marketers, MOPs professionals, and anyone who wants to use the Marketo MCP server without needing to understand the code. It explains what the tool does, how to get started, and walks through common tasks with real examples.

---

## What Is This?

The Marketo MCP server lets you talk to your Marketo instance using an AI assistant like Claude. Instead of navigating Marketo's UI or writing API code, you type plain English requests and the AI handles the rest.

**Think of it as a conversation with someone who has instant access to every part of your Marketo instance.**

Examples of things you can ask:

- "Find all leads from acme.com"
- "How many leads are in my Q2 Nurture list?"
- "Show me all the email assets in the Product Launch folder"
- "What smart campaigns ran this week?"
- "Add these 20 leads to the Event Follow-Up list"
- "What custom fields do we have for leads?"
- "How many API calls have we used today?"

---

## What You Need Before Starting

1. **Marketo admin access** (or someone who has it) — you need API credentials
2. **A computer with Node.js installed** — download from https://nodejs.org (version 20 or higher)
3. **An Anthropic API key** (if using the built-in agent) — get one from https://console.anthropic.com
4. **OR Claude Desktop** (if you prefer the desktop app) — download from https://claude.ai/download

---

## Setup (Step by Step)

### Step 1: Get Your Marketo API Credentials

You need four pieces of information from Marketo. If you're not a Marketo admin, ask your admin to do this:

1. Log into Marketo and go to **Admin** (gear icon in the top right)
2. In the left sidebar, go to **Integration > LaunchPoint**
3. Click **New** then **New Service**
4. Fill in:
   - **Display Name**: "MCP Server" (or whatever you want to call it)
   - **Service**: Custom
   - **API Only User**: Select an existing API user, or create a new one
5. Click **Create**
6. You'll see a **Client ID** and **Client Secret** — copy both somewhere safe

Next, get your base URL:
7. In the left sidebar, go to **Integration > Web Services**
8. Under "REST API", copy the **Endpoint URL** (looks like `https://123-ABC-456.mktorest.com`)

You now have all four values:
- **Base URL**: `https://123-ABC-456.mktorest.com`
- **Identity URL**: `https://123-ABC-456.mktorest.com/identity` (same URL + `/identity`)
- **Client ID**: the one you copied in step 6
- **Client Secret**: the one you copied in step 6

### Step 2: Download and Install

Open your terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run:

```bash
git clone https://github.com/zsimmons-etumos/Marketo-MCP.git
cd Marketo-MCP
npm install
```

(If you have pnpm, you can use `pnpm install` instead.)

### Step 3: Configure Your Credentials

Copy the example configuration file:

```bash
cp .env.example .env
```

Open the `.env` file in any text editor and fill in your four Marketo values:

```
MARKETO_BASE_URL=https://123-ABC-456.mktorest.com
MARKETO_IDENTITY_URL=https://123-ABC-456.mktorest.com/identity
MARKETO_CLIENT_ID=paste-your-client-id-here
MARKETO_CLIENT_SECRET=paste-your-client-secret-here
```

### Step 3b: Set Up an API Token (Recommended)

The API token protects your MCP server so only you (or your tools) can use it. Without one, anyone on your network could access your Marketo data through the server.

1. **Generate a token** — open your terminal and run:
   ```bash
   openssl rand -hex 32
   ```
   This gives you a long random string like `a3f8b2c1d4e5...`. Copy it.

2. **Add it to your `.env` file:**
   ```
   MCP_API_KEY=paste-your-random-string-here
   ```

3. **That's it for the server side.** When you set up Claude Desktop (Option B below), you'll need to paste this same token into the Claude config so it can authenticate.

> **Why do this?** Your MCP server is a direct line to your Marketo instance. The API token is like a password for that line. If you're only running things locally on your own machine, it's optional — but it's a good habit, and it's required if you ever run the server on a shared network.

### Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
[MCP] Marketo MCP server listening on HTTP :3201
```

That's it. The server is running. Keep this terminal window open.

---

## Using It: Option A — Built-in Chat Agent

This is the quickest way to start chatting with your Marketo data. Open a **new** terminal window (keep the server running in the first one) and run:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
npm run agent
```

You'll see:
```
Connecting to Marketo MCP server at http://localhost:3201/mcp...
Loaded 100+ Marketo tools.

Marketo Agent ready. Type your request (Ctrl+C to exit).

you>
```

Now just type what you want. Here are some examples to try:

```
you> Describe the lead schema
you> Find leads with email ending in @acme.com
you> How many API calls have we made today?
you> Show me all programs updated in the last week
you> What static lists do we have?
```

Press Ctrl+C to exit.

---

## Using It: Option B — Claude Desktop

If you prefer using Claude Desktop:

1. Make sure the MCP server is running (`npm run dev`)
2. Open the Claude Desktop config file:
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
3. Add this block (create the file if it doesn't exist):

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

Replace `your-mcp-api-key` with whatever you put as `MCP_API_KEY` in your `.env` file. If you didn't set one, remove the `"headers"` block entirely.

4. Restart Claude Desktop
5. You should see "marketo" listed as a connected tool in your Claude conversation

Now you can ask Claude questions about your Marketo instance directly in the Claude Desktop app.

---

## What Can You Do?

Here's a plain-language breakdown of everything the server can do:

### Working with Leads (People)
- **Find leads** — search by email, name, ID, or any field
- **View lead details** — see all data for a specific person
- **Create new leads** — add people to your database
- **Update leads** — change field values for existing leads
- **Delete leads** — remove people from your database
- **Merge leads** — combine duplicate records into one
- **Check what fields exist** — see all standard and custom lead fields

### Working with Lists
- **View all lists** — see your static lists
- **See who's on a list** — get all members of a list
- **Add people to a list** — put leads on a static list
- **Remove people from a list** — take leads off a list
- **Check membership** — see if specific leads are on a list

### Campaigns & Programs
- **View programs** — browse all your programs (email, event, nurture, etc.)
- **View smart campaigns** — see campaign details and status
- **Trigger campaigns** — fire a campaign for specific leads
- **Schedule campaigns** — set a batch campaign to run at a specific time
- **Clone programs** — copy an existing program

### Emails
- **Browse emails** — see all email assets
- **View email content** — read the HTML/content of an email
- **Create emails** — build a new email from a template
- **Edit email content** — update specific sections
- **Approve/unapprove** — manage email approval status
- **Send test emails** — send a sample to yourself
- **Clone emails** — copy an existing email

### Landing Pages
- **Browse pages** — see all landing pages
- **View content** — see what's on a page
- **Create, edit, approve** — full lifecycle management
- **Clone pages** — duplicate an existing page

### Forms
- **Browse forms** — see all form assets
- **View form fields** — see what fields a form collects
- **Submit forms** — programmatically submit a form
- **Clone forms** — duplicate a form

### Tokens (My Tokens)
- **View tokens** — see all tokens in a folder or program
- **Create/update tokens** — set token values
- **Delete tokens** — remove tokens

### Folders
- **Browse folder structure** — navigate your Marketo tree
- **Create folders** — organize your assets
- **Delete folders** — clean up empty folders

### Bulk Operations
- **Export leads** — create a CSV/TSV export of leads matching your criteria
- **Export activities** — bulk export activity data
- **Check import status** — see how bulk imports are progressing
- **Download results** — get the exported files

### Admin & Monitoring
- **API usage** — see how many API calls you've used today or this week
- **API errors** — check for error patterns
- **View channels and tags** — see your program channels and tag types
- **View segmentations** — see your segmentation setup

---

## Common Workflows

### "I need to find everyone from a specific company"

Ask: *"Find all leads with email domain @acme.com and show me their first name, last name, title, and company"*

The agent will use `get_leads_by_filter` with `filterType: email` and return a formatted list.

### "I need to add leads to a campaign list"

Ask: *"Add leads 12345, 67890, and 11111 to list ID 5678"*

Or: *"Find all leads from acme.com and add them to the Q2 Campaign list"*

The agent will chain multiple tools — first finding the leads, then adding them to the list.

### "I want to see what emails we have for an upcoming launch"

Ask: *"Show me all emails in the Product Launch folder"*

Or: *"List all approved emails updated in the last 30 days"*

### "I need to check our API usage before running a big operation"

Ask: *"How many API calls have we made today and in the last 7 days?"*

### "I want to export a list of leads"

Ask: *"Create a bulk export of all leads created after January 1, 2026, including email, firstName, lastName, and company"*

The agent will create the export job, enqueue it, and tell you to check back for the results.

### "I need to understand our lead schema"

Ask: *"Describe the lead schema — show me all custom fields"*

Or: *"What field types are available? I want to create a new custom field."*

---

## Important Things to Know

### The AI Will Confirm Before Making Changes

When you ask the agent to do something destructive (delete leads, merge records, etc.), it will describe what it's about to do and ask for your confirmation before proceeding.

### API Limits

Your Marketo instance has a daily API call limit (typically 50,000). Each tool call the server makes counts as one API call. Heavy operations like bulk exports are more efficient than many individual calls.

You can check your usage anytime: *"How many API calls have we used today?"*

### What You See Depends on Permissions

The API credentials you configured have specific permissions. If a tool returns an "access denied" error, it means the API user's role in Marketo doesn't have permission for that action. Ask your Marketo admin to update the role.

### Data Safety

- The server only talks to YOUR Marketo instance using YOUR credentials
- All data stays between the server (running on your machine) and Marketo's API
- The `.env` file with your credentials is never uploaded or shared
- If using the built-in agent, conversation data is sent to Anthropic's API (just like using Claude normally)

---

## Stopping and Restarting

To stop the server, press **Ctrl+C** in the terminal where it's running.

To restart, just run `npm run dev` again.

If something isn't working after a restart, check that your `.env` file is still in place and credentials haven't expired.

---

## Getting Help

- **Server won't start**: Make sure Node.js 20+ is installed (`node --version`) and `npm install` completed successfully
- **"Auth failed" errors**: Double-check all four Marketo credential values in `.env`
- **"Access denied" on certain tools**: The API user needs more permissions — talk to your Marketo admin
- **Agent not connecting**: Make sure the server is running first, then start the agent in a separate terminal
- **Claude Desktop not seeing tools**: Restart Claude Desktop after editing the config file
