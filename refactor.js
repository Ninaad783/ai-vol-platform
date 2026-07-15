const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/ai vol/AI-Volunteer-Platform/client/src');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000/api')) {
    // We safely replace "http://localhost:5000/api..." with `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api...`
    
    // First, find and replace the exact base URL
    content = content.replace(/\"http:\/\/localhost:5000\/api/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api');
    
    // Because we just changed the opening quote of the string from " to `, we need to fix the closing quote.
    // We look for /api/something" or /api/something` if it was already a template literal.
    // To be perfectly safe, we replace occurrences of (API_URL || ...)/api... " with ... `
    content = content.replace(/(\`\$\{import\.meta\.env\.VITE_API_URL[^\}]+\}\/api[^\"]*)\"/g, '$1`');
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Fixed:', file);
  }
});
console.log('Total files fixed:', modifiedCount);
