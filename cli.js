// 1. Import rtcm and yargs
// 2. Show cli options
// 3. Open a readable stream with input
// 4. Pass through rtcm decoder
// 5. Collect results
// 6. Output results

import whatRTCM from '.'
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
