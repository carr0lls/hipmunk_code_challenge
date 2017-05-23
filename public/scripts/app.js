$(document).ready(function(e) {
	let hotelData;

	fetch('http://localhost:8000/hotels/search')
		.then((data) => {
			return data.json();
		})
		.then(parseData)
		.then(renderHotelList)
		.then(bindClickActions)
		.catch((err) => {
			console.log(err);
		});


	function parseData(data) {
		hotelData = data.results;
		return hotelData;
	}

	function renderHotelList(hotels) {
		let hotelsList = `<ul class="hotels-list">`;

		hotelsList += `<li class="clickable">
				<div class="name">Name</div>
				<div class="desc">Description</div>
				<div class="picture">Picture</div>
				<div class="rating">Stars</div>
			</li>`;

		hotels.map((hotel) => {

			hotelsList += `<li>
				<div class="name">${hotel.name}</div>
				<div class="desc">${hotel.description}</div>
				<div class="picture">
					<img src="${hotel.thumbnail_url}">
				</div>
				<div class="rating">${hotel.stars} stars</div>
			</li>`;
		});

		hotelsList += `</ul>`;

		$('.hotels-list').html(hotelsList);
	}

	function bindClickActions() {
		$('.hotels-list').on('click', function(e) {
			$(e.target).closest('li').css('background', '#929AA8');
		});
	}

	function applyFilters() {
		let rating = $('.ratings-filter').val();
		let name = $('.name-filter').val();
		let hotels = hotelData;

		if (rating >= 2) {
			hotels = hotels.filter(function(hotel) {
				return hotel.stars >= rating;
			});
		}

		hotels = hotels.filter(function(hotel) {
			return (hotel.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ? true : false;
		});

		renderHotelList(hotels);
	}

	$('.ratings-filter').on('change', function(e) {
		applyFilters();
	});

	$('.name-filter').keyup(function(e) {
		applyFilters();
	});	

});