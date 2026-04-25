const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.sql')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // 1. Delete lines that are purely decorative single-line comments
            const pureDecorativeRegex = /^[ \t]*(?:\/\/|--)[ \t]*[=─-]{5,}[ \t]*\r?\n/gm;
            content = content.replace(pureDecorativeRegex, '');
            
            // 2. Strip long sequences of equals/box-drawings everywhere else (preserves /* and */)
            content = content.replace(/[=─-]{5,}/g, '');
            
            // 3. Clean up empty comments left behind
            content = content.replace(/^[ \t]*(?:\/\/|--)[ \t]*\r?\n/gm, '');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Cleaned:', fullPath);
            }
        }
    }
}

console.log('Starting cleanup...');
processDir(path.join(__dirname, 'src'));
processDir(path.join(__dirname, 'supabase'));
console.log('Done!');
