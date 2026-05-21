/**
 * One-off benchmark script: calls every Marketo MCP tool and records response time.
 * Usage: npx tsx benchmark-mcp-tools.ts
 */

const MCP_URL = "http://localhost:3201/mcp";
const API_KEY = process.env.MCP_API_KEY || "";

let requestId = 0;
let sessionId = "";

async function mcpCall(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const resp = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: ++requestId,
      method,
      params,
    }),
  });

  // Capture session ID from initialize response
  const sid = resp.headers.get("mcp-session-id");
  if (sid) sessionId = sid;

  return resp.json();
}

// Minimal valid arguments for each tool so zod validation passes and actual API calls happen.
// Tools not listed here will be called with empty args (works for tools with all-optional params).
const toolArgs: Record<string, Record<string, unknown>> = {
  // Leads
  get_leads_by_filter: { filterType: "email", filterValues: "benchmark@test.invalid" },
  get_lead_by_id: { leadId: 1 },
  create_update_leads: { input: [{ email: "benchmark@test.invalid" }] },
  delete_leads: { input: [{ id: 999999999 }] },
  merge_leads: { winningLeadId: 1, losingLeadIds: [2] },
  associate_lead: { leadId: 1, cookie: "_mkto_trk=test" },
  push_lead_to_marketo: { input: [{ email: "benchmark@test.invalid" }], programName: "BenchmarkTest", lookupField: "email" },
  submit_form: { formId: 1, input: [{ leadFormFields: { email: "benchmark@test.invalid" } }] },

  // Lists
  get_list_by_id: { listId: 1 },
  get_leads_by_list: { listId: 1 },
  add_leads_to_list: { listId: 1, leadIds: [999999999] },
  remove_leads_from_list: { listId: 1, leadIds: [999999999] },
  is_lead_member_of_list: { listId: 1, leadIds: [999999999] },

  // Companies
  get_companies: { filterType: "company", filterValues: "BenchmarkTestCo" },
  create_update_companies: { input: [{ company: "BenchmarkTestCo" }] },
  delete_companies: { input: [{ externalCompanyId: "BENCH999" }] },

  // Opportunities
  get_opportunities: { filterType: "externalOpportunityId", filterValues: "BENCH999" },
  create_update_opportunities: { input: [{ externalOpportunityId: "BENCH999" }] },
  delete_opportunities: { input: [{ externalOpportunityId: "BENCH999" }] },

  // Opportunity Roles
  get_opportunity_roles: { filterType: "externalOpportunityId", filterValues: "BENCH999" },
  create_update_opportunity_roles: { input: [{ externalOpportunityId: "BENCH999", leadId: 1, role: "test" }] },
  delete_opportunity_roles: { input: [{ externalOpportunityId: "BENCH999", leadId: 1, role: "test" }] },

  // Sales Persons
  get_sales_persons: { filterType: "externalSalesPersonId", filterValues: "BENCH999" },
  create_update_sales_persons: { input: [{ externalSalesPersonId: "BENCH999", email: "bench@test.invalid" }] },
  delete_sales_persons: { input: [{ externalSalesPersonId: "BENCH999" }] },

  // Named Accounts
  get_named_accounts: { filterType: "name", filterValues: "BenchmarkTestCo" },
  create_update_named_accounts: { input: [{ name: "BenchmarkTestCo" }] },
  delete_named_accounts: { input: [{ name: "BenchmarkTestCo" }] },

  // Named Account Lists
  get_named_account_list_members: { listId: 1 },
  add_named_accounts_to_list: { listId: 1, input: [{ name: "BenchmarkTestCo" }] },
  remove_named_accounts_from_list: { listId: 1, input: [{ name: "BenchmarkTestCo" }] },

  // Custom Objects
  get_custom_objects: { apiName: "benchmark_c", filterType: "idField", filterValues: "BENCH999" },
  create_update_custom_objects: { apiName: "benchmark_c", input: [{ benchmarkId: "BENCH999" }] },
  delete_custom_objects: { apiName: "benchmark_c", input: [{ benchmarkId: "BENCH999" }] },
  describe_custom_object: { apiName: "benchmark_c" },

  // Program Members
  get_program_members: { programId: 1, filterType: "statusName", filterValues: "Member" },
  create_update_program_members: { programId: 1, input: [{ leadId: 999999999, status: "Member" }] },
  change_program_member_status: { programId: 1, input: [{ leadId: 999999999 }], statusName: "Member" },

  // Activities
  get_paging_token: { sinceDatetime: "2026-01-01T00:00:00Z" },
  get_lead_activities: { activityTypeIds: "1", nextPageToken: "benchmark_invalid_token" },
  get_lead_changes: { fields: "email", nextPageToken: "benchmark_invalid_token" },
  get_deleted_leads: { nextPageToken: "benchmark_invalid_token" },
  add_custom_activity: { input: [{ leadId: 1, activityDate: "2026-01-01T00:00:00Z", activityTypeId: 100000, primaryAttributeValue: "bench" }] },

  // Custom Activity Types
  create_custom_activity_type: { apiName: "benchmark_test_c", name: "Benchmark Test", triggerName: "Benchmark", filterName: "Benchmark", primaryAttribute: { apiName: "benchAttr", name: "Bench Attr", dataType: "string" } },

  // Programs
  get_program_by_id: { programId: 1 },
  get_program_by_name: { name: "BenchmarkTest" },
  clone_program: { programId: 1, name: "BenchmarkClone", folder: { id: 1, type: "Folder" } },
  delete_program: { programId: 999999999 },
  create_program: { name: "BenchmarkProg", folder: { id: 1, type: "Folder" }, type: "program", channel: "Online" },
  update_program: { programId: 999999999, name: "BenchmarkProgUpdated" },

  // Smart Campaigns
  get_smart_campaign_by_id: { campaignId: 1 },
  trigger_campaign: { campaignId: 999999999, input: { leads: [{ id: 999999999 }] } },
  schedule_campaign: { campaignId: 999999999, input: { runAt: "2099-01-01T00:00:00Z" } },

  // Smart Lists
  get_smart_list_by_id: { smartListId: 1 },
  get_leads_by_smart_list: { smartListId: 1 },

  // Emails
  get_email_by_id: { emailId: 1 },
  get_email_by_name: { name: "BenchmarkEmail" },
  get_email_content: { emailId: 1 },
  create_email: { name: "BenchmarkEmail", folder: { id: 1, type: "Folder" }, template: 1 },
  update_email: { emailId: 999999999, name: "BenchmarkEmailUpdated" },
  update_email_content_section: { emailId: 999999999, htmlId: "test", type: "Text", value: "test" },
  clone_email: { emailId: 1, name: "BenchmarkEmailClone", folder: { id: 1, type: "Folder" } },
  discard_email_draft: { emailId: 999999999 },
  approve_email: { emailId: 999999999 },
  unapprove_email: { emailId: 999999999 },
  delete_email: { emailId: 999999999 },
  send_sample_email: { emailId: 999999999, emailAddress: "benchmark@test.invalid" },

  // Email Templates
  get_email_template_by_id: { templateId: 1 },
  get_email_template_content: { templateId: 1 },
  create_email_template: { name: "BenchmarkTemplate", folder: { id: 1, type: "Folder" }, content: "<html></html>" },
  approve_email_template: { templateId: 999999999 },
  unapprove_email_template: { templateId: 999999999 },

  // Landing Pages
  get_landing_page_by_id: { pageId: 1 },
  get_landing_page_by_name: { name: "BenchmarkLP" },
  get_landing_page_content: { pageId: 1 },
  create_landing_page: { name: "BenchmarkLP", folder: { id: 1, type: "Folder" }, template: 1 },
  update_landing_page: { pageId: 999999999, name: "BenchmarkLPUpdated" },
  clone_landing_page: { pageId: 1, name: "BenchmarkLPClone", folder: { id: 1, type: "Folder" } },
  approve_landing_page: { pageId: 999999999 },
  unapprove_landing_page: { pageId: 999999999 },
  discard_landing_page_draft: { pageId: 999999999 },
  delete_landing_page: { pageId: 999999999 },

  // Landing Page Templates
  get_landing_page_template_by_id: { templateId: 1 },
  get_landing_page_template_content: { templateId: 1 },

  // Forms
  get_form_by_id: { formId: 1 },
  get_form_fields: { formId: 1 },
  clone_form: { formId: 1, name: "BenchmarkFormClone", folder: { id: 1, type: "Folder" } },
  approve_form: { formId: 999999999 },
  delete_form: { formId: 999999999 },

  // Tokens
  get_tokens: { folderId: 1, folderType: "Folder" },
  create_token: { folderId: 1, folderType: "Folder", name: "benchmarkToken", type: "text", value: "test" },
  delete_token: { folderId: 1, folderType: "Folder", name: "benchmarkToken", type: "text" },

  // Folders
  get_folder_by_id: { folderId: 1 },
  get_folder_by_name: { name: "BenchmarkFolder" },
  create_folder: { name: "BenchmarkFolder", parent: { id: 1, type: "Folder" } },
  delete_folder: { folderId: 999999999 },

  // Files
  get_file_by_id: { fileId: 1 },
  get_file_by_name: { name: "benchmark.png" },

  // Snippets
  get_snippet_by_id: { snippetId: 1 },
  get_snippet_content: { snippetId: 1 },
  clone_snippet: { snippetId: 1, name: "BenchmarkSnippetClone", folder: { id: 1, type: "Folder" } },
  approve_snippet: { snippetId: 999999999 },
  delete_snippet: { snippetId: 999999999 },

  // Tags & Channels
  get_tag_by_name: { name: "BenchmarkTag" },
  get_channel_by_name: { name: "BenchmarkChannel" },

  // Bulk Export Leads
  create_bulk_export_leads_job: { fields: ["email"], filter: {} },
  enqueue_bulk_export_leads_job: { exportId: "benchmark-invalid" },
  get_bulk_export_leads_job_status: { exportId: "benchmark-invalid" },
  cancel_bulk_export_leads_job: { exportId: "benchmark-invalid" },
  get_bulk_export_leads_file: { exportId: "benchmark-invalid" },

  // Bulk Export Activities
  create_bulk_export_activities_job: { fields: ["activityDate"], filter: { activityTypeIds: [1] } },
  enqueue_bulk_export_activities_job: { exportId: "benchmark-invalid" },
  get_bulk_export_activities_job_status: { exportId: "benchmark-invalid" },
  get_bulk_export_activities_file: { exportId: "benchmark-invalid" },

  // Bulk Export Custom Objects
  create_bulk_export_custom_objects_job: { apiName: "benchmark_c", fields: ["benchmarkId"], filter: {} },
  enqueue_bulk_export_custom_objects_job: { apiName: "benchmark_c", exportId: "benchmark-invalid" },
  get_bulk_export_custom_objects_job_status: { apiName: "benchmark_c", exportId: "benchmark-invalid" },

  // Bulk Import
  get_bulk_import_leads_job_status: { batchId: 999999999 },
  get_bulk_import_leads_failures: { batchId: 999999999 },
  get_bulk_import_leads_warnings: { batchId: 999999999 },
  get_bulk_import_custom_objects_jobs: { apiName: "benchmark_c" },

  // Lead Fields
  create_lead_field: { name: "benchmarkField", displayName: "Benchmark Field", dataType: "string" },
  update_lead_field: { fieldApiName: "benchmarkField999", displayName: "Updated" },

  // Custom Object Types
  create_custom_object_type: { apiName: "benchmark_c", displayName: "Benchmark", pluralName: "Benchmarks" },
  update_custom_object_type: { apiName: "benchmark_c", displayName: "Updated" },
  approve_custom_object_type: { apiName: "benchmark_c" },
  discard_custom_object_type_draft: { apiName: "benchmark_c" },
  delete_custom_object_type: { apiName: "benchmark_c" },
  add_custom_object_field: { apiName: "benchmark_c", input: [{ name: "testField", displayName: "Test", dataType: "string" }] },

  // Missing entries
  get_segments: { segmentationId: 1 },
};

interface BenchResult {
  tool: string;
  timeMs: number;
  success: boolean;
  error?: string;
}

async function benchmarkTool(toolName: string): Promise<BenchResult> {
  const args = toolArgs[toolName] || {};
  const start = performance.now();
  try {
    const result = await mcpCall("tools/call", { name: toolName, arguments: args });
    const elapsed = performance.now() - start;
    const r = result as any;
    const hasError = r?.result?.isError || r?.error;
    return {
      tool: toolName,
      timeMs: Math.round(elapsed),
      success: !hasError,
      error: hasError ? JSON.stringify(r?.error || r?.result?.content?.[0]?.text?.slice(0, 100)) : undefined,
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      tool: toolName,
      timeMs: Math.round(elapsed),
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  console.log("Initializing MCP session...");
  await mcpCall("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "benchmark", version: "1.0" },
  });

  console.log("Fetching tool list...");
  const listResult = (await mcpCall("tools/list")) as any;
  const tools: string[] = listResult.result.tools.map((t: any) => t.name);
  console.log(`Found ${tools.length} tools. Starting benchmark...\n`);

  const results: BenchResult[] = [];
  // Run sequentially to avoid rate limiting
  for (let i = 0; i < tools.length; i++) {
    const name = tools[i];
    process.stdout.write(`[${i + 1}/${tools.length}] ${name}...`);
    const result = await benchmarkTool(name);
    results.push(result);
    console.log(` ${result.timeMs}ms ${result.success ? "OK" : "ERR"}`);
  }

  // Sort by time descending
  results.sort((a, b) => b.timeMs - a.timeMs);

  // Print summary table
  console.log("\n" + "=".repeat(80));
  console.log("BENCHMARK RESULTS — Sorted by response time (slowest first)");
  console.log("=".repeat(80));
  console.log(`${"Tool".padEnd(50)} ${"Time (ms)".padStart(10)} ${"Status".padStart(8)}`);
  console.log("-".repeat(80));
  for (const r of results) {
    console.log(`${r.tool.padEnd(50)} ${String(r.timeMs).padStart(10)} ${(r.success ? "OK" : "ERR").padStart(8)}`);
  }
  console.log("-".repeat(80));

  const avg = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length);
  const median = results[Math.floor(results.length / 2)].timeMs;
  const p95 = results[Math.floor(results.length * 0.05)].timeMs;
  const fastest = results[results.length - 1].timeMs;
  const slowest = results[0].timeMs;

  console.log(`\nTotal tools: ${results.length}`);
  console.log(`Average: ${avg}ms | Median: ${median}ms | P95: ${p95}ms`);
  console.log(`Fastest: ${fastest}ms | Slowest: ${slowest}ms`);
  console.log(`Success: ${results.filter((r) => r.success).length} | Errors: ${results.filter((r) => !r.success).length}`);

  // Write CSV
  const csv = [
    "tool,time_ms,status,error",
    ...results.map((r) => `${r.tool},${r.timeMs},${r.success ? "OK" : "ERR"},"${(r.error || "").replace(/"/g, '""')}"`),
  ].join("\n");

  const fs = await import("fs");
  fs.writeFileSync("benchmark-results.csv", csv);
  console.log("\nResults saved to benchmark-results.csv");
}

main().catch(console.error);
