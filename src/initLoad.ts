import {loadConfig} from 'unconfig';
import { registerAnnotations } from './annotation';

export default function(cwd: string = process.cwd()) {
  loadConfig({
    sources: [
      {
        files: 'vite.config',
        rewrite: async (config) => {
          const cfg = await (typeof config === 'function' ? config() : config);
          const plugin = cfg?.plugins?.find(({name}: Record<string, unknown>) => name === 'acss');
          const presets = plugin.getPresets();
          registerAnnotations(presets, cwd);
          return cfg;
        }
      }
    ],
    cwd: cwd + '/playground'
  });
}