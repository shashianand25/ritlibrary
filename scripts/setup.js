import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const envCopies = [
  {
    src: path.join(rootDir, "my-project", ".env.example"),
    dest: path.join(rootDir, "my-project", ".env"),
  },
  {
    src: path.join(rootDir, "library-backend", ".env.example"),
    dest: path.join(rootDir, "library-backend", ".env"),
  },
  {
    src: path.join(rootDir, ".env.example"),
    dest: path.join(rootDir, ".env"),
  },
];

for (const { src, dest } of envCopies) {
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(
      `[setup] Initialized ${path.relative(rootDir, dest)} from template`,
    );
  } else if (fs.existsSync(dest)) {
    console.log(`[setup] Preserved existing ${path.relative(rootDir, dest)}`);
  }
}
