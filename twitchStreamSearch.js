const clientId = 'badmunid1un07jkpxtfe2dhpt31klax';
var channels = [];

var maxClicks = 0;
var total = 0;
var counter = 0;

function clearChannels(){
    channels = [];
    counter = 0;
}

function sendSearchRequest(offset){
  document.getElementById("hiddenStatus").innerHTML = "true";

  //clear list to add next streams
  var myNode = document.getElementById("list");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  
  var str = document.getElementById("searcher").value;
  var keyword = str.split(' ').join('%20'); //keyword converted to URL param
  
  if(!validateInput(keyword)){
	return;
  }


  if(offset * 10 >= channels.length) {
      let xhr = new XMLHttpRequest();


      /** To avoid executing a large and expensive function with every pagination, I am setting the limit to 100 entries (the max), and then using pointers
      to traverse through the channels with 10 listed per page. When the user completes looking through all 100 entries, if there are more entries to show,
      we send another XHR request for the next 100 entries using the offset URL parameter. **/

      /** The API isn't perfect, and the endpoint doesn't return all streams as expected at times.
      The offset and limit URL parameters work best when the endpoint sends back the number of entries as expected and documented by Twitch.
      When this isn't the case, the end of the streams list may not match up with the initial total number of streams **/

      /** A workaround would be to resort to calling the API with every pagination, with limit being 10 streams for each page and the offset going up by 10.
      This will ensure that the total number of streams will always be updated with every pagination and we wouldn't need to keep track of all the channels
      in a data structure. However, actions on this web app would turn very expensive since a request is sent for every arrow click.

       ex. xhr.open('GET', 'https://api.twitch.tv/kraken/search/streams?q=' + keyword.toLowerCase() + '&limit=10&client_id=' + clientId + '&offset=' + 10* offset, true);**/

      /** In a real life professional setting, instead of a workaround, I would make sure to maintain the API so that it is returning
      precise responses depending on the URL parameters sent in the request :) **/

      xhr.open('GET', 'https://api.twitch.tv/kraken/search/streams?q=' + keyword.toLowerCase() + '&limit=100&client_id=' + clientId + '&offset=' + offset * 10, true);

      xhr.onload = function () {

          let data = JSON.parse(xhr.response);
          total = data._total;

          let totalElm = document.getElementById("total");
          totalElm.style.display = "block";
          totalElm.innerHTML = "Total results: "+total; //show total number of streams

          if (total === 0) {
              hidePagination();
          }else{
              showRightArrow();
          }


          maxClicks = Math.ceil(total / 10); //limit next page pagination based on number of entries, 10 per page

          data.streams.forEach(function (val) {
              channels.push(val);
          });

          showStreams(offset);
      };

      xhr.send(null);
  }

  else{
        showStreams(offset);
  }

  showLeftArrow();

}

function showStreams(offset){
    //show next or previous 10 streams
    let startIndex = offset * 10;
    let endIndex = startIndex + 10;

	for(let i = startIndex; i < endIndex; i++){
	    if(channels[i]){
	        craftStreamCard(channels[i]);
        }

    }

	document.getElementById('pages').innerText = (offset + 1) + ' / ' + maxClicks;

    let searchElm = document.getElementById("search2");
	if(maxClicks === counter + 1){ //if user on last page of entries
	  searchElm.style.visibility = "hidden";
      searchElm.disabled = true;
	}
	else if(maxClicks > counter + 1){
	  searchElm.style.visibility = "visible";
      searchElm.disabled = false;
	}
}

function craftStreamCard(data) {
  let card;
  if(data.channel.logo == null){
	  data.channel.logo = "http://freeiconspng.com/uploads/no-image-icon-15.png";
  }
  card = displayStream(data.channel.display_name, data.channel.logo, data.game, data.channel.status, data.viewers); //display stream data
  document.getElementById("list").innerHTML += card;
}

function displayStream(name, logo, game, description, viewers) { //create HTML element for each stream
  let streamEl = "<div class='channel-card' id='" + name.toLowerCase() + "'>";
  streamEl += "<a href='http://www.twitch.tv/" + name + "'><img class='card-logo' width=100px src='" + logo + "' alt='" + name + " channel logo'></a>";
  streamEl += "<h1 class='card-name'><a href='http://www.twitch.tv/" + name + "'>" + name + "</a></h1>";
  streamEl += "<h3>" + game + " - " + viewers + " viewers</h3>";
  streamEl += "<h4>\"" + description + "\"</h4></div>";
  return streamEl;
}


function getNextStreams(){ //get next page of streams
  counter++;
  sendSearchRequest(counter);
}

function getPrevStreams(){ //get previous page of streams
  counter--;
  sendSearchRequest(counter);
}

function showLeftArrow() { //pagination left
  let searchElm = document.getElementById("search1");
  searchElm.style.visibility = "hidden"; //if counter is 0, if user is on first page
  searchElm.disabled = true;
  
  if(counter > 0){ //if user is on second page and on
	searchElm.style.visibility = "visible";
    searchElm.disabled = false;
  }
}

function showRightArrow() { //pagination right
  let searchElm = document.getElementById("search2");
  if(document.getElementById("hiddenStatus").innerHTML === "true"){
    searchElm.style.visibility = "visible";
    searchElm.disabled = false;
  }
}

function validateInput(keyword){ //input field validation, alphanumeric, spaces, dashes
  let alphaNumeric = "^[%20A-Za-z0-9-]+$";
  if(!keyword.match(alphaNumeric))
  {
	document.getElementById("hiddenStatus").innerHTML = "false"; //if input is not valid, set div to false
	hidePagination();
	document.getElementById("total").style.display = "none";
    alert("Please enter a valid search");
	return false;
  }	
  return true;
}

function hidePagination(){
  let searchElm = document.getElementById("search1");
  let searchElm2 = document.getElementById("search2");
  searchElm.style.visibility = "hidden";
  searchElm.disabled = true;
  searchElm2.style.visibility = "hidden";
  searchElm2.disabled = true;
}
