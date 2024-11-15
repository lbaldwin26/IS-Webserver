import { parseArgs } from "jsr:@std/cli/parse-args";
import { prepareFile } from "./prepareFile.ts"

const flags = parseArgs(Deno.args, {
  boolean: ["debug"],
  string: ["port", "static-path"],
  default: { port: 8000 },
});

const MIME_TYPES: { [extention: string]: string } = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  json: "application/json",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};


if (import.meta.main) {
  console.log(`Alive on pid ${Deno.pid} (${Deno.ppid})`)
  Deno.serve({ port: flags.port }, async (req) => {
    const url = new URL(req.url);
    const file = await prepareFile(url.pathname, new URLSearchParams(url.search))
    const statusCode = file.found ? 200 : 404;
    const mimeType: string = MIME_TYPES[file.ext] || MIME_TYPES.default;

    console.info(`${req.method} ${req.url} ${statusCode}\t${Object.keys(req.headers)}`);

    return new Response(file.stream, {
      status: statusCode,
      headers: {
        "content-type": mimeType,
      },
    });
  });
}
