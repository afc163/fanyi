import { fork } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const scriptPath = path.resolve(__dirname, '../bin/fanyi.js');

const runScript = (args: string[] = []): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const child = fork(scriptPath, args, { silent: true });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({ code, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

describe('fanyi CLI', () => {
  it('should print translation of the word', async () => {
    const { stdout } = await runScript(['hello']);
    expect(stdout).toMatchSnapshot();
  });

  it('should print usage if no arguments are given', async () => {
    const { stdout } = await runScript();
    expect(stdout).toMatchSnapshot();
  });

  it('should print help if -h is given', async () => {
    const { stdout } = await runScript(['-h']);
    expect(stdout).toMatchSnapshot();
  });

  it('should be able to config global options', async () => {
    const { stdout } = await runScript(['config --no-color']);
    expect(stdout).toMatchSnapshot();
    const { stdout: stdout2 } = await runScript(['config --color']);
    expect(stdout2).toMatchSnapshot();
    const { stdout: stdout3 } = await runScript(['config --no-iciba']);
    expect(stdout3).toMatchSnapshot();
    const { stdout: stdout4 } = await runScript(['config --iciba']);
    expect(stdout4).toMatchSnapshot();
  });

  it('should print search history', async () => {
    const { stdout } = await runScript(['list']);
    expect(stdout).toMatchSnapshot();
  });
});
