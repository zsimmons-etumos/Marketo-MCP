# Marketo MCP Server — Tool Reference

Complete reference for every tool exposed by the Marketo MCP server. 113 tools organized by category.

---

## Lead Database

### Leads

| Tool | Description |
|------|-------------|
| `get_leads_by_filter` | Look up leads using a filter type (email, id, cookie, twitterId, facebookId, linkedInId, sfdcAccountId, sfdcContactId, sfdcLeadId, sfdcLeadOwnerId, sfdcOpptyId, or Custom). Returns matching lead records with requested fields. Supports pagination. |
| `get_lead_by_id` | Retrieve a single lead record by its Marketo lead ID. Optionally specify which fields to return. |
| `create_update_leads` | Create or update leads in batch (up to 300). Supports actions: createOnly, updateOnly, createOrUpdate, createDuplicate. Deduplicates on a configurable lookup field (default: email). |
| `delete_leads` | Delete one or more leads by their Marketo IDs. |
| `describe_lead` | Get the full lead field schema — all available fields, their data types, and metadata. |
| `describe_lead2` | Get the extended lead field schema (describe2) including searchable fields and relationships. |
| `get_lead_partitions` | List all lead partitions configured in the Marketo instance. |
| `merge_leads` | Merge two or more leads into a single winning lead. Optionally merge in CRM simultaneously. |
| `associate_lead` | Associate a known lead with a Munchkin tracking cookie. |
| `push_lead_to_marketo` | Push a lead to Marketo via the push endpoint (used for data ingestion). Supports program attribution and source tracking. |
| `submit_form` | Submit a Marketo form programmatically with lead data and optional program attribution. |

### Static Lists

| Tool | Description |
|------|-------------|
| `get_lists` | Retrieve static lists. Filter by ID, name, programName, or workspaceName. Supports pagination. |
| `get_list_by_id` | Get a single static list by its ID. |
| `get_leads_by_list` | Get all leads that are members of a specific static list. Supports field selection and pagination. |
| `add_leads_to_list` | Add one or more leads to a static list by lead ID. |
| `remove_leads_from_list` | Remove one or more leads from a static list by lead ID. |
| `is_lead_member_of_list` | Check whether specific leads are members of a static list. Returns membership status for each lead. |

### Companies

| Tool | Description |
|------|-------------|
| `describe_company` | Get the company object schema — all fields, data types, and metadata. |
| `get_companies` | Look up companies by filter (e.g. externalCompanyId, company name, id). Supports field selection and pagination. |
| `create_update_companies` | Create or update company records. Supports createOnly, updateOnly, createOrUpdate actions with configurable dedup. |
| `delete_companies` | Delete company records by identifier. |

### Opportunities

| Tool | Description |
|------|-------------|
| `describe_opportunity` | Get the opportunity object schema. |
| `get_opportunities` | Look up opportunities by filter. Supports field selection and pagination. |
| `create_update_opportunities` | Create or update opportunity records with configurable action and dedup. |
| `delete_opportunities` | Delete opportunity records by identifier. |

### Opportunity Roles

| Tool | Description |
|------|-------------|
| `describe_opportunity_role` | Get the opportunity role object schema. |
| `get_opportunity_roles` | Look up opportunity roles by filter. Supports field selection and pagination. |
| `create_update_opportunity_roles` | Create or update opportunity role records with configurable action and dedup. |
| `delete_opportunity_roles` | Delete opportunity role records by identifier. |

### Sales Persons

| Tool | Description |
|------|-------------|
| `describe_sales_person` | Get the sales person object schema. |
| `get_sales_persons` | Look up sales persons by filter. Supports field selection and pagination. |
| `create_update_sales_persons` | Create or update sales person records with configurable action and dedup. |
| `delete_sales_persons` | Delete sales person records by identifier. |

### Named Accounts

| Tool | Description |
|------|-------------|
| `describe_named_account` | Get the named account object schema. |
| `get_named_accounts` | Look up named accounts by filter. Supports field selection and pagination. |
| `create_update_named_accounts` | Create or update named account records with configurable action and dedup. |
| `delete_named_accounts` | Delete named account records by identifier. |

### Named Account Lists

| Tool | Description |
|------|-------------|
| `get_named_account_lists` | List all named account lists. Supports pagination. |
| `get_named_account_list_members` | Get members of a specific named account list. Supports pagination. |
| `add_named_accounts_to_list` | Add named accounts to a named account list. |
| `remove_named_accounts_from_list` | Remove named accounts from a named account list. |

### Custom Objects

| Tool | Description |
|------|-------------|
| `list_custom_objects` | List all custom object types available in the instance. Optionally filter by API name. |
| `describe_custom_object` | Get the schema for a specific custom object type — fields, relationships, and metadata. |
| `get_custom_objects` | Query custom object records by filter. Supports field selection and pagination. |
| `create_update_custom_objects` | Create or update custom object records with configurable action and dedup. |
| `delete_custom_objects` | Delete custom object records by identifier. |

### Program Members

| Tool | Description |
|------|-------------|
| `describe_program_member` | Get the program member object schema. |
| `get_program_members` | Get members of a program by filter. Supports field selection and pagination. |
| `create_update_program_members` | Create or update program member records (change status, add data values). |
| `change_program_member_status` | Change the program membership status for one or more leads. |

---

## Activities

| Tool | Description |
|------|-------------|
| `get_activity_types` | List all activity types available in the instance, including their attributes and IDs. |
| `get_paging_token` | Get a paging token for activity queries. Required before calling `get_lead_activities` or `get_lead_changes`. Takes a start datetime. |
| `get_lead_activities` | Get activity records for leads. Requires a paging token. Filter by activity type IDs, list ID, or specific lead IDs. |
| `get_lead_changes` | Get data value change activities for specific fields. Requires a paging token. |
| `get_deleted_leads` | Get leads that have been deleted from the database. Requires a paging token. |
| `add_custom_activity` | Submit custom activity records to Marketo. |
| `get_custom_activity_types` | List all custom activity types defined in the instance. |
| `create_custom_activity_type` | Create a new custom activity type with a primary attribute, trigger name, filter name, and optional additional attributes. |

---

## Asset API

### Programs

| Tool | Description |
|------|-------------|
| `get_programs` | Get programs with optional filtering by type, ID, or update date range. Supports pagination. |
| `get_program_by_id` | Get a single program by its ID. |
| `get_program_by_name` | Get a program by its exact name. |
| `create_program` | Create a new program (types: program, event, webinar, nurture). Requires name, type, channel, and folder. Supports period costs and tags. |
| `update_program` | Update an existing program's name, description, costs, or tags. |
| `delete_program` | Delete a program by ID. |
| `clone_program` | Clone an existing program to a new name and destination folder. |

### Smart Campaigns

| Tool | Description |
|------|-------------|
| `get_smart_campaigns` | Get smart campaigns with optional filtering by update date range and active status. Supports pagination. |
| `get_smart_campaign_by_id` | Get a single smart campaign by its ID. |
| `trigger_campaign` | Trigger a smart campaign for specific leads. The campaign must have a "Campaign is Requested" trigger. Supports My Token overrides. |
| `schedule_campaign` | Schedule a batch smart campaign to run at a specified datetime. Supports token overrides and cloning to a new program. |

### Smart Lists

| Tool | Description |
|------|-------------|
| `get_smart_lists` | Get smart lists with optional filtering by update date range. Supports pagination. |
| `get_smart_list_by_id` | Get a single smart list by its ID. |
| `get_leads_by_smart_list` | Get all leads that match a smart list's criteria. Supports field selection and pagination. |

### Emails

| Tool | Description |
|------|-------------|
| `get_emails` | Get email assets. Filter by folder or approval status. Supports pagination. |
| `get_email_by_id` | Get a single email asset by its ID. Optionally specify draft or approved version. |
| `get_email_by_name` | Get an email by its exact name. |
| `get_email_content` | Get the editable content sections (HTML blocks) of an email. |
| `update_email_content_section` | Update a specific content section of an email by HTML ID. Supports Text, DynamicContent, and Snippet types. |
| `create_email` | Create a new email asset from a template. Set subject, from name/email, reply email, and operational flag. |
| `update_email` | Update email metadata — name, subject line, from/reply addresses, description, operational flag. |
| `approve_email` | Approve an email draft, making it the live version. |
| `unapprove_email` | Unapprove an email, reverting it to draft-only status. |
| `discard_email_draft` | Discard an email draft without approving. |
| `clone_email` | Clone an email asset to a new name and destination folder. |
| `delete_email` | Delete an email asset. |
| `send_sample_email` | Send a sample/test email to a specific address. Optionally use a lead ID for personalization context. |

### Email Templates

| Tool | Description |
|------|-------------|
| `get_email_templates` | Get email templates. Filter by approval status. Supports pagination. |
| `get_email_template_by_id` | Get an email template by ID. |
| `get_email_template_content` | Get the raw HTML content of an email template. |
| `create_email_template` | Create a new email template with HTML content. |
| `approve_email_template` | Approve an email template draft. |
| `unapprove_email_template` | Unapprove an email template. |

### Landing Pages

| Tool | Description |
|------|-------------|
| `get_landing_pages` | Get landing page assets. Filter by folder or approval status. Supports pagination. |
| `get_landing_page_by_id` | Get a landing page by ID. |
| `get_landing_page_by_name` | Get a landing page by its exact name. |
| `get_landing_page_content` | Get the editable content sections of a landing page. |
| `create_landing_page` | Create a new landing page from a template. Set title, description, and mobile-enabled flag. |
| `update_landing_page` | Update landing page metadata — name, title, description, mobile flag, custom CSS. |
| `approve_landing_page` | Approve a landing page draft. |
| `unapprove_landing_page` | Unapprove a landing page. |
| `discard_landing_page_draft` | Discard a landing page draft. |
| `clone_landing_page` | Clone a landing page to a new name and folder. |
| `delete_landing_page` | Delete a landing page. |

### Landing Page Templates

| Tool | Description |
|------|-------------|
| `get_landing_page_templates` | Get landing page templates. Filter by approval status. Supports pagination. |
| `get_landing_page_template_by_id` | Get a landing page template by ID. |
| `get_landing_page_template_content` | Get the raw HTML content of a landing page template. |

### Forms

| Tool | Description |
|------|-------------|
| `get_forms` | Get form assets. Filter by folder or approval status. Supports pagination. |
| `get_form_by_id` | Get a form by its ID. |
| `get_form_fields` | Get the field definitions for a specific form. |
| `approve_form` | Approve a form draft. |
| `clone_form` | Clone a form to a new name and destination folder. |
| `delete_form` | Delete a form. |

### Tokens (My Tokens)

| Tool | Description |
|------|-------------|
| `get_tokens` | Get all My Tokens for a folder or program. |
| `create_token` | Create or update a My Token in a folder or program. Supports types: text, rich text, date, score, number. |
| `delete_token` | Delete a My Token from a folder or program. |

### Folders

| Tool | Description |
|------|-------------|
| `get_folders` | Browse the folder tree. Filter by root folder, max depth, and workspace. Supports pagination. |
| `get_folder_by_id` | Get a folder by its ID. Optionally specify Folder or Program type. |
| `get_folder_by_name` | Get a folder by its exact name. Optionally filter by root folder and workspace. |
| `create_folder` | Create a new folder under a parent folder. |
| `delete_folder` | Delete a folder (must be empty). |

### Files & Images

| Tool | Description |
|------|-------------|
| `get_files` | Get files and images in a folder. Supports pagination. |
| `get_file_by_id` | Get a file/image by its ID. |
| `get_file_by_name` | Get a file/image by its exact name. |

### Snippets

| Tool | Description |
|------|-------------|
| `get_snippets` | Get snippet assets. Filter by approval status. Supports pagination. |
| `get_snippet_by_id` | Get a snippet by its ID. |
| `get_snippet_content` | Get the editable content of a snippet. |
| `approve_snippet` | Approve a snippet draft. |
| `clone_snippet` | Clone a snippet to a new name and folder. |
| `delete_snippet` | Delete a snippet. |

### Segmentations

| Tool | Description |
|------|-------------|
| `get_segmentations` | Get all segmentations in the instance. Filter by approval status. |
| `get_segments` | Get the individual segments within a segmentation. |

### Tags & Channels

| Tool | Description |
|------|-------------|
| `get_tags` | Get all tag types. Supports pagination. |
| `get_tag_by_name` | Get a tag type by its exact name, including all allowed values. |
| `get_channels` | Get all program channels. Supports pagination. |
| `get_channel_by_name` | Get a channel by its exact name, including progression statuses. |

---

## Bulk Import & Export

### Bulk Export — Leads

| Tool | Description |
|------|-------------|
| `create_bulk_export_leads_job` | Create a bulk lead export job. Specify fields to export and filter criteria (e.g. createdAt range, static list). Returns a job ID. |
| `enqueue_bulk_export_leads_job` | Enqueue (start processing) a created bulk lead export job. |
| `get_bulk_export_leads_job_status` | Check the status of a bulk lead export job (Created, Queued, Processing, Completed, Failed, Cancelled). |
| `get_bulk_export_leads_file` | Download the CSV/TSV file from a completed bulk lead export job. Truncates at 100K characters. |
| `cancel_bulk_export_leads_job` | Cancel a bulk lead export job. |
| `get_bulk_export_leads_jobs` | List all bulk lead export jobs. Optionally filter by status. |

### Bulk Export — Activities

| Tool | Description |
|------|-------------|
| `create_bulk_export_activities_job` | Create a bulk activity export job. Filter must include createdAt range and optionally activity type IDs. |
| `enqueue_bulk_export_activities_job` | Enqueue a bulk activity export job. |
| `get_bulk_export_activities_job_status` | Check the status of a bulk activity export job. |
| `get_bulk_export_activities_file` | Download the file from a completed bulk activity export job. |

### Bulk Export — Custom Objects

| Tool | Description |
|------|-------------|
| `create_bulk_export_custom_objects_job` | Create a bulk custom object export job for a specific custom object type. |
| `enqueue_bulk_export_custom_objects_job` | Enqueue a bulk custom object export job. |
| `get_bulk_export_custom_objects_job_status` | Check the status of a bulk custom object export job. |

### Bulk Import — Leads

| Tool | Description |
|------|-------------|
| `get_bulk_import_leads_jobs` | List all bulk lead import jobs. Optionally filter by status. |
| `get_bulk_import_leads_job_status` | Check the status of a bulk lead import job by batch ID. |
| `get_bulk_import_leads_failures` | Download the failure records from a bulk lead import job — rows that failed with error details. |
| `get_bulk_import_leads_warnings` | Download the warning records from a bulk lead import job — rows that succeeded with warnings. |

### Bulk Import — Custom Objects

| Tool | Description |
|------|-------------|
| `get_bulk_import_custom_objects_jobs` | List bulk custom object import jobs for a specific custom object type. |

---

## Usage & Statistics

| Tool | Description |
|------|-------------|
| `get_daily_usage` | Get API call usage statistics for the current day. |
| `get_last_7_days_usage` | Get API call usage statistics for the last 7 days. |
| `get_daily_errors` | Get API error statistics for the current day. |
| `get_last_7_days_errors` | Get API error statistics for the last 7 days. |

---

## Schema Management

### Lead Fields

| Tool | Description |
|------|-------------|
| `get_lead_fields` | Get all lead fields (standard and custom) with their data types and metadata. Supports pagination. |
| `create_lead_field` | Create a new custom lead field. Specify API name, display name, and data type (string, integer, date, datetime, email, phone, url, currency, text, boolean, float, percent, score). |
| `update_lead_field` | Update a custom lead field's display name, description, or visibility. |

### Custom Object Types

| Tool | Description |
|------|-------------|
| `create_custom_object_type` | Create a new custom object type. API name must end with `_c`. |
| `update_custom_object_type` | Update a custom object type's display name, plural name, or description. |
| `approve_custom_object_type` | Approve a custom object type draft, making it available for use. |
| `discard_custom_object_type_draft` | Discard a custom object type draft without approving. |
| `delete_custom_object_type` | Delete a custom object type entirely. |
| `add_custom_object_field` | Add one or more fields to a custom object type. Supports dedup fields and relationship links. |
