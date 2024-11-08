import * as path from "jsr:@std/path";

const PORT: number = 8000;

const MIME_TYPES: { [extention: string]: string } = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const STATIC_PATH = path.join(Deno.cwd(), "./static");

const prepareFile = async (url_path: string, _search_params: string) => {
  const paths = [STATIC_PATH, url_path];

  // #1
  if (url_path.endsWith("/")) {
    paths.push("index.html");
  }

  const filePath = path.join(...paths);

  // #2
  const pathTraversal = !filePath.startsWith(STATIC_PATH);

  let exists: boolean;

  try {
    await Deno.lstat(filePath);
    exists = true
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    exists = false
  }

  const found = !pathTraversal && exists;

  // #3
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";

  const ext = path.extname(streamPath)
    .substring(1)
    .toLowerCase();

  const file = await Deno.open(
    streamPath,
    { read: true },
  );

  const stream = file.readable;

  return { found, ext, stream };
};

if (import.meta.main) {
  Deno.serve({ port: PORT }, async (req) => {
    const url = new URL(req.url);
    const file = await prepareFile(url.pathname, url.search)
    const statusCode = file.found ? 200 : 404;
    const mimeType: string = MIME_TYPES[file.ext] || MIME_TYPES.default;

    console.info(`${req.method} ${req.url} ${statusCode}`);

    return new Response(file.stream, {
      status: statusCode,
      headers: {
        "content-type": mimeType,
      },
    });
  });
}
