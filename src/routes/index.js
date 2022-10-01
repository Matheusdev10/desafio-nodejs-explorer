// a função deste arquivo é
//reunir todas as rotas da
//minha aplicação
const { Router } = require('express');
const userRouter = require('./users.routes.js');

const routes = Router();

routes.use('/users', userRouter);

module.exports = routes;
