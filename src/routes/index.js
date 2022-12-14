// a função deste arquivo é
//reunir todas as rotas da
//minha aplicação
const { Router } = require('express');
const usersRouter = require('./users.routes.js');
const notesRouter = require('./notes.routes');
const tagsRouter = require('./tags.routes');
const routes = Router();

routes.use('/users', usersRouter);
routes.use('/notes', notesRouter);
routes.use('/tags', tagsRouter);

module.exports = routes;
