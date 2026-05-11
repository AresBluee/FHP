const fs = require('fs');
const files = [
    'src/app/shared/components/home/home.component.html',
    'src/app/modules/pages/nosotros/nosotros.component.html',
    'src/app/modules/pages/cultivos/cultivos.component.html',
    'src/app/modules/pages/postular/postular.component.html',
    'src/app/modules/auth/pages/login/login.component.html'
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let html = fs.readFileSync(f, 'utf8');
    
    // Remove Navbar (everything before and including </nav>)
    const navEndIdx = html.indexOf('</nav>');
    if (navEndIdx !== -1) {
        html = html.substring(navEndIdx + '</nav>'.length);
    }
    
    // Remove Footer
    html = html.replace(/<footer[\s\S]*?<\/footer>/, '');
    
    // Trim leading/trailing newlines
    html = html.trim();
    
    fs.writeFileSync(f, html);
    console.log("Cleaned: " + f);
});
