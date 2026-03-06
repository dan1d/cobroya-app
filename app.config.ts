import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || "CobroYa",
  slug: config.slug || "cobroya",
  extra: {
    ...config.extra,
    mpAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  },
});
