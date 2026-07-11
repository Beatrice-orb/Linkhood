export function cn(...classes: (string | undefined | null | boolean | { [key: string]: any })[]) {
  const result: string[] = [];
  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key]) {
          result.push(key);
        }
      }
    }
  }
  return result.join(' ');
}
