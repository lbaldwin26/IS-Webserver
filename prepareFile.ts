import * as path from "jsr:@std/path";

const STATIC_PATH = path.join(Deno.cwd(), "./static");

const checkExists = async (filePath: string): Promise<boolean> => {
    try {
        await Deno.lstat(filePath);
        return true
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound))
          throw err;

        return false
    }
}

// Make class
export const prepareFile = async (url_path: string, _search_params: URLSearchParams) => {
  const paths = [STATIC_PATH, url_path];

  // #1
  if (url_path.endsWith("/")) {
    paths.push("index.html");
  }

  const filePath = path.join(...paths);

  // #2
  const pathTraversal = !filePath.startsWith(STATIC_PATH);

  const exists = await checkExists(filePath)

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
