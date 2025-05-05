#!/usr/bin/env node

import { Command } from "commander";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import fs from "fs/promises";
import path from "path";
import sanitize from "sanitize-filename";

interface CliOptions {
  url: string;
  outputDir: string;
}

/**
 * サニタイズされたファイル名を生成します。
 * @param title - 元のタイトル。
 * @param fallback - タイトルが空の場合の代替ファイル名。
 * @returns サニタイズされたファイル名 (拡張子なし)。
 */
function generateFilename(
  title: string | null | undefined,
  fallback: string = "output"
): string {
  const baseName = title ? title.trim() : fallback;
  // sanitize-filename を使ってOSで無効な文字を除去・置換
  const sanitized = sanitize(baseName);
  // スペースをアンダースコアに置換 (任意)
  return sanitized.replace(/\s+/g, "_");
}

/**
 * 指定されたURLのコンテンツを取得し、Markdownに変換して保存します。
 * @param url - 取得するウェブサイトのURL。
 * @param outputDir - Markdownファイルの保存先ディレクトリ。
 */
async function processUrl(url: string, outputDir: string): Promise<void> {
  try {
    console.log(`Fetching content from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        // 一部のサイトではUser-Agentが必要
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = response.data;

    console.log("Parsing HTML content...");
    const dom = new JSDOM(html, { url }); // urlオプションを提供すると相対URLの解決に役立つ
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to extract article content using Readability.");
    }

    console.log(`Article title: ${article.title}`);
    console.log("Converting content to Markdown...");
    const turndownService = new TurndownService();
    // Provide a fallback empty string if article.content is nullish
    const markdown = turndownService.turndown(article.content || "");

    // ファイル名を生成 (タイトルから。無効文字を除去)
    const filename = generateFilename(article.title);
    const outputPath = path.join(outputDir, `${filename}.md`);

    console.log(`Ensuring output directory exists: ${outputDir}`);
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`Saving Markdown to: ${outputPath}`);
    await fs.writeFile(outputPath, `# ${article.title}\n\n${markdown}`); // タイトルをMarkdownの先頭に追加

    console.log("Successfully converted and saved.");
  } catch (error) {
    console.error("An error occurred:");
    if (axios.isAxiosError(error)) {
      console.error(`HTTP Error: ${error.response?.status} - ${error.message}`);
      if (error.response?.data) {
        // HTMLエラーページなどを表示しないように制限
        console.error(
          "Response data preview (limited):",
          String(error.response.data).substring(0, 200)
        );
      }
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      console.error(error.stack); // スタックトレースも表示
    } else {
      console.error("An unknown error occurred:", error);
    }
    process.exit(1); // エラー発生時は終了コード1で終了
  }
}

const program = new Command();

program
  .name("web2md")
  .description(
    "Fetch web content, extract article, convert to Markdown, and save."
  )
  .version("0.1.0"); // バージョン情報を追加

program
  .requiredOption("-u, --url <url>", "URL of the website to fetch")
  .requiredOption(
    "-o, --output-dir <directory>",
    "Directory to save the Markdown file"
  )
  .action(async (options: CliOptions) => {
    await processUrl(options.url, options.outputDir);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error("Failed to parse command line arguments:", err);
  process.exit(1);
});
