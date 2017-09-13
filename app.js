const express = require('express');
const sanitizeHtml = require('sanitize-html');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const app = express();

let todolist = [];

/* The to do list and the form are displayed */
app.get('/todo', function(req, res) {
    res.render('todo.ejs', { todolist, clickHandler:"func1();" });
})

app.get('/todo/error', function(req, res) {
    res.render('error.ejs', { clickHandler:"func1();" });
})

/* Adding an item to the to do list */
.post('/todo/add/', urlencodedParser, function(req, res) {
    sanitised = sanitizeHtml(req.body.newtodo);
    if (sanitised != req.body.newtodo) {
        return res.redirect('/todo/error');
    }
    if (req.body.newtodo != '') {
        todolist.push(req.body.newtodo);
    }
    res.redirect('/todo');
})

/*Edit an item from the todo list */
.post('/todo/edit/:id', urlencodedParser, function(req, res) {
    sanitised = sanitizeHtml(req.body.editContent);
    if (sanitised != req.body.editContent) {
        return res.redirect('/todo/error');
    }
    if (req.body.editContent != '') { //remvoed id check as blank ids redirect
        todolist[parseInt(req.params.id)] = req.body.editContent;
    }
    res.redirect('/todo');
})
/* Deletes an item from the to do list */
.get('/todo/delete/:id', function(req, res) {
    todolist.splice(req.params.id, 1); //removed as no blank id is possible, redirects
    res.redirect('/todo');
})

/* Redirects to the to do list if the page requested is not found */
.use(function(req, res, next){
    res.redirect('/todo');
})

.listen(8080);

exports.app = app;
exports.todolist = todolist;

//"test": "nyc --reporter=text mocha"
