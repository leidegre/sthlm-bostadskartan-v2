
function initMap() {
  window.map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 59.329444,
      lng: 18.068611
    },
    zoom: 12
  })
  postMessage('initMap', '*')
}

window.initMap = initMap
