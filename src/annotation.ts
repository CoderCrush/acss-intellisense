import { window, workspace, DecorationRangeBehavior, Range, MarkdownString } from 'vscode';
import type {DecorationOptions} from 'vscode';
import { isSubdir, throttle, getMatchedPositionsFromCode } from './utils';
import * as prettier from 'prettier/standalone';
import * as parserCSS from 'prettier/parser-postcss';

export async function registerAnnotations(presets: [RegExp, (exec: string) => Record<string, unknown>][] = [], cwd: string) {

  const underlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  });

  async function updateAnnotation(editor = window.activeTextEditor) { 
    const doc = editor?.document;
    if(!doc?.fileName.endsWith('vue')) {return;};
    
    if (!doc)
      {return reset();};

    const id = doc.uri.fsPath; // 当前打开的文档的绝对文件路径
    if (!isSubdir(cwd, id))
      {return reset();};

    const code = doc.getText();
    if (!code)
      {return reset();};

    const getCssString = (cls: string, style: Record<string, unknown>) => {
      return prettier.format(`${cls}: ${JSON.stringify(style).replace(/['"]/g, '')}`, {
        parser: 'css',
        plugins: [parserCSS],
      });
    }; 
    
    const ranges: DecorationOptions[] = getMatchedPositionsFromCode(code, presets).map(itm => {
      const {cls, style, range} = itm;
      return range.map(([start, end]: any) => {
        return {
          range: new Range(doc.positionAt(start), doc.positionAt(end)),
          get hoverMessage() {
            return new MarkdownString(`\`\`\`css\n${getCssString(cls,style)}\n\`\`\`
            `);
          }
        };
      });
    }).flat();
    
    editor?.setDecorations(underlineDecoration, ranges);

    function reset() {
      editor?.setDecorations(underlineDecoration, []);
    }
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200);

  window.onDidChangeActiveTextEditor(updateAnnotation);
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      {throttledUpdateAnnotation();};
  });

  await updateAnnotation();
}