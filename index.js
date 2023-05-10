const fs = require('fs');
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signin', (req, res) => {
    res.render('signin')
})

app.get('/login', (req, res) => {
    res.render('login');
});


const showOthers = (namee) => {
    let file = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
    let userss = file.users;
    let others = [];

    for (i of userss){ 
        if (i.name !== namee){
            others.push(i.name);
        } 
    }
    return others;
}
function pad(n){return n<10 ? '0'+n : n}
function ISODateString(today){
    return pad(today.getUTCHours())+':'
    + pad(today.getUTCMinutes())+':'
    + pad(today.getUTCSeconds())
}

const getTime1 = () => {
    const today = new Date();
    const format = '|'+today.toLocaleDateString('en-US');
    const hours = pad(today.getHours())+':';
    const minutes = pad(today.getMinutes())+':';
    const seconds = pad(today.getSeconds())+':';
    const time = hours+minutes+seconds;
    return time;
}

const showMessages = (chatName) => {
    const file = JSON.parse(fs.readFileSync('./chats.json', 'utf-8'));
    const messages = file.chats[chatName];
    let mess = []
    
    for (let m of messages){
        const val = Object.values(m);
        const k = Object.keys(m);
        if (val.length){
            let arr = k[0].split(' ');
            let n = arr[3];
            mess.push([val[0],n]);
        }
    }

    return mess;
}

const getTime = () => {
    const today = new Date();
    const format = '|'+today.toLocaleDateString('en-US');
    const hours = today.getHours()+':';
    const minutes = today.getMinutes()+':';
    const seconds = today.getSeconds()+':';
    const time = hours+minutes+seconds;
    return time;
}


app.get('/user/:username/', (req, res) => {
    let data = {username: req.params.username, others: showOthers(req.params.username)};
    res.render('user', data);
});

app.get('/user/:username/chat/:friend', (req, res, next) => {
    let data = {username: req.params.username, friend: req.params.friend, message: req.params.message, others: showOthers(req.params.username),};
    let file = JSON.parse(fs.readFileSync('./chats.json', 'utf-8'));
    let chs = file.chats;

    let chat = data.username + "-" + data.friend + "-chat";
    let chat1 = data.friend + "-" + data.username + "-chat";

    let time = getTime();
    let mmname = `message/${time}`;
    let mname = `${time}`+' Message from '+data.username;
    let message = {[mname]: file[mmname]};
    let to = `to-${data.friend}`;
    let to1 = `to-${data.username}`;
    
    if (chat in chs){
        file.chats[chat].push(message);
        fs.writeFileSync('./chats.json', JSON.stringify(file, null, 2));
        data.mess = showMessages(chat);
    } else if (chat1 in chs){
        file.chats[chat1].push(message);
        fs.writeFileSync('./chats.json', JSON.stringify(file, null, 2));
        data.mess = showMessages(chat1);
    } else if (!(chat in chs && chat1 in chs)) {
        file.chats[chat] = [];
        fs.writeFileSync('./chats.json', JSON.stringify(file, null, 2));
        data.mess = showMessages(chat);
    }
    res.render('chat', data);
})

app.get('/user/:username/chat/:friend/:message', (req, res) => {
    let data = {username: req.params.username, friend: req.params.friend, message: req.params.message, others: showOthers(req.params.username)};
    res.render('chat', data);
})

app.post('/check-user', (req, res) => {
    let username = req.body.username;
    let word = req.body.password;

    let file = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
    file.users.push({name: username, password: word});

    fs.writeFileSync('./names.json', JSON.stringify(file, null, 2));

    if (username == ""){
        return res.redirect('/');
    } 
    else {
        return res.redirect('/login');
    }
});

app.post('/user/:username/chat/:friend/:message', (req, res, next) => {
    const m = req.body.message;

    let file = JSON.parse(fs.readFileSync('./chats.json', 'utf-8'));
    let time = getTime();
    file[`message/${time}`] = m;

    fs.writeFileSync('./chats.json', JSON.stringify(file, null, 2));
    
    return res.redirect(req.get(`referer`));
})

app.post('/verify', (req, res) => {
    let username = req.body.usernamev;
    let word = req.body.passwordv;

    let obj = {name: username, password: word};

    let file = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
    let userss = file.users;
    let arr = [];

    for (i of userss){
        if (i.name == obj.name && i.password == obj.password){
            arr.push(obj.name);
        } 
    }

    if (arr.length === 0){ 
        return res.redirect('/login');
    } else if (arr.length === 1){
        return res.redirect('/user/' + username);
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
