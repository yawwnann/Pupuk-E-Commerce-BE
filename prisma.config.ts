import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// --- Validasi Environment Variable ---
if (!process.env.DATABASE_URL) {
  throw new Error(
    " DATABASE_URL tidak ditemukan. Pastikan variabel ini ada di .env",
  );
}

// --- Konfigurasi Prisma ---
export default defineConfig({
  schema: "./prisma/schema.prisma",
});
