const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
const outputFile = path.join(__dirname, 'posts.json');

// Simple regex to parse YAML frontmatter
function parseFrontmatter(content) {
    const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!match) return null;

    const yamlBlock = match[1];
    const metadata = {};

    yamlBlock.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();

            // Handle arrays (e.g. tags: [a, b])
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.substring(1, value.length - 1).split(',').map(s => s.trim());
            }

            // Handle list items (e.g. - item) - simple case for tags
            // This is a very basic parser, might fail on complex YAML

            metadata[key] = value;
        }
    });

    // Clean up tags if they were parsed as a single string from a list block
    // (Our simple parser above doesn't handle multi-line lists well, so let's rely on [a, b] format for now
    // or manually fix the tags in the MD file if needed)

    return metadata;
}

function generatePosts() {
    if (!fs.existsSync(contentDir)) {
        console.error('Content directory not found!');
        return;
    }

    const files = fs.readdirSync(contentDir);
    const posts = [];

    files.forEach(file => {
        if (path.extname(file) === '.md') {
            const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
            const metadata = parseFrontmatter(content);

            if (metadata) {
                // Combine custom ID or filename
                const postData = {
                    ...metadata,
                    filename: file,
                    id: metadata.id || file.replace('.md', '')
                };
                posts.push(postData);
            }
        }
    });

    // Sort by date desc
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 4));
    console.log(`Successfully generated posts.json with ${posts.length} posts.`);
}

generatePosts();
