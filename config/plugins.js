import fs from 'fs';
import { createRequire } from 'module';
import styledComponentsPlugin from 'esbuild-plugin-styled-components';
import { clean } from 'esbuild-plugin-clean';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import esbuildPluginLicense from 'esbuild-plugin-license';
import { minifyHTMLLiterals } from 'minify-html-literals';

const require = createRequire(import.meta.url);
const copy = require('esbuild-plugin-copy');

export const getPluginsArr = (isDev, isProd, cleanDevServerFolder, devOutdir, buildOurdir) => {

	return [
		copy.copy({
	        assets: [
				/* Если это dev сервер или команда очистки папки dev сервера,
				то копируем файл, обеспечивающий работу hot reload в папку dev. */
				...(isDev || cleanDevServerFolder ? [{
		          from: ['./config/esbuild-live-reload.js'],
		          to: ['./'],
		        }] : []),
		        /* Если это сбор проекта для продакшена, то копируем лицензии шрифтов
				из папок, которые находятся в директории /src/assets/fonts/licenses/.
				Лицензии обязательно должны находиться в этой директории. Лучше именовать
				папки в соответствии с названиями шрифтов, вот так:
				/src/assets/fonts/licenses/Roboto/License
				Также копируем favicons.
				 */
				...(isProd ? [
					{
						from: ['./src/assets/fonts/licenses/**/*'],
						to: ['./assets/fonts/fonts-licenses/'],
					},
					{
						from: [
							'./src/*.ico',
							'./src/*.svg',
							'./src/*.png',
						],
						to: ['./'],
					},
					] : []),
			],
		}),
		htmlPlugin({
			files: [
				{
                    entryPoints: ['src/index.js'],
                    filename: 'index.html',
                    htmlTemplate: getHtmlTemplate(isDev, isProd),
                    title: 'React',
                    scriptLoading: 'defer',
                },
			],
		}),
		...(isProd ? [
			esbuildPluginLicense({
	  		/* При использовании свойства banner, как сказано в документации,
	  		возникает ошибка в пакете meriyah, который устанавливается вместе
	  		с ESBuild. Если его не использовать, по-умолчанию он добавляет
			комментарий в js бандл в начало файла. ESBuild по-умолчанию удаляет
			все комментарии из js bundle, но esbuildPluginLicense работает
	  		после того, как сформирован бандл. Поэтому пришлось заменить
			комментарий на пробел, а, чтобы удалить пробелы, написать
			небольшой плагин removeSpaces. */
	         banner: ' ',
	         thirdParty: {
			    includePrivate: false,
			    output: {
			      file: 'LICENSES',
			      template(dependencies) {
					  return dependencies.map((dependency) => getLicensesTemplate(dependency)).join('\n');
			      },
			    },
			  },
			}),
		] : []),
		styledComponentsPlugin({ transpileTemplateLiterals: true }),
		/* Если это команда clean-dev или build, то добавляем плагин очистки
		папки от предыдущей сборки. Также изменяем директорию для очистки. */
		...(
			cleanDevServerFolder || isProd ? [
				clean({ patterns: cleanDevServerFolder ? [`${devOutdir}/*`] : [`${buildOurdir}/*`] }),
			] : []
			),
		/* На продакшене: removeSpaces удаляет пробелы из js бандла, после того, как произошла
		сборка проекта. addPreloadToCss добавляет тег link preload для css бандла.  */
		...(
			isProd ? [
				removeSpaces,
				addPreloadToCss(isDev, devOutdir, buildOurdir)
				] : []
			)
	]
}

/*
Массив с объектами для предзагрузки ресурсов и формирования шаблона link тегов.
По-умолчанию link сформируется с rel=preload, чтобы это изменить, нужно добавить
другой rel. Другие дополнительные атрибуты не подставляются.
*/
const linksArr = [];

/* 
Если хотим, заполняем массив предзагрузки ресурсов с шаблонами
тегов link или просто пишем разметку. Если в массиве есть данные,
шаблон сформируется из него, если нет, то в основной шаблон добавиться
linksTemplate, где можно написать link в ручную.
 */
const getHtmlTemplate = (isDev, isProd) => {
	let linksTemplate = ``;
	
	if (linksArr.length) {
		linksArr.forEach((linkObj) => {
			const { rel, href, as, type, crossorigin } = linkObj;
			
			linksTemplate = `${linksTemplate}${`<link rel="${rel || 'preload'}" href="${href}" ${as ? `as="${as}"` : ''} ${type ? `type="${type}"` : ''} ${crossorigin ? 'crossorigin' : ''} />`}`;
		})
	}
	
	/* Простое минифицирование html с удалением пробелов. Шаблон нужно
	обязательно передавать с тегом html. Функция возвращает объект, где
	минифицированный код находится в свойстве code. slice обрезает html
	тег и ковычки. */
	return minifyHTMLLiterals(
		`html\`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					${linksTemplate}
					${isProd ? '<!-- css preload placeholder -->' : ''}
					<link rel="icon" href="/favicon.ico" sizes="32x32">
					<link rel="icon" href="/icon.svg" type="image/svg+xml">
					<link rel="apple-touch-icon" href="/apple-touch-icon.png"><!-- 180×180 -->
					<link rel="manifest" href="/manifest.json">
				</head>
       			<body>
       				<div id="root"></div>
       				${isDev ? '<script defer type="module" src="/esbuild-live-reload.js"></script>' : ''}
       			</body>
       		</html>
       \``,
       {
		   minifyOptions: {
			   removeComments: false,
		   }
	   }
    ).code.slice(5, -1)
};

const getLicensesTemplate = (dependency) => {
	let repositoryUrlValue = dependency?.packageJson?.repository?.url || '';
	
	if (repositoryUrlValue) {
		repositoryUrlValue = repositoryUrlValue.slice(repositoryUrlValue.indexOf('http'));
	}
	
	return `\nName: ${dependency?.packageJson?.name || '-'}\nVersion: :${dependency?.packageJson?.version || '-'}\nLicense: ${dependency?.packageJson?.license || '-'}\nDescription: ${dependency?.packageJson?.description || '-'}\nRepository: ${repositoryUrlValue}\nHomepage: ${dependency?.packageJson?.homepage || '-'}\nLicense Copyright:\n===\n\n${dependency?.licenseText || '-'}\n\n---`;
}

const removeSpaces = {
  name: 'Remove spaces in js bundle',
  setup(build) {
	  /* Колбэк работает после каждого билда, поэтому
	  плагин работает только при сборке проекта на этапе production. */
	  build.onEnd((result) => {
		/* В outputs содержится массив объектов с данными о генерируемых файлах */
		const outputs = result?.metafile?.outputs;
		const strToSearch = 'bundle';
		/* Находим в массиве outputs название сгенерированного js бандла,
		зная, что в названии содержится строка 'bundle' */
		const bundlePath = Object.keys(outputs).filter(key => key.includes(strToSearch))[0];
		
		/* Считываем из сгенерированного js бандла весь код в кодировке utf8  */
		fs.readFile(bundlePath, 'utf8', (err, data) => {
			if (err) throw err;
			/* Обрезаем пробелы по краям строки  */
			const strToWrite = data.trim();
			
			/* Перезаписываем js бандл без пробелов */
			fs.writeFile(bundlePath, strToWrite, (err) => {
				if (err) throw err;
			})
		})
    })
  },
}

const addPreloadToCss = (isDev, devOutdir, buildOurdir) => ({
  name: 'Add preload to css bundle',
  setup(build) {
	  /* Функция onEnd работает после каждого билда, поэтому
	  плагин работает только при сборке проекта на этапе production. */
	  build.onEnd((result) => {
		/* В outputs содержится массив объектов с данными о генерируемых файлах */
		const outputs = result?.metafile?.outputs;
		const strToSearch = 'bundle';
		/* Находим в массиве outputs название сгенерированного js бандла,
		зная, что в названии содержится строка 'bundle' */
		const bundlePath = Object.keys(outputs).filter(key => key.includes(strToSearch))[1];
		const bundleName = bundlePath.slice(bundlePath.indexOf(strToSearch));
		const cssPreloadLinkTag = `<link rel="preload" href="/${bundleName}" as="style" />`;
		const indexFilePath = `${isDev ? devOutdir : buildOurdir}/index.html`;
		
		
		/* Считываем из html файла весь код в кодировке utf8 */
		fs.readFile(indexFilePath, 'utf8', (err, data) => {
			if (err) throw err;
			/* Заменяем заранее подготовленную строку на link preload */
			const htmlToWrite = data.replace('<!-- css preload placeholder -->', cssPreloadLinkTag);
			
			/* Записываем изменения в файл */
			fs.writeFile(indexFilePath, htmlToWrite, (err) => {
				if (err) throw err;
			})
		})
    })
  },
});