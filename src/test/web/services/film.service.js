(function (angular) {

	'use strict';

	function filmService(http) {
		return {
			list: function (filmName, filmCompany) {
				return http
					.get('/data/films.json')
					.then(function (response) {
						if (!filmName) {
							return response.data;
						} else {
							var result = []
							for (var i = 0; response.data.length > i; i++) {
								var currentFilm = response.data[i];
								if (currentFilm.name.toUpperCase().indexOf(filmName.toUpperCase()) > -1) {
									result.push(currentFilm);
								}
							}
							return result;
						}
					});
			},

			get: function (filmRanking) {
				return http
					.get('/data/films.json')
					.then(function (response) {
						var result = null;
						for (var i = 0; response.data.length > i; i++) {
							if (response.data[i].ranking == filmRanking) {
								result = response.data[i];
								break;
							}
						}
						return result;
					});
			}
		};
	}

	angular.module('gux.test.services')
		.factory('filmService', ['$http', filmService]);

} (window.angular));