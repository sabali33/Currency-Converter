self.addEventListener('install', (event)=>{
     event.waitUntil(
         caches.open('ccv-static-file').then(
            (cache)=>{
                return cache.addAll([
                    '/',
                    'Currency-Converter/app.js',
                    'Currency-Converter/css/style.css',
                    'bundle.js'
                    
                ]);
                }
        )
     );
});
//fetch
 self.addEventListener('fetch', (event)=>{
     let originUrl = new URL(event.request.url);
     
     if(originUrl.pathname == '/bundle.js'){
         caches.open('cvv-state-file').then(cache =>{
             return fetch(event.request).then(response =>{
                return cache.put(event.request, response.clone()).then(() => {
                    return response;
                });
            });
         })
     }
     event.respondWith(
         caches.match(event.request).then((response)=>{
             //console.log(response, event.request);
             return response|| fetch(event.request)
         })
     );
     //self.postMessage('Hello, Just checking on you!', {name: 'Eliasu Abraman'});
 });
 self.addEventListener('activate', event=>{
     //caches.delete('ccv-static-file1');
     
 });