import { ActionPanel, Clipboard, showToast, ToastStyle, useNavigation } from "@raycast/api";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// 获取当前 Finder 目录路径
async function getFinderDirectory(): Promise<string | null> {
  try {
    const result = execSync('osascript -e "tell application \\"Finder\\"" -e "get POSIX path of (target of window 1 as text)" -e "end tell"').toString().trim();
    return result;
  } catch (error) {
    showToast(ToastStyle.Failure, '无法获取当前 Finder 目录');
    return null;
  }
}

// 判断文件是否为纯文本
function isTextFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}

// 获取目录下所有纯文本文件
async function getTextFilesFromDirectory(directory: string): Promise<string[]> {
  try {
    const files = fs.readdirSync(directory);
    return files.filter((file) => {
      const filePath = path.join(directory, file);
      return isTextFile(filePath);
    });
  } catch (error) {
    showToast(ToastStyle.Failure, '无法读取目录内容');
    return [];
  }
}

// 读取纯文本文件内容
async function readFileContents(directory: string, files: string[]): Promise<string> {
  let content = '';
  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    content += `# ${file}\n${fileContent}\n`;
  }
  return content;
}

// 命令的主逻辑
export default async function Command() {
  const directory = await getFinderDirectory();
  if (!directory) return;

  const textFiles = await getTextFilesFromDirectory(directory);
  if (textFiles.length === 0) {
    showToast(ToastStyle.Failure, '该目录下没有纯文本文件');
    return;
  }

  const mergedContent = await readFileContents(directory, textFiles);
  await Clipboard.copy(mergedContent);

  showToast(ToastStyle.Success, '文本文件内容已复制到剪贴板');
}

