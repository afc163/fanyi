import { fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bin/fanyi.mjs');

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
    await runScript(['config', 'set', 'color', 'false']);
    const { stdout } = await runScript(['hello']);
    expect(stdout).toContain(`hello  英[ hə'ləʊ ]  美[ həˈloʊ ]  ~  iciba.com`);
    await runScript(['config', 'set', 'color', 'true']);
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
    const { stdout } = await runScript(['config', 'set', 'color', 'false']);
    expect(stdout).toContain('{"color":false}');
    const { stdout: stdout2 } = await runScript(['config', 'set', 'color', 'true']);
    expect(stdout2).toContain('{"color":true}');
    const { stdout: stdout3 } = await runScript(['config', 'set', 'iciba', 'false']);
    expect(stdout3).toContain('{"iciba":false}');
    const { stdout: stdout4 } = await runScript(['config', 'set', 'iciba', 'true']);
    expect(stdout4).toContain('{"iciba":true}');
  });

  it('should print without color', async () => {
    await runScript(['config', 'set', 'color', 'false']);
    const { stdout } = await runScript(['hello']);
    expect(stdout).not.toContain('\u001b[35m');
    await runScript(['config', 'set', 'color', 'true']);
    const { stdout: stdout2 } = await runScript(['hello']);
    expect(stdout2).toContain('\u001b[35m');
  });

  it('should print config', async () => {
    const { stdout } = await runScript(['config', 'list']);
    expect(stdout).toContain('.config/fanyi/.fanyirc');
  });

  it('should print search history', async () => {
    const { stdout } = await runScript(['list']);
    expect(stdout).toContain('fanyi history:');
  });

  it('should not print error when translate "ant love"', async () => {
    const { stderr } = await runScript(['ant love']);
    expect(stderr).not.toContain('访问 iciba 失败');
  });
});
