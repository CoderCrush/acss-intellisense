import * as path from 'path';
import log from './log';

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function throttle<T extends ((...args: any) => any)>(func: T, timeFrame: number): T {
  let lastTime = 0;
  let timer: any;
  return function (...args) {
    const now = Date.now();
    clearTimeout(timer);
    if (now - lastTime >= timeFrame) {
      lastTime = now;
      return func(...args);
    }
    else {
      timer = setTimeout(func, timeFrame, ...args);
    }
  } as T;
}

export function getMatchedPositionsFromCode(code: string, presets: any) {
  const classList: any[] = [];
  const styleList: any[] = [];
  const classReg = /class=[\"|\'](.+?)[\"|\']/g;

  while (true) {
    const exec = classReg.exec(code);
    if (exec) {
      const res = exec[1];
      res
        .trim()
        .split(/\s+/)
        .forEach((it) => {
          classList.push(it);
        });
    } else {
      break;
    }
  }

  classList.forEach((className) => {
    presets.flat().forEach(([reg, getStyle]: any) => {
      const clsRaw = className;
      let res;
      let pseudo = className.startsWith("hover:");
      if ((res = reg.exec(className.replace("hover:", "")))) {
        const [_, v] = res;
        if(styleList.some((style) => style.clsRaw === clsRaw)) {return;}
        styleList.push({
          clsRaw,
          cls: pseudo ? `.${className}:hover` : `.${className}`,
          style: getStyle(v),
        });
      }
    });
  });

  styleList.forEach((record) => {
    const {clsRaw} = record;
    record.range = getMatchedPositions(code,clsRaw);
  });

  log.appendLine(JSON.stringify(styleList, null, 2));
  
  return styleList;
}

function getMatchedPositions(code: string, str: string) {
  const result = [];
  for (const match of code.matchAll(new RegExp(str, 'g'))) {
    const start = match.index!;
    const end = start + match[0].length;
    result.push([start, end, match[0]]);
  }
  return result;
}