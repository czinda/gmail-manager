require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GmailManager {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async authenticate() {
    const tokenPath = path.join(__dirname, 'token.json');
    
    try {
      const token = await fs.readFile(tokenPath);
      this.oauth2Client.setCredentials(JSON.parse(token));
      console.log('Using existing authentication token');
      return true;
    } catch (error) {
      console.log('No existing token found. Please run the authentication flow.');
      return this.getNewToken();
    }
  }

  getNewToken() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('After authorization, you will need to save the token manually.');
    return false;
  }

  async saveToken(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      const tokenPath = path.join(__dirname, 'token.json');
      await fs.writeFile(tokenPath, JSON.stringify(tokens));
      console.log('Token stored successfully');
      return true;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return false;
    }
  }

  async listEmails(maxResults = 10) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} emails`);
      
      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }

  async getEmailDetails(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const message = response.data;
      const headers = message.payload.headers;
      
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date';

      return {
        id: messageId,
        subject,
        from,
        date,
        snippet: message.snippet,
        labelIds: message.labelIds || []
      };
    } catch (error) {
      console.error('Error fetching email details:', error);
      return null;
    }
  }

  async listLabels() {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me',
      });

      return response.data.labels || [];
    } catch (error) {
      console.error('Error fetching labels:', error);
      return [];
    }
  }

  async createLabel(name) {
    try {
      const response = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      });

      console.log(`Created label: ${name}`);
      return response.data;
    } catch (error) {
      console.error('Error creating label:', error);
      return null;
    }
  }

  async addLabel(messageId, labelId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId]
        }
      });

      console.log(`Added label to message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error adding label:', error);
      return false;
    }
  }

  async removeLabel(messageId, labelId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: [labelId]
        }
      });

      console.log(`Removed label from message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error removing label:', error);
      return false;
    }
  }

  async archiveEmail(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX']
        }
      });

      console.log(`Archived message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error archiving email:', error);
      return false;
    }
  }

  async unarchiveEmail(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['INBOX']
        }
      });

      console.log(`Unarchived message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error unarchiving email:', error);
      return false;
    }
  }

  async filterEmails(query, maxResults = 10) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} emails matching query: ${query}`);
      
      return messages;
    } catch (error) {
      console.error('Error filtering emails:', error);
      return [];
    }
  }

  async searchByLabel(labelName, maxResults = 10) {
    return this.filterEmails(`label:${labelName}`, maxResults);
  }

  async searchBySender(sender, maxResults = 10) {
    return this.filterEmails(`from:${sender}`, maxResults);
  }

  async searchBySubject(subject, maxResults = 10) {
    return this.filterEmails(`subject:${subject}`, maxResults);
  }

  async searchUnread(maxResults = 10) {
    return this.filterEmails('is:unread', maxResults);
  }
}

module.exports = GmailManager;