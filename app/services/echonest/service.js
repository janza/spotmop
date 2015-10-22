/**
 * Create an Echonest service
 *
 * This holds all of the Echonest API calls, and returns the response (or promise)
 * back to the caller.
 * @return dataFactory array
 **/
 
angular.module('spotmop.services.echonest', [])

.factory("EchonestService", ['$rootScope', '$resource', '$localStorage', '$http', '$interval', '$timeout', 'SettingsService', function( $rootScope, $resource, $localStorage, $http, $interval, $timeout, SettingsService ){
    
    var baseURL = 'http://developer.echonest.com/api/v4/';
    var apiKey = SettingsService.getSetting('echonestapikey','YVW64VSEPEV93M4EG');
    var profileID = SettingsService.getSetting('echonesttasteprofileid',false);
	
	// setup response object
    return {
        
        isOnline: false,
        
        start: function(){
            
            SettingsService.setSetting('echonestenabled',true);
            
            // if we don't have a taste profile, make one
            if( !SettingsService.getSetting('echonesttasteprofileid',false) ){
                this.createTasteProfile()
                    .success( function(response){ 
                        SettingsService.setSetting('echonesttasteprofileid', response.response.id);
                        this.isOnline = true;
                        $rootScope.echonestOnline = true;
                    })
                    .error( function(error){
                        this.isOnline = false;
                        $rootScope.echonestOnline = false;
                    });
            }else{
                this.getTasteProfile( SettingsService.getSetting('echonesttasteprofileid',false) )
                    .success( function(response){
                        this.isOnline = true;
                        $rootScope.echonestOnline = true;
                        $localStorage.echonesttasteprofile = response.response.catalog;
                    })
                    .error( function(error){
                        this.isOnline = false;
                        $rootScope.echonestOnline = false;
                    });
            }
        },
        
        stop: function(){            
            SettingsService.setSetting('echonestenabled',false);            
            $rootScope.echonestOnline = false;
        },
        
        /**
         * Taste Profile
         **/
		createTasteProfile: function(){
            return $.ajax({
                url: baseURL+'catalog/create',
                method: "POST",
                data: {
                        api_key: apiKey,
                        format: 'json',
                        type: 'general',
                        name: 'spotmop:' + Date.now() + Math.round((Math.random() + 1) * 1000),
                    }
            });
        },
        
		getTasteProfile: function(){
            return $.ajax({
                url: baseURL+'tasteprofile/read?api_key='+apiKey+'&id='+profileID+'&bucket=audio_summary',
                method: "GET"
            });
        },
        
		
		/**
		 * Add a number of trackids to the taste profile
		 * @param action = string the action that we need to add ("delete"|"update"|"play"|"skip")
		 * @param trackid = string|array spotify uri
		 * @param favorite = boolean (optional) add these track(s) as favorites
		 * @return ajax request
		 **/
		addToTasteProfile: function( action, trackid ){
			
			var requestData = [];
			var trackids = [];
			
			// if we've been given a single string, wrap it in an array
			if( typeof( trackid ) === 'string' ){
				trackids = [trackid];
			}else{
				trackids = trackid;
			}
			
			// loop all the trackids (even if a single one, wrapped in an array)
			angular.forEach( trackids, function( trackid ){
			
				// add each to our request payload
				requestData.push( {
								action: action,
								item: {
									track_id: trackid
								}
							} );
			});
		
            return $.ajax({
                url: baseURL+'tasteprofile/update',
                method: "POST",
				data: {
						api_key: apiKey,
						format: 'json',
						data_type: 'json',
						id: profileID,
						data: JSON.stringify( requestData )
					}
            });
        },
        
        
        /**
         * Get artist
         **/
		getArtistBiography: function( artistid ){
            return $.ajax({
                url: baseURL+'artist/biographies?api_key='+apiKey+'&format=json&results=1&id='+artistid,
                method: "GET"
            });
        },
		
        
        /**
         * Recommended content
         **/
		recommendedArtists: function(){
            return $.ajax({
                url: baseURL+'artist/similar?api_key='+apiKey+'&seed_catalog='+profileID+'&format=json&bucket=id:spotify&results=10',
                method: "GET"
            });
        }
	};
}]);





