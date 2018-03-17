var marker,marker1;          //variable del marcador
var coords = {};    //coordenadas obtenidas con la geolocalización
var mapa;       //Almacena el mapa creado en setMapa para su uso general en el script
var puntos = new Array();     //Almacena las coordenadas polares y las transforma en radianes
var puntosF = new Array();      //Almacena las coordenadas planas calculadas
var markers = [];     //Almacena los marcadores del mapa
//Funcion principal
initMap = function () 
{

    //usamos la API para geolocalizar el usuario
        navigator.geolocation.getCurrentPosition(
          function (position){
            coords =  {
              lng: position.coords.longitude,
              lat: position.coords.latitude
            };
            setMapa(coords);  //pasamos las coordenadas al metodo para crear el mapa
            
           
          },function(error){console.log(error);});
    
}

function setMapa (coords)
{   
      //Se crea una nueva instancia del objeto mapa
      var map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 13,
        center:new google.maps.LatLng(coords.lat,coords.lng),

      });
      mapa=map;

      mapa.addListener('click', function(event) {
          addMarker(event.latLng);
      });
}

// Carga de la libreria de google maps 

// Adds a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
      position: location,
      draggable: true,
      map: mapa
  });
  markers.push(marker);
}

//Metodos para la conversión de angulos polares a planos

function Rad(angulo){
  var g=angulo;
  angulo=(angulo*Math.PI)/180;
  return angulo;
}

function haversine(latitud,longitud){
  var d = 0; 
  //d=2r asin(raiz((sen(latitud/2)*sen(latitud/2))+(cos(latitud)*sen(longitud/2)*sen(longitud/2)))
  //radio de la tierra = 6371 km
  d = (2*6371)*Math.asin(Math.sqrt((Math.pow(Math.sin(-latitud/2),2))+(Math.cos(latitud)*Math.pow(Math.sin(longitud/2),2))));
  return d
}

function coordPlanas(d,latitud){
  //x=d cos(latitud);
  //y=d sin(latitud);
  var co = {x:d*Math.cos(latitud),y:d*Math.sin(latitud)};
  return co;
}

function Calcular(){
  if(markers.length > 3){
    //Convierte las cordenadas de los marcadores a radianes y las almacena en el array puntos
    puntos=new Array();
    setMapOnAll(mapa);
    for (var i = 0; i < markers.length; i++) {
      puntos.push({latitud: Rad(parseFloat(markers[i].position.lat())), 
                  longitud: Rad(parseFloat(markers[i].position.lng()))}
                );
    }
    //convierte las coordenadas polares en planas y las almacena en puntosF
    puntosF=new Array();
    for (var i = 0; i < puntos.length; i++) {
      puntosF.push({lat: coordPlanas(haversine(puntos[i].latitud,puntos[i].longitud),  puntos[i].latitud).x,
                   long: coordPlanas(haversine(puntos[i].latitud,puntos[i].longitud),  puntos[i].latitud).y}
                  );
    }

    //Hallar el area del poligono 
    var d=0,i=0;
    var area=0;
    for (var i = 0; i < puntosF.length-1; i++) {
      d=d+(puntosF[i].lat*puntosF[i+1].long);
      i=i+(puntosF[i+1].lat*puntosF[i].long);
    }
    area=Math.abs(d-i)/2;
    
    //Se calcula el punto medio del area para colocar la ventana de información

    var xmin=markers[0].position.lat();
    var xmax=markers[0].position.lat();
    var ymin=markers[0].position.lng();
    var ymax=markers[0].position.lng();

    for (var i = 1; i < markers.length; i++) {
      if(xmin>markers[i].position.lat()){
        xmin=markers[i].position.lat();
      }
      if(xmax<markers[i].position.lat()){
        xmax=markers[i].position.lat();
      }
      if(ymin>markers[i].position.lng()){
        ymin=markers[i].position.lng();
      }
      if(ymax<markers[i].position.lng()){
        ymax=markers[i].position.lng();
      }
    }

    var x=(xmin+xmax)/2;
    var y=(ymin+ymax)/2;
    var cordInfo = {lat:x,lng:y};

    //Se crea una nueva ventana de información de google maps

    var infowindow = new google.maps.InfoWindow({
      content: 'El area del terreno es:\n'+area,
      position: cordInfo
    });
    infowindow.open(mapa, null);
  } else {
    alert("Para calcular deben haber minimo 4 marcadores colocados");
  }

}
//Asigna los marcadores existentes al mapa
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
//Elimina todos los marcadores tanto en pantalla como en el array markers
function borrarMarcT(){
  setMapOnAll(null);
  markers = [];
}