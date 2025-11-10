import dotenv from 'dotenv';
import path from 'path';

const envFiles = ['.env.local', '.env'];

envFiles.forEach((file) => {
  const result = dotenv.config({ path: path.resolve(process.cwd(), file) });
  if (result.error && (result.error as NodeJS.ErrnoException).code !== 'ENOENT') {
    console.warn(`⚠️  Failed to load ${file}:`, result.error.message);
  }
});

const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
}
