import { defineConfig, ViteUserConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
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
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.test.{ts,tsx}",
          "src/**/*.spec.{ts,tsx}",
          "src/types",
          "src/constants",
          "src/index.ts"
        ]
      }
    }
  };

  return config;
});
