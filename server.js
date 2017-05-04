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

app.get('/api', function(req, res) {
	res.end('<div>Hipmunk Search API coding challenge</div>');
});
// API routes
app.get('/hotels/search', function(req, res) {
	getHotels(function(err, data) {
		if (err)
			res.status(500).json({ error: err.reason });
		else
			res.json(data);
	});
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});


function getHotels(cb) {
	let promises = [];

	for (let provider of PROVIDERS) {
		promises.push(new Promise(scrapeData(provider)));
	}

	function scrapeData(provider) {
		return function(resolve, reject) {
			request.get('http://localhost:9000/scrapers/'+provider).end(function(err, result) {
	    		if (err) {
					// console.log('failed to retrieve '+provider+' hotel list', err);
					cb({ reason: 'failed to retrieve '+provider+' hotel list', error: err }, null);
	        	}
	        	else {
	        		resolve({ data: result.body.results, index: 0 });
	        	}
	    	});
		}		
	}

	function mergeData(providerData) {
		let hotelData = { results: [] }, length = 0;
		let pdata, highestEcstasyData, highestEcstasyProvider;

		for (let provider in providerData) 
			length += providerData[provider]['data'].length;

		for (let i=0; i < length; i++) {			
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

		cb(null, hotelData);
	}

	Promise.all(promises).then(mergeData);
}
