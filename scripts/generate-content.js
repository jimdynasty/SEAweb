const fs = require('fs');
const path = require('path');

// Simple YAML frontmatter parser
function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const frontmatterText = match[1];
    const content = match[2].trim();
    const frontmatter = {};

    let currentKey = null;
    let currentValue = [];

    const lines = frontmatterText.split('\n');

    for (const line of lines) {
        // Key-value pair (e.g. "title: Hello World")
        const keyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);

        if (keyMatch && !line.startsWith(' ')) {
            // Save previous
            if (currentKey) {
                saveValue(frontmatter, currentKey, currentValue);
            }

            currentKey = keyMatch[1];
            const val = keyMatch[2].trim();
            currentValue = val ? [val] : [];
        }
        // Continuation line (e.g. "  description continued")
        else if (currentKey && line.startsWith('  ')) {
            currentValue.push(line.trim());
        }
    }

    // Save last
    if (currentKey) {
        saveValue(frontmatter, currentKey, currentValue);
    }

    frontmatter.body = content; // Store markdown body if needed
    return frontmatter;
}

function saveValue(obj, key, valArray) {
    let val = valArray.join(' ').trim();

    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }

    // Type conversion
    if (val === 'true') val = true;
    else if (val === 'false') val = false;

    obj[key] = val;
}

function processDirectory(dirName) {
    const dirPath = path.join(__dirname, '..', 'content', dirName);
    if (!fs.existsSync(dirPath)) return [];

    const items = [];
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        if (!file.endsWith('.md')) return;

        try {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
            const data = parseFrontmatter(content);
            if (data) {
                // Add filename/slug if needed
                data._filename = file;
                items.push(data);
            }
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    });

    return items;
}

// Generate Events
const events = processDirectory('events');
fs.writeFileSync(path.join(__dirname, '..', 'events.json'), JSON.stringify(events, null, 2));
console.log(`Generated events.json with ${events.length} items`);

// Generate News
const news = processDirectory('news');
fs.writeFileSync(path.join(__dirname, '..', 'news.json'), JSON.stringify(news, null, 2));
console.log(`Generated news.json with ${news.length} items`);
