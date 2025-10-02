# Gmail Manager

A Node.js application for managing Gmail emails using the Gmail API.

## Setup

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Gmail API
   - Create OAuth 2.0 credentials (Desktop application)
   - Download the credentials JSON file

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Google OAuth credentials:
   - `GOOGLE_CLIENT_ID`: Your OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth client secret
   - `GOOGLE_REDIRECT_URI`: Redirect URI (default: http://localhost:3000/auth/callback)

3. **Install Dependencies**:
   ```bash
   npm install
   ```

## Usage

Run the CLI application:
```bash
npm start
```

### First Time Setup
1. The app will generate an authorization URL
2. Visit the URL in your browser
3. Authorize the application
4. Copy the authorization code
5. Paste it into the CLI when prompted

### Available Commands

**Email Listing & Details:**
- `list [count]` - List recent emails (default: 10)
- `details <messageId>` - Get detailed information about a specific email

**Filtering & Search:**
- `filter <query> [count]` - Filter emails using Gmail search syntax
- `search-sender <email> [count]` - Search emails by sender
- `search-subject <text> [count]` - Search emails by subject
- `search-unread [count]` - List unread emails

**Label Management:**
- `labels` - List all available labels
- `create-label <name>` - Create a new label
- `add-label <messageId> <labelId>` - Add label to an email
- `remove-label <messageId> <labelId>` - Remove label from an email

**Archive Management:**
- `archive <messageId>` - Archive an email (remove from inbox)
- `unarchive <messageId>` - Unarchive an email (add back to inbox)

**General:**
- `quit` - Exit the application

## Features

- OAuth 2.0 authentication with Google
- List and search emails with various filters
- View detailed email information including labels
- Create and manage custom labels
- Apply/remove labels to/from emails
- Archive and unarchive emails
- Advanced filtering using Gmail search syntax
- Secure token storage

## API Permissions

The app requests the following Gmail scopes:
- `gmail.readonly` - Read email messages and labels
- `gmail.modify` - Modify email messages (labeling, archiving)

## Gmail Search Syntax

When using the `filter` command, you can use Gmail's powerful search syntax:
- `from:sender@example.com` - Emails from specific sender
- `to:recipient@example.com` - Emails to specific recipient
- `subject:"exact phrase"` - Emails with exact subject phrase
- `has:attachment` - Emails with attachments
- `is:unread` - Unread emails
- `is:starred` - Starred emails
- `label:labelname` - Emails with specific label
- `newer_than:7d` - Emails newer than 7 days
- `older_than:1m` - Emails older than 1 month
- `size:larger:10M` - Emails larger than 10MB

## File Structure

- `index.js` - Main GmailManager class
- `cli.js` - Command-line interface
- `.env` - Environment variables (create from .env.example)
- `token.json` - Stored authentication token (auto-generated)