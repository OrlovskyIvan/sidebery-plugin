import config from './esbuild-config.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ESBuild = require('esbuild');

ESBuild.build(config).catch(console.log);