#!/usr/bin/env node
// Script to replace useNavigate with useHistory in all screen files
// Run with: node fix-navigation.js

const fs = require('fs');
const path = require('path');

const screensDir = './src/app/screens';

// Read all files in the screens directory
fs.readdir(screensDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(screensDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace const navigate = useNavigate() with const history = useHistory()
      content = content.replace(/const navigate = useNavigate\(\);/g, 'const history = useHistory();');
      
      // Replace navigate( with history.push(
      content = content.replace(/navigate\(/g, 'history.push(');
      
      // Write back
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${file}`);
    }
  });
});
