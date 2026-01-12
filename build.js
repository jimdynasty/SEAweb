#!/usr/bin/env node

/**
 * Build script to generate JSON from markdown files
 * Runs during Netlify build to create public API files
 */

const fs = require('fs');
const path = require('path');

// Parse markdown frontmatter
function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const frontmatter = {};
    const lines = match[1].split('\n');

    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            value = value.replace(/^["']|["']$/g, '');
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            frontmatter[key] = value;
        }
    });

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
