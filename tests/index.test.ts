import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execAsync = promisify(exec);

describe('fanyi CLI', () => {
  it('should print translation of the word', async () => {
    const { stdout } = await execAsync('./bin/fanyi.js hello');
    expect(stdout).toMatchSnapshot();
  });

  it('should print usage if no arguments are given', async () => {
    const { stdout } = await execAsync('./bin/fanyi.js');
    expect(stdout).toMatchSnapshot();
  });
});
