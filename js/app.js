// declaring variables
var infoWindow;
var map;
var bounds;

/* data of location */
var locations = [
	{title: 'Sharam', location: {lat: 27.9158, lng: 34.3300}},
	{title: '6th of October', location: {lat: 29.9285, lng: 30.9188}},
	{title: 'Ismailia', location: {lat: 30.593721, lng: 32.29535}},
    {title: 'Al Mohandesin', location: {lat: 30.0746, lng: 31.3456}},
    {title: 'Alex', location: {lat: 31.14067, lng: 30.040406}},
	{title: 'Helwan', location: {lat: 29.8403, lng: 31.2982}},
    {title: 'Al Haram', location: {lat: 29.9932, lng: 31.1309}},
    {title: 'Suez', location: {lat: 30.024646, lng: 32.52057}},
];
// google maps init
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.513303 , lng: 31.213196},
        zoom: 13
    });

    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();  
    ko.applyBindings(new ViewModel());
}

/* Location Model used foursquare api  */ 
var LocationMarker = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.visible = ko.observable(true);
    var clientID = '854822005662-9jcfrjllkf763lfrba6igi02rjorfj97';
    var clientSecret = 'nwLG1WYQlqikTxka-yHNfGf_';

    var reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.title;

    $.getJSON(reqURL).done(function(data) {
		var results = data.response.venues[0];
		self.city = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'not found';
        self.phone = results.contact.formattedPhone ? results.contact.formattedPhone : 'not found';
    }).fail(function() {
        alert('wrong in foursquare');
    });

    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
    });    

    self.filterMarkers = ko.computed(function () {
        if(self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });
    
    this.marker.addListener('click', function() {
        populateInfoWindow(this, infoWindow,self.city, self.phone);
    });

    this.makeitbounce = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };
    this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

};

/* ViewModel function */
var ViewModel = function() {
    var self = this;

    this.searchkey = ko.observable('');
    this.mapList = ko.observableArray([]);

    locations.forEach(function(location) {
        self.mapList.push( new LocationMarker(location) );
    });

    this.list = ko.computed(function() {
        var searchFilter = self.searchkey().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var string = location.title.toLowerCase();
                var result = string.includes(searchFilter);
                location.visible(result);
				return result;
			});
        }
        self.mapList().forEach(function(location) {
            location.visible(true);
        });
        return self.mapList();
    }, self);
};

// populates the infowindow 
function populateInfoWindow(marker,infowindow,city, phone) {
	map.setCenter(marker.position);
    marker.setAnimation(google.maps.Animation.BOUNCE);

    setTimeout(function () {
        marker.setAnimation(null);
    }, 1400);

    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var windowContent ='<h1>'+marker.title+'</h1>'+marker.position+'</br>'+ city + '<br>' + phone ;
        infowindow.setContent(windowContent);
        infowindow.open(map, marker);
    }
}

function googleMapsError() {
    alert('error in Google Maps!');
}

