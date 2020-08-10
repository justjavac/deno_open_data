#!/usr/bin/env deno run --allow-net --allow-read --allow-write --allow-run --unstable

export interface Options {
  url: string;
  name: string;
  fileName?: string;
  format?: boolean;
}

export async function json2ts(options: Options): Promise<void> {
  const url = options.url;
  const name = options.name;
  const fileName = options.fileName ?? `${name}.ts`;
  const format = options.format ?? true;

  const response: Response = await fetch(url);
  const content: string = await response.text();

  const encoder = new TextEncoder();
  const data = encoder.encode(`
        const ${name} = ${content.trim()} as const;
        export default ${name};
      `);

  await Deno.writeFile(fileName, data);

  if (format) {
    const ps = Deno.run({
      cmd: ["deno", "fmt", fileName],
      stdout: "piped",
    });

    await ps.output();
  }
}
