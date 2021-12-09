const filter = require('../processors/filter');
const pData = require('../processors/data');
const pAttributeData = require('../processors/attributeData');
const pImport = require('../processors/import');
const pStatus = require('../processors/status');
const stringUuid = require('uuid-by-string');

const responseCache = {};

module.exports = {
	importData: (request, response, next) => {
		pImport
			.data(request.file, request.user, request.body)
			.then((responsePayload) => {
				response.status(200).send(responsePayload);
			})
			.catch((error) => {
				response.status(500).send({ success: false, message: error.message });
			})
	},
	importMetadata: (request, response, next) => {
		pImport
			.metadata(request.body, request.user)
			.then((responsePayload) => {
				response.status(200).send(responsePayload);
			})
			.catch((error) => {
				response.status(500).send({ success: false, message: error.message });
			})
	},
	data: (request, response, next) => {
		pData(filter(request.body), request.user)
			.then((responsePayload) => {
				response.status(200).send(responsePayload);
			})
			.catch((error) => {
				response.status(500).send({ success: false, message: error.message });
			})
	},
	attributeData: (request, response, next) => {
		let requestHash = stringUuid(JSON.stringify({ url: request.originalUrl, data: request.body }));
		if (responseCache.hasOwnProperty(requestHash)) {
			response.status(200).send(responseCache[requestHash]);
		} else {
			pAttributeData(filter(request.body), request.user)
				.then((responsePayload) => {
					responseCache[requestHash] = responsePayload;
					response.status(200).send(responsePayload);
				})
				.catch((error) => {
					response.status(500).send({ success: false, message: error.message });
				})
		}
	},
	status: {
		import: (request, response, next) => {
			pStatus("import", request.params.key)
				.then((status) => {
					response.send(status);
				})
		}
	}
}