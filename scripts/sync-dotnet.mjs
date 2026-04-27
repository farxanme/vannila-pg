import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vanillaRoot = resolve(__dirname, '..');
const webAppRoot = resolve(vanillaRoot, '..');
const distRoot = resolve(vanillaRoot, 'dist');
const wwwrootPath = resolve(webAppRoot, 'wwwroot');
const viewsPath = resolve(webAppRoot, 'Views');

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath);
    }
  }
}

function extractAppInnerHtml(indexHtml) {
  const appStartTag = '<div id="app">';
  const appStart = indexHtml.indexOf(appStartTag);
  if (appStart < 0) {
    throw new Error('Cannot find #app container in dist/index.html');
  }

  const contentStart = appStart + appStartTag.length;
  const divTagRegex = /<\/?div\b[^>]*>/g;
  divTagRegex.lastIndex = contentStart;
  let depth = 1;

  while (true) {
    const match = divTagRegex.exec(indexHtml);
    if (!match) {
      throw new Error('Cannot find closing </div> for #app in dist/index.html');
    }

    if (match[0].startsWith('</div')) {
      depth -= 1;
    } else {
      depth += 1;
    }

    if (depth === 0) {
      return indexHtml.slice(contentStart, match.index).trim();
    }
  }
}

function buildLayoutTemplate(indexHtml) {
  const htmlTagMatch = indexHtml.match(/<html[^>]*>/i);
  const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (!htmlTagMatch || !headMatch) {
    throw new Error('Cannot parse <html> or <head> from dist/index.html');
  }

  const headInner = headMatch[1].trim();

  return `<!doctype html>
${htmlTagMatch[0]}
<head>
${headInner}
</head>
<body>
  <div id="app">
    @RenderBody()
  </div>

  <!-- Scripts -->
</body>
</html>
`;
}

function buildInitTemplate(indexHtml) {
  const appInnerHtml = extractAppInnerHtml(indexHtml);

  const razorInitData = `@{
  var initData = Model.Data;
}
<div id="payment-init-data"
     class="payment-init-data"
     hidden
     aria-hidden="true"
     data-user-session-key="@((initData?.UserSessionKey) ?? string.Empty)"
     data-transaction-id="@((initData == null) ? string.Empty : Convert.ToString(initData.TransactionId))"
     data-ref-num="@((initData == null) ? string.Empty : Convert.ToString(initData.RefNum))"
     data-terminal-number="@((initData == null) ? string.Empty : Convert.ToString(initData.TerminalNumber))"
     data-salt="@((initData?.Salt) ?? string.Empty)"></div>`;

  const replacedAppInner = appInnerHtml.replace(
    /<!-- SSR:[\s\S]*?<\/div>/,
    `<!-- SSR: session fields (same as former Data.* hidden inputs). Server fills data-* values. -->\n${razorInitData}`,
  );

  return `@model ApiResponse<InitializedTransactionMessage>

${replacedAppInner}
`;
}

async function syncAssets() {
  const mappings = [
    { source: join(distRoot, 'assets'), target: join(wwwrootPath, 'assets') },
    { source: join(distRoot, 'favicons'), target: join(wwwrootPath, 'favicons') },
    { source: join(distRoot, 'images'), target: join(wwwrootPath, 'images') },
    { source: join(distRoot, 'assets', 'images'), target: join(wwwrootPath, 'assets', 'images') },
  ];

  for (const { source, target } of mappings) {
    if (!(await pathExists(source))) {
      continue;
    }

    await rm(target, { recursive: true, force: true });
    await copyDirectory(source, target);
  }
}

async function syncViews(indexHtml) {
  const layoutPath = join(viewsPath, 'Shared', '_Layout.cshtml');
  const initPath = join(viewsPath, 'InitTransaction', 'Init.cshtml');

  const layoutContent = buildLayoutTemplate(indexHtml);
  const initContent = buildInitTemplate(indexHtml);

  await writeFile(layoutPath, layoutContent, 'utf8');
  await writeFile(initPath, initContent, 'utf8');
}

async function main() {
  const indexPath = join(distRoot, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');

  await syncAssets();
  await syncViews(indexHtml);
}

await main();
