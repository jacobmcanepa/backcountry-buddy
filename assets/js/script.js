var locationInputEl = document.querySelector("#location");
var formEl = document.querySelector("#form");
var campgroundArray = [];
var loader = document.querySelector("#loading");
var mainEl = document.querySelector("#main");
var weatherEl = document.querySelector("#weather");
var saved = JSON.parse(localStorage.getItem("campsites")) || [];
var camgroundList = document.querySelector("#campground-ul");

// grabs coordinates from openweathermap api then runs them through the getCampground() function
var getCoords = function(location) {
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=1&appid=a97605dca80be3bef695a54ff827f901";

    fetch(apiUrl).then((response) => {
        if (response.ok) {
            response.json().then((data) => {
                if (data.length === 0) {
                    alert("Error: Please enter a valid city");
                } else {
                    // if there are no errors, call getCampground() with lat and lon
                    getCampground(data[0].lat, data[0].lon);
                    //getWeather(data[0].lat, data[0].lon);
                }
            });
        } else {
            alert("Error: Please enter a valid city");
        }
    });
};

// form input handler
var submitFormHandler = function(event) {
    event.preventDefault();
    saved = [];

    // retrieves value of form input and calls getCoords(), then clears input value
    var location = locationInputEl.value.trim();
    getCoords(location);
    locationInputEl.value = "";
};

// displays list up to 10 campground names based on lat and lon
var getCampground = function(lat, lon) {
    var apiUrl = 'https://cors-anywhere.herokuapp.com/api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat='+ lat + '&landmarkLong=' + lon + '&api_key=k5fj6q5tbyeter6ag6f4a6w7';
    camgroundList.innerHTML = "";

    // shows loading symbol while api is fetching data
    displayLoading();

    fetch(apiUrl)
        .then((response) => {
            return response.text();
        })
        .then((data) => {
            // once there is data, loading symbol hides
            hideLoading();
            // parses through xml response
            var parser = new DOMParser(),
                xmlDoc = parser.parseFromString(data, 'text/xml'),
                resultInfo = xmlDoc.getElementsByTagName("result");

            campgroundArray = [];
            var buttonID = 0;
            // retrieves x campground names and displays them on DOM
            for (var i = 0; i < resultInfo.length; i++) {
                if (i === 10) {
                    break;
                } else {
                    var siteName = resultInfo[i].getAttribute("facilityName"),
                        siteLat = resultInfo[i].getAttribute("latitude"),
                        siteLon = resultInfo[i].getAttribute("longitude");

                    var listItem = document.createElement("li");
                    listItem.className = "text-center";

                    var buttonEl = document.createElement("button");
                    buttonEl.classList = "button expanded list-button";
                    buttonEl.setAttribute("id", buttonID);
                    buttonID++
                    buttonEl.textContent = siteName;

                    listItem.appendChild(buttonEl);
                    camgroundList.append(listItem);
                    //console.log(siteName + ": lat - " + siteLat + " lon - " + siteLon);

                    var obj = {
                        lat: siteLat,
                        lon: siteLon,
                        name: siteName
                    };

                    campgroundArray.push(obj);
                }
            }
            
            localStorage.setItem("campsites", JSON.stringify(campgroundArray));
        });
};

// map code
var campgroundMap = function(lat, lng, name) {
    // clears old map or placeholder map
    document.getElementById("map").innerHTML="";

    // inserts map after click event is heard
        let map;

        function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: lat, lng: lng },
            zoom: 10,
        });

        new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map,
            title: name,
        });
        }

        window.initMap = initMap();
};

// adds display class to loading div
var displayLoading = function() {
    loader.classList.add("display");
};

//removes display class from loading div
var hideLoading = function() {
    loader.classList.remove("display");
};

// campsite button handler
var siteButtonHandler = function(event) {
    // creates target element & grabs the target's id attribute
    var targetEl = event.target,
        id = targetEl.getAttribute("id");

    // if a button with a class of list-button is clicked & "saved" array is empty...
    if (targetEl.matches(".list-button") && saved.length === 0) {
        // start parsing through the campgroundArray...
        for (var i = 0; i < campgroundArray.length; i++) {
            // ...and if the target's id is equal too current index...
            if (parseInt(id) === i) {
                // display map
                var lat = parseFloat(campgroundArray[i].lat),
                    lon = parseFloat(campgroundArray[i].lon),
                    name = campgroundArray[i].name;
                    
                campgroundMap(lat, lon, name);
                getWeather(lat, lon);
            }
        }
    }

    // if button with class of list-button is clicked & "campgroundArray" is empty...
    else if (targetEl.matches(".list-button") && campgroundArray.length === 0) {
        // start parsing through the "saved" array
        for (var i = 0; i < saved.length; i++) {
            //... and if target's id is equal to current index...
            if (parseInt(id) === i) {
                // display map
                var lat = parseFloat(saved[i].lat),
                    lon = parseFloat(saved[i].lon),
                    name = saved[i].name;

                campgroundMap(lat, lon, name);
                getWeather(lat, lon);
            }
        }
    }
};

// get weather data for origin point by getting lat/lon from getcoords function
var getWeather = (lat, lon) => {
    var apiUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/forecast?locations=" + lat + "," + lon + "&aggregateHours=24&forecastDays=5&unitGroup=us&shortColumnNames=false&contentType=json&locationMode=single&key=654PZ3CWHV36VXZPG7J5EFCTF"
    var arr = [];

    fetch(apiUrl).then(response => {
        response.json().then(data => {
            //console.log(data.location.values);
            var forecastArr = data.location.values;

            for (var i = 0; i < forecastArr.length; i++) {
                var obj = {
                    id: i,
                    maxt: forecastArr[i].maxt,
                    mint: forecastArr[i].mint,
                    humidity: forecastArr[i].humidity,
                    wspd: forecastArr[i].wspd,
                    uvindex: forecastArr[i].uvindex,
                    dateTime: forecastArr[i].datetimeStr
                };

                arr.push(obj);
            }
            console.log(arr);
        });
    });
};

var loadSites = function() {
    var buttonID = 0

    if (saved.length !== 0) {
        getWeather(saved[0].lat, saved[0].lon);
    }

    for (var i = 0; i < saved.length; i++) {
        var listItem = document.createElement("li");
        listItem.className = "text-center";

        var buttonEl = document.createElement("button");
        buttonEl.classList = "button expanded list-button";
        buttonEl.setAttribute("id", buttonID);
        buttonID++
        buttonEl.textContent = saved[i].name;

        listItem.appendChild(buttonEl);
        camgroundList.append(listItem);
    }
};

loadSites();
formEl.addEventListener("submit", submitFormHandler);
mainEl.addEventListener("click", siteButtonHandler);