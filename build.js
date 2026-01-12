#!/usr/bin/env node

/**
 * Build script to generate JSON from markdown files
 * Runs during Netlify build to create public API files
 */

const fs = require('fs');
const path = require('path');

// Parse markdown frontmatter with proper multi-line YAML support
function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const frontmatter = {};
    const frontmatterText = match[1];

    let currentKey = null;
    let currentValue = [];

    frontmatterText.split('\n').forEach(line => {
        // Check if line starts a new key (no leading whitespace and has colon)
        if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) && !line.startsWith(' ')) {
            // Save previous key-value if exists
            if (currentKey) {
                let value = currentValue.join(' ').trim();
                value = value.replace(/^["']|["']$/g, '');
                if (value === 'true') value = true;
                if (value === 'false') value = false;
                frontmatter[currentKey] = value;
            }

            // Start new key-value
            const colonIndex = line.indexOf(':');
            currentKey = line.substring(0, colonIndex).trim();
            const firstValue = line.substring(colonIndex + 1).trim();
            currentValue = firstValue ? [firstValue] : [];
        } else if (currentKey && line.trim() && line.startsWith('  ')) {
            // This is a continuation line (indented)
            currentValue.push(line.trim());
        }
    });

    // Save the last key-value pair
    if (currentKey) {
        let value = currentValue.join(' ').trim();
        value = value.replace(/^["']|["']$/g, '');
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        frontmatter[currentKey] = value;
    }

    frontmatter.content = match[2].trim();
    return frontmatter;
}

// Process markdown files in a directory
function processMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const files = fs.readdirSync(dir);
    const results = [];

    files.forEach(file => {
        if (file.endsWith('.md')) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = parseFrontmatter(content);
            if (data) {
                results.push(data);
            }
        }
    });

    return results;
}

// Main build process
function build() {
    console.log('📦 Building CMS data files...');

    // Process events
    const events = processMarkdownFiles('content/events');
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/events.json', JSON.stringify(events, null, 2));
    console.log(`✅ Generated events.json with ${events.length} events`);

    // Process news
    const news = processMarkdownFiles('content/news');
    fs.writeFileSync('public/news.json', JSON.stringify(news, null, 2));
    console.log(`✅ Generated news.json with ${news.length} news posts`);

    console.log('✨ Build complete!');
}

build();
