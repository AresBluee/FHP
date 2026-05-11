const fs = require('fs');
const files = [
    { html: 'src/app/shared/components/home/home.component.html', scss: 'src/app/shared/components/home/home.component.scss' },
    { html: 'src/app/modules/pages/nosotros/nosotros.component.html', scss: 'src/app/modules/pages/nosotros/nosotros.component.scss' },
    { html: 'src/app/modules/pages/cultivos/cultivos.component.html', scss: 'src/app/modules/pages/cultivos/cultivos.component.scss' },
    { html: 'src/app/modules/pages/postular/postular.component.html', scss: 'src/app/modules/pages/postular/postular.component.scss' },
    { html: 'src/app/modules/auth/pages/login/login.component.html', scss: 'src/app/modules/auth/pages/login/login.component.scss' }
];

const classesToUnapply = ['material-symbols-outlined', 'docked', 'full-width', 'flat', 'no', 'shadows', 'group', 'fill', 'group/link', 'animate-pulse-slow'];

files.forEach(f => {
    if (!fs.existsSync(f.html) || !fs.existsSync(f.scss)) return;
    
    let htmlContent = fs.readFileSync(f.html, 'utf8');
    let scssContent = fs.readFileSync(f.scss, 'utf8');
    
    const scssRegex = /\.([a-zA-Z0-9-]+)\s*\{\s*@apply\s+([^;]+);\s*\}/g;
    let match;
    
    let modifiedScss = scssContent;
    let modifiedHtml = htmlContent;
    
    while ((match = scssRegex.exec(scssContent)) !== null) {
        const className = match[1];
        let applyClasses = match[2].split(/\s+/);
        
        let removedClasses = [];
        let keptClasses = [];
        
        applyClasses.forEach(c => {
            if (classesToUnapply.includes(c)) {
                removedClasses.push(c);
            } else {
                keptClasses.push(c);
            }
        });
        
        if (removedClasses.length > 0) {
            const originalRule = match[0];
            const newRule = keptClasses.length > 0 ? `.${className} {\n  @apply ${keptClasses.join(' ')};\n}` : `.${className} {}`;
            modifiedScss = modifiedScss.replace(originalRule, newRule);
            
            const htmlClassRegex = new RegExp(`class="([^"]*?\\b${className}\\b[^"]*)"`, 'g');
            modifiedHtml = modifiedHtml.replace(htmlClassRegex, (htmlMatch, classAttr) => {
                return `class="${classAttr} ${removedClasses.join(' ')}"`;
            });
        }
    }
    
    fs.writeFileSync(f.html, modifiedHtml);
    fs.writeFileSync(f.scss, modifiedScss);
});

