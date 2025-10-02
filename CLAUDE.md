# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Gmail management application that uses the Gmail API to help users manage their email.

## Development Commands

- `npm start` - Run the CLI application
- `npm install` - Install dependencies

## Architecture

### Core Components

- **GmailManager** (`index.js`) - Main class handling Gmail API interactions
  - OAuth 2.0 authentication flow
  - Email fetching and details retrieval
  - Token management and storage
- **CLI Interface** (`cli.js`) - Command-line interface for user interaction
  - Interactive commands for listing and viewing emails
  - Authentication setup flow

### Key Dependencies

- `googleapis` - Google APIs client library for Gmail API access
- `dotenv` - Environment variable management for OAuth credentials

### Authentication Flow

1. OAuth 2.0 setup with Google Cloud Console credentials
2. First-time authorization generates and stores refresh token
3. Subsequent runs use stored token for API access

### File Structure

- `.env` - OAuth credentials (create from .env.example)
- `token.json` - Stored authentication token (auto-generated)
- Configuration files: `.gitignore`, `package.json`

## Setup Requirements

Requires Google Cloud Console project with Gmail API enabled and OAuth 2.0 credentials configured.