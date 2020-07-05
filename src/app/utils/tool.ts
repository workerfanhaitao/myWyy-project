import { Song } from './../services/data-types/common.types';
export function getElementOffset(el: Element): {top: number; left: number} {
  if (!el.getClientRects().length) {
    return {
      top: 0,
      left: 0
    };
  }

  const rect = el.getBoundingClientRect();
  const win = el.ownerDocument.defaultView;

  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const result = arr.slice();
  for (let i = 0; i < result.length; i++) {
    // 0和i之间的一个随机数
    const j = getRandomInt([0, i]);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function findIndex(list: Song[], current: Song) {
  return list.findIndex((item) => item.id === current.id);
}

export function limitNumberInRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function valueEqual(valueA: number | null, valueB: number | null) {
  return valueA === valueB;
}

export function inArray(arr: any[], target: any): boolean {
  return arr.indexOf(target) !== -1;
}
// 取两个数之间的一个随机数
export function getRandomInt(range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0]);
}

// 判断是否为空对象
export function isEmptyObject(obj: object): boolean {
  return JSON.stringify(obj) === '{}';
}
