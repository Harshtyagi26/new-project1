/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// This sandbox blocks egress to remotion.media, so Remotion cannot download its
// own Chrome Headless Shell. Reuse the pre-installed one when it is present.
// No-op on machines that don't have it (e.g. local dev), where Remotion
// downloads Chrome as usual.
const PREINSTALLED_CHROME =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

if (existsSync(PREINSTALLED_CHROME)) {
  Config.setBrowserExecutable(PREINSTALLED_CHROME);
}
