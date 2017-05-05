let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let request = require('superagent');

const PROVIDERS = ['Expedia', 'Orbitz', 'Priceline', 'Travelocity', 'Hilton'];

app.set('port', 8000);
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// API routes
app.get('/api', function(req, res) {
	res.end('<div>Hipmunk Search API coding challenge</div>');
});
app.get('/hotels/search', function(req, res) {
	getHotels(PROVIDERS)
		.then(mergeData)
		.then(function(data) {
			res.json(data);
		})
    	.catch(function(err) {
    		res.status(500).json({ error: err.reason });
    	});
});

app.listen(app.get('port'), function() {
  console.log('Hipmunk - Hotel Search API: http://localhost:' + app.get('port') + '/');
});

function scrapeData(provider) {
	return function(resolve, reject) {
		request.get('http://localhost:9000/scrapers/'+provider).end(function(err, result) {
    		if (err) {
				// console.log('failed to retrieve '+provider+' hotel list', err);
				let errorObject = { 
					    reason: 'failed to retrieve '+provider+' hotel list',
					error: err
				}
				return reject(errorObject);
        	}
        	else {
        		resolve({ data: result.body.results, index: 0 });
        	}
    	});
	}		
}

function buildHotelPromises(providers) {
	let promises = [];

	for (let provider of providers) {
		promises.push(new Promise(scrapeData(provider)));
	}

	return promises;
}

function getHotels(providers) {
	return Promise.all(buildHotelPromises(providers));
}

function mergeData(providerData) {
	let hotelData = { results: [] }, mergedLength = 0;
	let pdata, highestEcstasyData, highestEcstasyProvider;

	for (let provider of providerData) 
		mergedLength += provider['data'].length;

	for (let i=0; i < mergedLength; i++) {			
		highestEcstasyData = null;
		highestEcstasyProvider = null;
		
		for (let provider in providerData) {
			pdata = providerData[provider]['data'][providerData[provider]['index']];

			if (providerData[provider]['index'] === providerData[provider]['data'].length)
				continue;
			
			if (highestEcstasyData === null) {
				highestEcstasyData = pdata;
				highestEcstasyProvider = provider;
			}
			else if (pdata.ecstasy > highestEcstasyData.ecstasy) {
				highestEcstasyData = pdata;
				highestEcstasyProvider = provider;
			}
		}

		hotelData.results.push(highestEcstasyData);
		providerData[highestEcstasyProvider]['index']++;
	}

	return hotelData;
}