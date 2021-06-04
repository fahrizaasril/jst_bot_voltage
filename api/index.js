var express = require('express');
var r = express.Router();

// load pre-trained model
const model = require('./sdk/model.js');
const cls_model = require('./sdk/cls_model.js');

// Bot Setting
const TelegramBot = require('node-telegram-bot-api');
const token = '1659364972:AAFRXlLjVN-HcgQfce1WZiQNC6J5rJmf7OI'
const bot = new TelegramBot(token, {polling: true});


// bots
bot.onText(/\/start/, (msg) => { 
    console.log(msg)
    bot.sendMessage(
        msg.chat.id,
        `hello ${msg.chat.first_name}, welcome...\n
        click  /predict`
    );   
});



state = 0;
bot.onText(/\/predict/, (msg) => { 
    bot.sendMessage(
        msg.chat.id,
        `input nilai i|v example 9|9`
    );   
    state = 1;
});

bot.on('message', (msg) => {
    if(state == 1){
        s = msg.text.split("|");
        i = s[0]
        r = s[1]
        model.predict(
            [
                parseFloat(s[0]), // string to float
                parseFloat(s[1])
            ]
        ).then((jres)=>{
            v = parseFloat(jres[0])
            p = parseFloat(jres[1])
            
            cls_model.classify([parseFloat(s[0]), parseFloat(s[1]), p, v]).then((jres2) =>{
                bot.sendMessage(
                    msg.chat.id,
                    `Nilai v yang diprediksi adalah ${jres[0]} volt`
                );   
                bot.sendMessage(
                    msg.chat.id,
                    `Nilai p yang diprediksi adalah ${jres[1]} watt`
                );
                bot.sendMessage(
                    msg.chat.id,
                    `Klasifikasi tegangan ${jres2}`
                );   
            }) 
        })
    }else{
        state = 0
    }
})

// routers
r.get('/prediction/:i/:r', function(req, res, next) {    
    model.predict(
        [
            parseFloat(req.params.i), // string to float
            parseFloat(req.params.r)
        ]
    ).then((jres)=>{
        res.json(jres);
    })
});

// routers
r.get('/classify/:i/:r', function(req, res, next) {
      model.predict(
        [
                parseFloat(req.params.i), //string nofloat
                parseFloat(req.params.r),
        ]
       ).then((jres)=>{
           cls_model.classify(
               [
                parseFloat(req.params.i), //string nofloat
                parseFloat(req.params.r),
                parseFloat(jres[0]),
                parseFloat(jres[1])
               ]
               ).then((jres_)=>{
                res.json(jres_)
           })
      })
});
        
module.exports = r;
