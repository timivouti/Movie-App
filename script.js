
//Funktiot Search-Barille, että laajenee, jos ruudun koko yli 1150px ja pienenee pois klikatessa

function searchBoxFocus(x) {
  if (window.innerWidth > 1150) {
    x.style.width = "250px";
  }
}

function searchBoxBlur(x) {
  if (window.innerWidth > 1150) {
    x.style.width = "150px";
  }
}

//Funktio mobiilille, jotta elokuvateattereiden paikat saa esille

var dashboardActive = false;

function showTheaters() {
  var movieTheatersList = document.getElementById('dashboardContainer');
  if (window.innerWidth > 1150) {
    return;
  }
  if (movieTheatersList.style.display != "none" || movieTheatersList.style.display != "") {
    movieTheatersList.style.display = "block";
  }
  else {
    movieTheatersList.style.display = "none";
  }
}

//Funktio, joka etsii kaikki elokuvateatterit ja tekee niistä painikkeet

var movieTheaterIDs = [];
var movieTheaterNames = [];

function getMovieTheaters() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var result = xhttp.responseXML;
      var theaterId = result.getElementsByTagName("ID");
      var theaterNames = result.getElementsByTagName("Name");
      for (var i = 1; i < theaterId.length; i++) {
          movieTheaterIDs.push(theaterId[i].childNodes[0].nodeValue);
          movieTheaterNames.push(theaterNames[i].childNodes[0].nodeValue);
      }
      var dashboardContainer = document.getElementById('dashboardContainer');
      for (var i = 0; i < movieTheaterIDs.length; i++) {
        dashboardContainer.innerHTML += '<button class="theaterButtons"><div class="movieTheaterLinks" onclick="showMovies('
        + movieTheaterIDs[i] + ')"><h2>' + movieTheaterNames[i] + '</h2></div></button>';
      }
    }
  };
  xhttp.open("GET", "http://www.finnkino.fi/xml/TheatreAreas/", true);
  xhttp.send();
}

getMovieTheaters();

//Funktio, jossa haetaan elokuvatietoja. Funktion alussa lisätään pyörivä svg-kuva, jotta käyttäjä näkee, että ladataan jotakin.
//Mobiilissa elokuvateatteri-luettelo häviää painaessa elokuvateatteria.
//Kaikki tiedot ja kuvat lisätään movie-luokkaiseen diviin. Linkki elokuvaan sekä youtube-trailerin linkit lisätään myös.
//Sivupaneelin korkeus lasketaan automaattisesti siitä kuinka monta elokuvaa näytetään.

var allIDs = [];
var allMoviesArray = [];

function showMovies(value) {
  allIDs = [];
  allMoviesArray = [];
  var content = document.getElementById('content');
  var url = "http://www.finnkino.fi/xml/Schedule/?area=" + value;
  scroll(0,0);
  content.innerHTML = '<img src="Rolling.svg" style="margin-left:auto;margin-right:auto;display:block;">';
  if (window.innerWidth < 1150) {
    document.getElementById('dashboard').style.height = "1%";
    document.getElementById('dashboardContainer').style.display = "none";
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var result = xhttp.responseXML;
      var movieTitle = result.getElementsByTagName("Title");
      var movieTitleOriginal = result.getElementsByTagName('OriginalTitle');
      var movieProductionYear = result.getElementsByTagName("ProductionYear");
      var movieImage = result.getElementsByTagName('EventMediumImagePortrait');
      var movieGenre = result.getElementsByTagName('Genres');
      var movieLengthInMinutes = result.getElementsByTagName('LengthInMinutes');
      var movieLocalRelease = result.getElementsByTagName('dtLocalRelease');
      var movieLocation = result.getElementsByTagName('TheatreAndAuditorium');
      var movieShowTime = result.getElementsByTagName('dttmShowStart');
      var movieURL = result.getElementsByTagName('ShowURL');
      var eventID = result.getElementsByTagName('EventID');
      var allTheMovies = "";
      for (var i = 0; i < movieImage.length; i++) {
          allTheMovies += '<div class="movie" value="' + movieTitle[i].textContent +'"><div class="movieImage"><img src="'
          + movieImage[i].textContent + '" class="moviePoster"></div><div class="movieText"><h3><br>'
          + movieTitle[i].textContent + '</h3><h4><br>' + movieTitleOriginal[i].textContent
          + ' (' + movieProductionYear[i].textContent + ')' + '<br>' + '<br><span id="' + i + '"></span>'
          + '<br><br><br>Genre: ' + movieGenre[i].textContent
          + '<br>Elokuvan pituus: ' + movieLengthInMinutes[i].textContent + ' minuuttia<br>Paikallinen julkaisupäivä: '
          + movieLocalRelease[i].textContent.substring(8, 10) + '.' + movieLocalRelease[i].textContent.substring(5, 7)
          + '.' + movieLocalRelease[i].textContent.substring(0, 4) + '<br><br>' + movieLocation[i].textContent
          + '<br>Kello ' + movieShowTime[i].textContent.substring(11, 16) + '<br>' + movieShowTime[i].textContent.substring(8, 10)
          + '.' + movieShowTime[i].textContent.substring(5, 7) + '.' + movieShowTime[i].textContent.substring(0, 4)
          + '<br><br><button class="buyTickets"><a href="' + movieURL[i].textContent
          + '">Osta Liput</a></button>' + '<button class="watchTrailer"><a href="https://www.youtube.com/embed/?listType=search&list='
          + movieTitle[i].textContent + ' trailer&autoplay=1">Katso Traileri</a></button>' + '</h4></div></div>';
          allIDs.push(eventID[i].textContent);
          allMoviesArray.push(movieTitle[i].textContent);
      }
      if (window.innerWidth > 1150) {
        var dashboardHeight = (1410 + ((movieImage.length - 3) * 500) + 214) + "px";
        document.getElementById('dashboard').style.height = dashboardHeight;
      }
      allTheMovies += '<div class="backButton" onclick="backToTop()"><i class="fa fa-arrow-up fa-4x" aria-hidden="true"></i></div>';
      getSynopsis();
      autoComplete();
      content.innerHTML = allTheMovies;
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}


//Onload-eventissä haetaan Pääkaupunki-seudun elokuvat

function loadDefault() {
  showMovies(1029);
}

//Funktio, jolla haetaan EventID:n perusteella elokuvan juoni ja lisätään se diviin

function getSynopsis() {
  var url = "http://www.finnkino.fi/xml/Events/";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = xhttp.responseXML;
        var IDs = result.getElementsByTagName('ID');
        var shortSynopsis = result.getElementsByTagName('ShortSynopsis');
        for (var i = 0; i < allIDs.length; i++) {
          for (var j = 0; j < IDs.length; j++) {
            if (allIDs[i] == IDs[j].textContent) {
              document.getElementById(i).innerHTML = shortSynopsis[j].textContent;
              break;
          }
          }
        }
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

//Autocomplete funktio search-barille

function autoComplete() {
  var moviesAutoComplete = [];
  var found = false;

  for (var i = 0; i < allMoviesArray.length; i++) {
    for (var j = 0; j < moviesAutoComplete.length; j++) {
      if (allMoviesArray[i] == moviesAutoComplete[j]) {
        found = true;
      }
    }
    if (found == false) {
      moviesAutoComplete.push(allMoviesArray[i]);
    }
    found = false;
  }

  $( function() {
    var availableTags = moviesAutoComplete;
    $( "#search" ).autocomplete({
      source: availableTags
    });
  } );
}

//Yksinkertainen haku-funktio, joka näyttää kaikki elokuvat, jos nimi täsmää täysin tai viisi kirjainta samasta paikasta täsmää.

function search() {
  var input = document.getElementById('search').value;
  var movies = document.getElementsByClassName('movie');
  var found = false;
  var divName = "";
  var count = 0;

  if (input == "") {
    for (var i = 0; i < movies.length; i++) {
      movies[i].style.display = "inline-block";
    }
    return;
  }

  for (var i = 0; i < movies.length; i++) {
    found = false;
    for (var j = 0; j < movies[i].getAttribute('value').length - 5; j++) {
      if (input == movies[i].getAttribute('value')) {
        found = true;
        count++;
        break;
      }
      else if (input.substring(j, (j + 5)) == movies[i].getAttribute('value').substring(j, (j + 5))) {
        found = true;
        count++;
        break;
      }
    }
    if (found != false) {
      movies[i].style.display = "inline-block";
    }
    else {
      movies[i].style.display = "none";
    }
  }
  if (window.innerWidth > 1150 && count >= 3) {
    var dashboardHeight = (1410 + ((count - 3) * 500) + 214) + "px";
    document.getElementById('dashboard').style.height = dashboardHeight;
  }
  else if (window.innerWidth > 1150 && count < 3) {
    var dashboardHeight = 1094 + "px";
    document.getElementById('dashboard').style.height = dashboardHeight;
  }
}

//Takaisin ylös -funktio

function backToTop() {
  scroll({top: 0, left: 0, behavior: 'smooth'});
}
