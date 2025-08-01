const MarkdownIt = require("markdown-it")
// 创建 Markdown 解析器实例
const md = new MarkdownIt({
  html: false,       // 禁止 HTML 标签
  linkify: false,    // 不将 URL 转换为链接
  typographer: false // 禁用高级排版转换
});

export function mdToText(markdown: string): string {
  // 移除代码块和数学公式等无关内容
  const cleaned = markdown.replace(/```[\s\S]*?```|`[^`]+`|\$\$[\s\S]*?\$\$|\$[^\n]*?\$/g, '');

  // 解析为 HTML 字符串
  const html = md.render(cleaned);

  // 将 HTML 转换为纯文本
  return html
    .replace(/<[^>]+>/g, '')       // 移除所有 HTML 标签
    .replace(/\s*\n\s*/g, '\n')    // 标准化换行符
    .replace(/^\s+|\s+$/g, '');   // 去除首尾空白
}

// `# Hello World
// This is a **Markdown** example with a [link](https://example.com).

// > Blockquote text
// - List item 1
// - List item 2

// \`\`\`js
// console.log('Code block');
// \`\`\`
// `;

/* 输出:
Hello World
This is a Markdown example with a link.
Blockquote text
List item 1
List item 2
*/