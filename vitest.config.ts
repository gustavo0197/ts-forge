import { defineConfig, ViteUserConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  console.log("Vite config mode:", resolve(__dirname, "src"));

  const config: ViteUserConfig = {
    mode,
    resolve: {
      alias: {
        "@/index": resolve(__dirname, "src/index"),
        "@/constants": resolve(__dirname, "src/constants"),
        "@/decorators": resolve(__dirname, "src/decorators"),
        "@/types": resolve(__dirname, "src/types")
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        reporter: ["text", "json", "html"],
        all: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"]
      }
    }
  };

  return config;
});
