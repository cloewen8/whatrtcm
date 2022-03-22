import { RtcmDecodeTransformStream, RtcmMessage } from '@gnss/rtcm'

export default function whatRTCM(stream) {
	const whatTypes = {}
	stream
		.pipe(new RtcmDecodeTransformStream())
		.on('data', function(data) {
			if (data instanceof RtcmMessage) {
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
