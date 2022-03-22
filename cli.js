// 1. Import rtcm and yargs
// 2. Show cli options
// 3. Open a readable stream with input
// 4. Pass through rtcm decoder
// 5. Collect results
// 6. Output results

import * as RTCM from '@gnss/rtcm'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Readable } from 'stream'
import { createReadStream as createFSStream } from 'fs'

const cli = yargs(hideBin(process.argv))
	.usage('Validates and describes rtcm data. Either a file or data must be provided.\n\nUsage: $0 [-f file] [data]')
	.command('$0')
	.option('file', {
		alias: 'f',
		describe: 'A file containing rtcm messages',
		type: 'string'
	})
	.positional('data', {
		describe: 'Raw rtcm messages',
		type: 'string'
	})
const opts = cli.parse()

function whatRTCM(stream) {
	const whatTypes = {}
	stream
		.pipe(new RTCM.RtcmDecodeTransformStream())
		.on('data', function(data) {
			if (data instanceof RTCM.RtcmMessage) {
				const typeName = `MT${data.messageType}`
				if (!whatTypes.hasOwnProperty(typeName))
					whatTypes[typeName] = 0
				whatTypes[typeName]++
			}
		})
		.on('error', function(err) {
			console.error(`Unable to read rtcm data, ${err.message}: ${err.stack}`)
		})
		.on('finish', function() {
			console.log('Finished reading RTCM messages.')
			console.log()
			if (whatTypes.length > 0) {
				const total = Object.values(whatTypes).reduce((v, n) => n += v).toString()
				for (const [whatName, whatCount] of Object.entries(whatTypes))
					console.log(`${whatName}: ${whatCount.toString().padStart(total.length)}`)
				console.log('Total:  ' + total)
			} else {
				console.log('No RTCM messages found.')
			}
		})
}

if (opts.file !== undefined) {
	whatRTCM(createFSStream(opts.file))
} else if (opts._ !== undefined) {
	const stream = new Readable()
	stream._read = () => {}
	stream.push(opts._.reduce((v, to) => to += v))
	stream.push(null)
	whatRTCM(stream)
} else {
	cli.showHelp()
}
