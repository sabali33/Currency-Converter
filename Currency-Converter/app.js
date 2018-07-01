import idb from 'idb';
import form from './form';
import $ from "jquery";
var https = require('https');

const controller = {
    init(){
       
       this.startServiceWorker();
       
       this.openDatabase().get().then( data => {
           if(!data.length){
               this.getCurrencies();
               
           }
       });
       //this.getOptions().then(res=> console.log(res));
       this.loadForm()
       let contClass = this;

       
       window.addEventListener('load', (e)=>{
        
        this.loadForm();
        
       });
    },
    startServiceWorker(){
         if (navigator.serviceWorker) {
            navigator.serviceWorker.register('/sw.js').then(function(reg) {
            //
            if (!navigator.serviceWorker.controller) {
                return;
            }
             
            if (reg.waiting) {
                console.log('waiting');
                return;
            }

            if (reg.installing) {
                reg.installing.addEventListener('statechange', ()=>{
                    if(reg.installing.state == 'installed'){
                        console.log('Yes installed');
                    }
                })
                return;
            }
            reg.addEventListener('updatefound', ()=>{
                console.log('updatefound');
            });
            //reg.addEventListener('message', event => console.log(event.data));
            }).catch((error) => {
            //console.log(error);
            });
        }
    },
    openDatabase(db = 'currencies'){
        let cdPromise = idb.open('currencyDatabase', 3, upgradeDB=>{
            upgradeDB.createObjectStore('currencies', {keyPath: 'id'});
            upgradeDB.createObjectStore('c_rates', {keyPath: 'id'});
            //.createIndex('id', 'id');
        });
        const currencyDB = {
            set(values){
                return cdPromise.then(db => {
                const tx = db.transaction('currencies', 'readwrite');
                //const  currencies = this.getCurrencies();
              // console.log(values);
                for( let currency of values){
                    tx.objectStore('currencies').put({
                        id: currency.id,
                        currencyName : currency.currencyName,
                        currencySymbol : currency.currencySymbol,
                    });
                   
                }
                
                //tx.objectStore('currencies').put(values, 'currencies');
                return tx.complete;
                });
            },
            get(){
                return cdPromise.then(db => {
                return db.transaction('currencies')
                    .objectStore('currencies').getAll();
                });
            },
            clear(){
                return cdPromise.then(db => {
                const tx = db.transaction('currencies', 'readwrite');
                tx.objectStore('currencies').clear();
                return tx.complete;
                });
            }
        }
        const cRateDB = {
            set(values){
                return cdPromise.then(db => {
                const tx = db.transaction('c_rates', 'readwrite');
                if(values){
                    tx.objectStore('c_rates').put(values);
                }
              
                   
                return tx.complete;
                });
            },
            get(){
                return cdPromise.then(db => {
                return db.transaction('c_rates')
                    .objectStore('c_rates').getAll();
                });
            },
            clear(){
                return cdPromise.then(db => {
                const tx = db.transaction('c_rates', 'readwrite');
                tx.objectStore('c_rates').clear();
                return tx.complete;
                });
            }
        };
       return ( db == 'currencies') ? currencyDB : cRateDB;
    },
    getCurrencies(){
        
        let currencies = '';
        let contClass = this;
        https.get('https://free.currencyconverterapi.com/api/v5/currencies', (res)=>{
            let body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                try {
                    let jsonObj = JSON.parse(body);
                    
                    currencies = Object.values(jsonObj.results); //jsonObj;
                   //console.log(currencies);
                   if(currencies){
                       contClass.openDatabase().set(currencies);
                   }
                    
                   
                } catch(e) {
                    console.log("Parse error: ", e);
                    //cb(e);
                }
                
                //return jsonObj;
            });
        }).on('error', function(e){
            console.log("Got an error getting currencies: ", e);
           // cb(e);
        });
        
    },
    getRate(from_to_currencies){
        const contClass  = this;
        // https.get(`https://free.currencyconverterapi.com/api/v5/convert?q=${from_to_currencies}&compact=y`, resp => {
        //     let body = '';

        //     resp.on('data', function(chunk){
        //         body += chunk;
        //     });

        //     resp.on('end', function(){
        //         try {
        //             let jsonObj = JSON.parse(body);
                    
        //            if(jsonObj){
        //                let data = {
        //                    id: Object.keys(jsonObj)[0] ,
        //                    value: Object.values(jsonObj)[0] ,
        //                 };
        //                contClass.openDatabase('c_rates').set(data);
        //            }
        //            //return body;
                   
        //         } catch(e) {
        //             console.log("Parse error: ", e);
        //             //cb(e);
        //         }
                
        //         //
        //     });
        //     //return jsonObj;
        // });
        return fetch(new Request(`https://free.currencyconverterapi.com/api/v5/convert?q=${from_to_currencies}&compact=y`))
        .then(response => {
            if(response){
                return response.json();
            }
            
        }).then( data => {
            let dataDB = {
                id: Object.keys(data)[0] ,
                value: Object.values(data)[0] ,
            };
            contClass.openDatabase('c_rates').set(dataDB);
            
            return data;
        });
    },
    formTemplate(){
        return this.getOptions().then(options=>{
            
            return form.data.replace(/OPTION/g, options );
        })
       
    },
    getOptions(){
        let options = '';
        
        
       options = this.openDatabase().get().then(res =>{
            let data = '';
            for( let currency of res ){
                let sym = (currency.currencySymbol) ? `-${currency.currencySymbol}` : '';
                
                data += `<option value="${currency.id}">${currency.currencyName} ${sym}</option>`;
               
            }
            return data;
            
        });
        //console.log(this.openDatabase().get('id'));
        
        return options;
    },
    *iterateObj(obj){
        
        const data = [];
        for (const ob of obj) {
            
            data.push(yield ob); 
        }

        return data;
    },
    loadForm(){
        let formContainer = $('.currency-converter-container'); //document.getElementsByClassName('currency-converter-container');
        
        this.formTemplate().then(form =>{
            formContainer.html( form );//appendChild(form);
            this.getFormValues();
           
        })
    },
    getFormValues(){
        
        let fromCurrencyName, toCurrencyName, amount, id, convertedAmount;
        $('#submit').click(e => {
            e.preventDefault();
            amount = $('#from-field').val();
            fromCurrencyName = $('#from-currency-name').val();
            toCurrencyName = $('#to-currency-name').val();
            convertedAmount = $('#to-field');
            id = `${fromCurrencyName}_${toCurrencyName}`;
            
            
            this.getRate(id).then( res => {
                if(res){
                    convertedAmount.attr( 'value', (res[id].val * amount) );
                }
            }).catch( () => {
                this.openDatabase('c_rates').get().then( resp =>{
                    let oldRate = resp.filter( rate => {
                        if(rate.id == id){
                            return rate;
                        }
                    });
                    
                    convertedAmount.attr( 'value', (oldRate[0].value.val * amount) );
                    //
                }).catch( () =>{
                    alert('please check connection');
                });
            });
        })
    }

}
controller.init();
//export default controller.openDatabase();