import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// /////////////////////////////////////////////////////////////////////////////////////////////////

export default async function uploadFile(path: string, data: Buffer): Promise<void> {
	const cloudflareAccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
	const cloudflareAccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY
	const cloudflareSecretKey = process.env.CLOUDFLARE_R2_SECRET_KEY

	const S3 = new S3Client({
		region: 'auto',
		endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: cloudflareAccessKey,
			secretAccessKey: cloudflareSecretKey,
		},
	})

	const command = new PutObjectCommand({
		Bucket: 'rio',
		Key: path,
		Body: data,
	})

	await S3.send(command)
}
