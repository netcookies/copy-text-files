import { getSelectedFinderItems, Clipboard, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { promises as fs } from 'fs';

interface Preferences {
  includeFilePath: boolean
}

async function getSelectedTextFiles(): Promise<string[]> {
  try {
    const files = await getSelectedFinderItems();
    showToast(Toast.Style.Failure, JSON.stringify(files, null, 4))
    return files.map(file => file.path)
  } catch (error) {
    showToast(Toast.Style.Failure, "📁 Unable to get selected files");
    return [];
  }
}

// 读取纯文本文件内容
async function readFileContents(files: string[], includeFilePath: boolean): Promise<string> {
  let content = "";
  try {
    for (const file of files) {
      const fileContent = await fs.readFile(file, "utf-8");
      if (includeFilePath) {
        content += `# File path: ${file}\n`;
      }
      content += fileContent;
    }
    return content;
  } catch (error) {
    showToast(Toast.Style.Failure, "📁 Unable to read selected file contents");
  }
  return content;
}

// 命令的主逻辑
export default async function Command() {
  const { includeFilePath } = getPreferenceValues<Preferences>();
  const textFiles = await getSelectedTextFiles();
  if (textFiles.length === 0) {
    showToast(Toast.Style.Failure, "📄 No text files selected");
    return;
  }

  const mergedContent = await readFileContents(textFiles, includeFilePath);
  await Clipboard.copy(mergedContent);

  showToast(Toast.Style.Success, "✨ Text files content copied to clipboard", mergedContent);
}
