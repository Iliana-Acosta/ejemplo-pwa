const CACHE ='cache-1';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_INMUTABLE ='inmutable-1';



self.addEventListener('install', evento =>{
    const promesa =caches.open(CACHE)
    .then(cache=>{
    return cache.addAll([
    // '/',
    'index.html',
    'css/styles.css',
    'css/icons.css',
    'css/londinium-theme.css',
    'css/googleapi.css',
    'js/app.js',
    'js/bootstrap.min.js',
    'images/no-img.jpg',
    'offline.html',
    'form.html'
    ]);
    });

    self.addEventListener('activate', evento => {
        const respuesta = caches.keys().then(keys =>{
        //verificar cada nombre de espacios de caché
        keys.forEach(key=>{
        if(key !== CACHE && key.includes('cache')){
        return caches.delete(key);
        }
        });
        });
        evento.waitUntil(respuesta)
        });

    //Separamos los archivos que no se modificarán en un espacio de cache inmutable
    const cacheInmutable = caches.open(CACHE_INMUTABLE)
    .then(cache=>{
    cache.add('css/bootstrap.min.css');
    });
    //Indicamos que la instalación espere hasta que las promesas se cumplan
    evento.waitUntil(Promise.all([promesa, cacheInmutable]));
});

    

    self.addEventListener('fetch', evento =>{

    //Estrategia 2 CACHE WITH NETWORK FALLBACK
    const respuesta=caches.match(evento.request)
    .then(res=>{
    //si el archivo existe en cache retornalo
    if (res)
    return res;
    console.log('No existe', evento.request.url);
    //Procesamos la respuesta a la petición localizada en la web
    return fetch(evento.request)
    .then(resWeb=>{//el archivo recuperado se almacena en resWeb
    //se abre nuestro cache
    caches.open(CACHE_DINAMICO)
    .then(cache=>{
    //se sube el archivo descargado de la web
    cache.put(evento.request,resWeb);

    limpiarCache(CACHE_DINAMICO,5);
    })
    //se retorna el archivo recuperado para visualizar la página
    return resWeb.clone();
    });
    
    }).catch(err => {
    //si ocurre un error, en nuestro caso no hay conexión
    if(evento.request.headers.get('accept').includes('text/html')){
    //si lo que se pide es un archivo html muestra nuestra página offline que esta en cache
    return caches.match('/offline.html');
    }else if(evento.request.headers.get('accept').includes('png')){
        //si lo que se pide es un archivo png muestra nuestra una la no-img.png que esta en cache
        return caches.match('images/no-img.jpg');
        }
    });

    evento.respondWith(respuesta);

    


    function limpiarCache(nombreCache, numeroItems){
        //abrimos el cache
        caches.open(nombreCache)
            .then(cache=>{
                return cache.keys()
                    .then(keys=>{
                        if (keys.length>numeroItems){
                            cache.delete(keys[0])
                            .then(limpiarCache(nombreCache, numeroItems));
        }
        });
        });
    }

    

    

    });



    

