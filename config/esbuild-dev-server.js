import { createRequire } from 'module';
import config from './esbuild-config.mjs';
const require = createRequire(import.meta.url);
const ESBuild = require('esbuild');
const http = require('node:http');

const PORT = process.env.PORT || 3001;

// Создаем контекст локального сервера ESBuild на случайном порту
let ctx = ESBuild.context(config)

// Когда промис готов
ctx.then(ctxData => {
	/* Говорим ESBuild следить за файлами, и при изменении,
	заного собрать билд.*/
	ctxData.watch();
	// Запускаем локальный сервер, который отдает собранный проект
	let localServer = ctxData.serve({ servedir: config.outdir })
	return localServer;
}).then(localServerData => {
	// Берем из локального сервера данные
	const { host, port } = localServerData;
	/* Создаем прокси-сервер, чтобы настраивать его поведение */
	http.createServer((req, res) => {
	  const options = {
	    hostname: host,
	    port: port,
	    path: req.url,
	    method: req.method,
	    headers: req.headers,
	  }
	
	  // Настраиваем проброс каждого запроса через прокси-сервер к ESBuild
	  const proxyReq = http.request(options, proxyRes => {
	    // Если ESBuild отдает 404, показываем настроенную 404 страницу
	    if (proxyRes.statusCode === 404) {
	      res.writeHead(404, { 'Content-Type': 'text/html' })
	      res.end('<h1>A custom 404 page</h1>')
	      return
	    }
	
	    // Иначе, отдаем ответ
	    res.writeHead(proxyRes.statusCode, proxyRes.headers)
	    proxyRes.pipe(res, { end: true })
	  })
	
	  // Пробрасываем тело запроса к ESBuild
	  req.pipe(proxyReq, { end: true })
	  // Запускаем прокси-сервер на порту с номером PORT
	}).listen(PORT)
})
.catch(err => console.log(err));