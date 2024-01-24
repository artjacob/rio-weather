export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLOUDFLARE_R2_ACCOUNT_ID: string
			CLOUDFLARE_R2_TOKEN: string
			CLOUDFLARE_R2_ACCESS_KEY: string
			CLOUDFLARE_R2_SECRET_KEY: string
		}
	}
}
