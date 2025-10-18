import { styleText } from 'bun:util';

const project = 'country-coder';
const hostname = '127.0.0.1';
const port = 8080;
const matchCDN = new RegExp(`jsdelivr.*${project}.*(\/dist.*)$`, 'i');


// Replace urls for CDN `dist/*` files with local `dist/*` files.
// e.g. 'https://cdn.jsdelivr.net/npm/path/to/dist/file.min.js' -> '/dist/file.js'
const rewriter = new HTMLRewriter().on('script', {
  element(script) {
    const src = script.getAttribute('src');
    const cdn = src?.match(matchCDN);
    if (cdn) {
      const local = cdn[1].replace('.min', '');
      script.setAttribute('src', local);
    }
  }
});


// Start the server!
const server = Bun.serve({
  hostname: hostname,
  port: port,
  development: {
    console: true
  },
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.split('/');
    const last = path.length - 1;
    console.log(styleText('yellowBright', `${req.method}:  ${url.pathname}`));

    path[0] = 'docs';            // leading '/' -> serve from './docs'
    if (path[last] === '') {     // no filename, default to 'index.html'
      path[last] = 'index.html';
    }
    if (path[1] === 'dist') {  // Also allow serving files from './dist/*'
      path.shift();            // (remove leading 'docs')
    }

    const filePath = './' + path.join('/');

    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        console.log(styleText('greenBright', `200:  Found → '${filePath}'`));

        if (/html$/.test(filePath)) {
          const content = rewriter.transform(await file.text());
          return new Response(content, { headers: { 'content-type': 'text/html' }});
        } else {
          return new Response(file);
        }
      }
    } catch (error) {
      // Handle potential errors during file access
      console.error(`Error serving file: ${filePath}`, error);
    }

    // If file not found or error, return 404
    console.log(styleText('redBright', `404:  Not Found → '${filePath}'`));
    return new Response('Not Found', { status: 404 });
  }
});

console.log('');
console.log(styleText(['blue', 'bold'], `Bun v${Bun.version}`));
console.log(styleText('cyanBright', `Serving:    ['docs/*', 'dist/*']`));
console.log(styleText('cyanBright', `Listening:  ${server.url}`));
console.log(styleText(['whiteBright', 'bold'], `Ctrl-C to stop`));
console.log('');
