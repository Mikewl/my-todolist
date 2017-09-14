const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const app = require('../app.js');
const puppeteer = require('puppeteer');

describe('Todolist', function() {
    var browser, page;
    this.timeout(6000);
    before(async function(){
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        page = await browser.newPage();
        await page.goto("http://localhost:8080/")
    });
    describe('Server', function() {
        it('should create an empty array', function(){
            app.todolist.should.be.an('array').that.is.empty;
        });
        describe('Site and redirect', function(){
            it('should redirect when entering /', async function(){
                await chai.request(app.app)
                    .get('/')
                    .then(function(res){
                        res.redirects[0].should.contain('/todo');
                    });
            });
            it('should redirect when entering anything other than /todo', async function(){
                await chai.request(app.app)
                    .get('/abc')
                    .then(function(res){
                        res.redirects[0].should.contain('/todo');
                    });
            });
            it('should return the site when entering /todo', async function(){
                await chai.request(app.app)
                    .get('/todo')
                    .then(function(res){
                        res.redirects.should.be.empty;
                    });
            });
            it('should redirect when editing an empty id', async function(){
                await chai.request(app.app)
                    .post('/todo/edit/')
                    .type('form')
                    .send({'editContent': 'NEWTODOTWO'})
                    .then(function(res){
                        res.redirects[0].should.not.contain('edit');
                    });
            });
        });
        describe('Adding items', function(){
            it('should redirect when adding an item', async function(){
                await chai.request(app.app)
                    .post('/todo/add/')
                    .type('form')
                    .send({'newtodo': 'NEWTODO'})
                    .then(function(res){
                        res.redirects[0].should.contain('/todo');
                    });
            });
            it('should have added a SINGLE item', function(){
                app.todolist.should.contain('NEWTODO');
            });
            it('should redirect deleting an empty id and not delete anything', async function(){
                await chai.request(app.app)
                    .get('/todo/delete')
                    .then(function(res){
                        res.redirects[0].should.not.contain('delete');
                    });
                    app.todolist.should.have.lengthOf(1);
            });
            it('should redirect when adding an empty item and not add anything', async function(){
                await chai.request(app.app)
                    .post('/todo/add/')
                    .type('form')
                    .send({'newtodo': ''})
                    .then (function(res){
                        res.redirects[0].should.contain('/todo');
                    });
                app.todolist.should.have.lengthOf(1);
            });
        });
        describe('Deleting items', function(){
            it('should redirect when successfully deleting', async function(){
                await chai.request(app.app)
                    .get('/todo/delete/0')
                    .then(function(res){
                        res.redirects[0].should.not.contain('delete');
                    });
            });
            it('should have removed the item from the list', async function(){
                app.todolist.should.be.an('array').that.is.empty;
                await chai.request(app.app)
                    .post('/todo/add/')
                    .type('form')
                    .send({'newtodo': 'NEWTODO'})
                    .then(function(res){
                        res.should.have.status(200);
                    });
            });
        });
        describe('Editing items', function(){
            it('should redirect when editing', async function(){
                await chai.request(app.app)
                    .post('/todo/edit/0')
                    .type('form')
                    .send({'editContent': 'NEWTODOTWO'})
                    .then(function(res){
                        res.redirects[0].should.not.contain('edit');
                    });
        });
        it('should have edited the list', function(){
                app.todolist.should.contain('NEWTODOTWO');
            });
        });
        describe('Editing items', function(){
            it('should redirect when editing to be empty', async function(){
                await chai.request(app.app)
                    .post('/todo/edit/0')
                    .type('form')
                    .send({'editContent': ''})
                    .then(function(res){
                        res.redirects[0].should.not.contain('edit');
                    });
            });
            it('should have not edited the list', function(){
                app.todolist.should.contain('NEWTODOTWO');
            });
        });
    });
    describe('Client Side', function(){
        it('should not show the edit form', async function(){
            app.todolist.should.contain('NEWTODOTWO');
            await page.reload();
            var displayStyle = await page.evaluate(function() {
                return document.getElementById('editContent').parentElement.parentElement.style.display;
            });
            displayStyle.should.equal('');
        });
        it('should show the edit form on clicking the pencil', async function(){
            await page.click('a[onClick]');
            var displayStyle = await page.evaluate(function() {
                return document.getElementById('editContent').parentElement.parentElement.style.display;
            });
            displayStyle.should.equal('block');
        });
        it('should have text inside the textbox be the same as the text on the server', async function(){
            var serverVal = app.todolist[0];
            var clientVal = await page.evaluate(function() {
                return document.getElementById('editContent').value;
            });
            serverVal.should.equal(clientVal);
        });
        it('should submit the edited item and have it update server and clientside', async function(){
            await page.evaluate(function() {
                document.getElementById('editContent').value = "NEWTODOTHREE";
            });
            await page.click("[value|=Edit]");
            var clientVal = await page.evaluate(function() {
                return document.getElementById('editContent').value;
            });
            var serverVal = app.todolist[0];
            serverVal.should.equal(clientVal);
        });
        it('should not show the edit form after editing', async function(){
            app.todolist.should.contain('NEWTODOTHREE');
            await page.reload();
            var displayStyle = await page.evaluate(function() {
                return document.getElementById('editContent').parentElement.parentElement.style.display;
            });
            displayStyle.should.equal('');
        });
        it('should only show one edit form', async function(){
            await chai.request(app.app)
            .post('/todo/add/')
            .type('form')
            .send({'newtodo': 'NEWTODO'})
            .then(function(res){
                res.should.have.status(200);
            });
            await page.reload();
            app.todolist.should.contain('NEWTODO');
            await page.click("[href*='1'] + a");
            await page.click("[value|=Edit]");
            var displayStyle = await page.evaluate(function() {
                return document.getElementById('editContent').parentElement.parentElement.style.display;
            });
            displayStyle.should.equal('');
        });
        it('should reload when clicking cancel', async function(){
            await page.reload();
            await page.click("[value|=Edit]");
            await page.click("[value|=Cancel]");
            var displayStyle = await page.evaluate(function() {
                return document.getElementById('editContent').parentElement.parentElement.style.display;
            });
            displayStyle.should.equal('');
        });
    });
    describe('Security', function(done){
        it('should NOT allow to post a script into the add function', async function(){
            await chai.request(app.app)
            .post('/todo/add/')
            .type('form')
            .send({'newtodo': '<script> alert("test"); </script>'})
            .then(function(res){
                res.redirects[0].should.contain('error');
            });
            app.todolist.should.not.contain('<script> alert("test"); </script>');
        });
        it('should NOT allow to post a script into the edit function', async function(){
            await chai.request(app.app)
            .post('/todo/edit/0')
            .type('form')
            .send({'editContent': '<script> alert("test"); </script>'})
            .then(function(res){
                res.redirects[0].should.contain('error');
            });
            app.todolist.should.not.contain('<script> alert("test"); </script>');
        });
    });
    after(function(){
        browser.close();
     });
});

