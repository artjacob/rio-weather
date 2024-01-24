import { type NextRequest, NextResponse } from 'next/server'
import { parse } from 'date-fns/parse'
import { format } from 'date-fns/format'
import { outputFile } from 'fs-extra'
import sharp from 'sharp'
import uploadFile from '@/utils/uploadFile'

// /////////////////////////////////////////////////////////////////////////////////////////////////

export async function GET(request: NextRequest) {
	const startDate = new Date()
	const timing: Record<string, number> = {}

	// Acessa o índice da pasta para descobrir o número da imagem mais recente
	const indexStartDate = new Date()
	const folderIndexUrl = `http://alertario.rio.rj.gov.br/upload/Mapa/semfundo/?C=M;O=D`
	const folderIndexRequest = await fetch(folderIndexUrl)
	const folderIndexHtml = await folderIndexRequest.text()

	const indexMatch = folderIndexHtml.match(/href="radar(\d+)/)
	if (!indexMatch) return NextResponse.error()

	const index = indexMatch[1]
	const indexEndDate = new Date()

	// Acessa o arquivo .txt para pegar a data da imagem mais recente
	const dateStartDate = new Date()
	const indexDateFileUrl = `http://alertario.rio.rj.gov.br/upload/Mapa/semfundo/radar${index}.txt`
	const indexDateFileRequest = await fetch(indexDateFileUrl)
	const indexOriginalDate = (await indexDateFileRequest.text()).trim()

	const indexOriginalDateFormat = `EEE MMM dd HH:mm:ss 'BRST' yyyy xxx`
	const indexDate = parse(`${indexOriginalDate} -03:00`, indexOriginalDateFormat, new Date())
	const indexFormattedDate = format(indexDate, 'yyyy-MM-dd--HH-mm')
	const dateEndDate = new Date()

	// Baixa a imagem
	const downloadStartDate = new Date()
	const imageUrl = `http://alertario.rio.rj.gov.br/upload/app/final_radar${index}.png`
	const imageRequest = await fetch(imageUrl)
	const imageResponse = await imageRequest.arrayBuffer()

	const image = Buffer.from(imageResponse)
	const downloadEndDate = new Date()

	// Comprime a imagem
	const compressionStartDate = new Date()
	const imageFileName = `${indexFormattedDate}.png`
	const compressedImage = await sharp(image)
		.resize({ height: 1080 })
		.png({ palette: true, compressionLevel: 9, colours: 64 })
		.toBuffer()

	await outputFile(`./storage/radar/${imageFileName}`, compressedImage)
	// await outputFile(`./storage/radar/original-${imageFileName}`, image)
	const compressionEndDate = new Date()

	// Faz upload da imagem no R2
	const uploadStartDate = new Date()
	await uploadFile(`radar/${imageFileName}`, compressedImage)
	const uploadEndDate = new Date()

	// Retorno
	const endDate = new Date()
	timing.index = indexEndDate.getTime() - indexStartDate.getTime()
	timing.date = dateEndDate.getTime() - dateStartDate.getTime()
	timing.download = downloadEndDate.getTime() - downloadStartDate.getTime()
	timing.compression = compressionEndDate.getTime() - compressionStartDate.getTime()
	timing.upload = uploadEndDate.getTime() - uploadStartDate.getTime()
	timing.total = endDate.getTime() - startDate.getTime()

	return NextResponse.json(
		{ data: { date: indexDate, file: imageFileName }, timing },
		{ status: 200 },
	)
}
