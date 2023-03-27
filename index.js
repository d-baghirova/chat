const fs = require('fs');
const express = require('express');

//Cheetsheet
//let today = Date();
//let format = today.toLocaleDateString('en-US');




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


app.get('/user/:username/', (req, res) => {
    let data = {username: req.params.username, others: showOthers(req.params.username)};
    res.render('user', data);
});

app.get('/user/:username/chat/:friend', (req, res, next) => {
    let data = {username: req.params.username, friend: req.params.friend ,others: showOthers(req.params.username)};
    res.render('chat', data);
})

app.get('/user/:username/chat/:friend/:message', (req, res) => {
    let data = {username: req.params.username, friend: req.params.friend ,others: showOthers(req.params.username)};
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

app.post('/send', (req, res, next) => {
    const m = req.body.message;
    const name = req.body.username;
    const friend = req.body.friend;
    let today = new Date();
    let format = '/'+today.toLocaleDateString('en-US');
    let hours = today.getHours()+':';
    let minutes = today.getMinutes()+':';
    let seconds = today.getSeconds()+':';
    let time = hours+minutes+seconds;
    let mname = 'message'+time+format;

    let message = {[mname]: m};

    let file = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
    file.messages.push(message);


    fs.writeFileSync('./names.json', JSON.stringify(file, null, 2));
    return res.redirect(req.get(`referer`));
})

app.post('/verify', (req, res) => {
    let username = req.body.usernamev;
    let word = req.body.passwordv;

    let obj = {name: username, password: word};

    let file = JSON.parse(fs.readFileSync('./names.json', 'utf-8'));
    let userss = file.users
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