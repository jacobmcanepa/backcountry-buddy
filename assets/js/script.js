var locationInputEl = document.querySelector("#location");
var formEl = document.querySelector("#form");

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

    // retrieves value of form input and calls getCoords(), then clears input value
    var location = locationInputEl.value.trim();
    getCoords(location);
    locationInputEl.value = "";
};

// displays list up to 20 campground names based on lat and lon
var getCampground = function(lat, lon) {
    var apiUrl = 'https://cors-anywhere.herokuapp.com/api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat='+ lat + '&landmarkLong=' + lon + '&api_key=k5fj6q5tbyeter6ag6f4a6w7';
    var camgroundList = document.querySelector("#campground-ul");
    camgroundList.innerHTML = "";

    fetch(apiUrl)
        .then((response) => {
            return response.text();
        })
        .then((data) => {
            // parses through xml response
            var parser = new DOMParser(),
                xmlDoc = parser.parseFromString(data, 'text/xml'),
                resultInfo = xmlDoc.getElementsByTagName("result");

            // retrieves 20 campground names and displays them on DOM
            for (var i = 0; i < resultInfo.length; i++) {
                if (i === 20) {
                    break;
                } else {
                    var siteName = resultInfo[i].getAttribute("facilityName");
                    var siteLat = resultInfo[i].getAttribute("latitude");
                    var siteLon = resultInfo[i].getAttribute("longitude");

                    var listItem = document.createElement("li");
                    listItem.textContent = siteName;
                    camgroundList.append(listItem);
                    console.log(siteName + ": lat - " + siteLat + " lon - " + siteLon);
                }
            }
        });
};

formEl.addEventListener("submit", submitFormHandler);