const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

['app', 'components'].forEach(dir => {
    const absoluteDir = path.resolve(process.cwd(), dir);
    walk(absoluteDir, (file) => {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            let content = fs.readFileSync(file, 'utf8');
            let newContent = content.replace(/dark:[a-zA-Z0-9\-\.\/\:\[\]#%]+/g, '');
            if (content !== newContent) {
                fs.writeFileSync(file, newContent);
                console.log(`Updated ${file}`);
            }
        }
    });
});
