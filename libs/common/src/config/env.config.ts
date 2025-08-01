import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { resolve } from 'path';

export const config = () => {
  const file = readFileSync(resolve(process.cwd(), ".yaml"));

  return load(file.toString() || "");
}