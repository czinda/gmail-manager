#!/usr/bin/env node

const GmailManager = require('./index');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const gmailManager = new GmailManager();
  
  console.log('Gmail Manager CLI');
  console.log('================');
  
  const authenticated = await gmailManager.authenticate();
  
  if (!authenticated) {
    console.log('\nFirst time setup required.');
    console.log('1. Visit the URL above to authorize the app');
    console.log('2. Copy the authorization code');
    
    const code = await question('Enter the authorization code: ');
    const success = await gmailManager.saveToken(code);
    
    if (!success) {
      console.log('Authentication failed. Exiting.');
      rl.close();
      return;
    }
  }

  while (true) {
    console.log('\nAvailable commands:');
    console.log('1. list [count] - List recent emails');
    console.log('2. details <messageId> - Get email details');
    console.log('3. filter <query> [count] - Filter emails by query');
    console.log('4. search-sender <email> [count] - Search by sender');
    console.log('5. search-subject <text> [count] - Search by subject');
    console.log('6. search-unread [count] - List unread emails');
    console.log('7. labels - List all labels');
    console.log('8. create-label <name> - Create new label');
    console.log('9. add-label <messageId> <labelId> - Add label to email');
    console.log('10. remove-label <messageId> <labelId> - Remove label from email');
    console.log('11. archive <messageId> - Archive email');
    console.log('12. unarchive <messageId> - Unarchive email');
    console.log('13. quit - Exit the application');
    
    const command = await question('\nEnter command: ');
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'list':
        const count = args[0] ? parseInt(args[0]) : 10;
        console.log(`\nFetching ${count} recent emails...`);
        const emails = await gmailManager.listEmails(count);
        
        for (const email of emails.slice(0, 5)) {
          const details = await gmailManager.getEmailDetails(email.id);
          if (details) {
            console.log(`\nID: ${details.id}`);
            console.log(`From: ${details.from}`);
            console.log(`Subject: ${details.subject}`);
            console.log(`Date: ${details.date}`);
            console.log(`Labels: ${details.labelIds.join(', ')}`);
            console.log(`Preview: ${details.snippet}`);
            console.log('-'.repeat(50));
          }
        }
        break;
        
      case 'details':
        if (!args[0]) {
          console.log('Please provide a message ID');
          break;
        }
        
        const details = await gmailManager.getEmailDetails(args[0]);
        if (details) {
          console.log(`\nEmail Details:`);
          console.log(`ID: ${details.id}`);
          console.log(`From: ${details.from}`);
          console.log(`Subject: ${details.subject}`);
          console.log(`Date: ${details.date}`);
          console.log(`Labels: ${details.labelIds.join(', ')}`);
          console.log(`Content: ${details.snippet}`);
        } else {
          console.log('Email not found or error occurred');
        }
        break;

      case 'filter':
        if (!args[0]) {
          console.log('Please provide a search query');
          break;
        }
        
        const filterCount = args[1] ? parseInt(args[1]) : 10;
        const filteredEmails = await gmailManager.filterEmails(args[0], filterCount);
        
        for (const email of filteredEmails.slice(0, 5)) {
          const emailDetails = await gmailManager.getEmailDetails(email.id);
          if (emailDetails) {
            console.log(`\nID: ${emailDetails.id}`);
            console.log(`From: ${emailDetails.from}`);
            console.log(`Subject: ${emailDetails.subject}`);
            console.log(`Date: ${emailDetails.date}`);
            console.log(`Preview: ${emailDetails.snippet}`);
            console.log('-'.repeat(50));
          }
        }
        break;

      case 'search-sender':
        if (!args[0]) {
          console.log('Please provide sender email address');
          break;
        }
        
        const senderCount = args[1] ? parseInt(args[1]) : 10;
        const senderEmails = await gmailManager.searchBySender(args[0], senderCount);
        
        for (const email of senderEmails.slice(0, 5)) {
          const emailDetails = await gmailManager.getEmailDetails(email.id);
          if (emailDetails) {
            console.log(`\nID: ${emailDetails.id}`);
            console.log(`From: ${emailDetails.from}`);
            console.log(`Subject: ${emailDetails.subject}`);
            console.log(`Date: ${emailDetails.date}`);
            console.log(`Preview: ${emailDetails.snippet}`);
            console.log('-'.repeat(50));
          }
        }
        break;

      case 'search-subject':
        if (!args[0]) {
          console.log('Please provide subject text to search for');
          break;
        }
        
        const subjectCount = args[1] ? parseInt(args[1]) : 10;
        const subjectEmails = await gmailManager.searchBySubject(args[0], subjectCount);
        
        for (const email of subjectEmails.slice(0, 5)) {
          const emailDetails = await gmailManager.getEmailDetails(email.id);
          if (emailDetails) {
            console.log(`\nID: ${emailDetails.id}`);
            console.log(`From: ${emailDetails.from}`);
            console.log(`Subject: ${emailDetails.subject}`);
            console.log(`Date: ${emailDetails.date}`);
            console.log(`Preview: ${emailDetails.snippet}`);
            console.log('-'.repeat(50));
          }
        }
        break;

      case 'search-unread':
        const unreadCount = args[0] ? parseInt(args[0]) : 10;
        const unreadEmails = await gmailManager.searchUnread(unreadCount);
        
        for (const email of unreadEmails.slice(0, 5)) {
          const emailDetails = await gmailManager.getEmailDetails(email.id);
          if (emailDetails) {
            console.log(`\nID: ${emailDetails.id}`);
            console.log(`From: ${emailDetails.from}`);
            console.log(`Subject: ${emailDetails.subject}`);
            console.log(`Date: ${emailDetails.date}`);
            console.log(`Preview: ${emailDetails.snippet}`);
            console.log('-'.repeat(50));
          }
        }
        break;

      case 'labels':
        const labels = await gmailManager.listLabels();
        console.log('\nAvailable Labels:');
        labels.forEach(label => {
          console.log(`ID: ${label.id} | Name: ${label.name}`);
        });
        break;

      case 'create-label':
        if (!args[0]) {
          console.log('Please provide a label name');
          break;
        }
        
        const newLabel = await gmailManager.createLabel(args[0]);
        if (newLabel) {
          console.log(`Label created successfully: ${newLabel.name} (ID: ${newLabel.id})`);
        }
        break;

      case 'add-label':
        if (!args[0] || !args[1]) {
          console.log('Please provide messageId and labelId');
          break;
        }
        
        const addSuccess = await gmailManager.addLabel(args[0], args[1]);
        if (addSuccess) {
          console.log('Label added successfully');
        }
        break;

      case 'remove-label':
        if (!args[0] || !args[1]) {
          console.log('Please provide messageId and labelId');
          break;
        }
        
        const removeSuccess = await gmailManager.removeLabel(args[0], args[1]);
        if (removeSuccess) {
          console.log('Label removed successfully');
        }
        break;

      case 'archive':
        if (!args[0]) {
          console.log('Please provide a message ID');
          break;
        }
        
        const archiveSuccess = await gmailManager.archiveEmail(args[0]);
        if (archiveSuccess) {
          console.log('Email archived successfully');
        }
        break;

      case 'unarchive':
        if (!args[0]) {
          console.log('Please provide a message ID');
          break;
        }
        
        const unarchiveSuccess = await gmailManager.unarchiveEmail(args[0]);
        if (unarchiveSuccess) {
          console.log('Email unarchived successfully');
        }
        break;
        
      case 'quit':
      case 'exit':
        console.log('Goodbye!');
        rl.close();
        return;
        
      default:
        console.log('Unknown command. Please try again.');
    }
  }
}

main().catch(console.error);