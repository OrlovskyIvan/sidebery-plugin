import React, { memo, useState, useRef, useEffect } from 'react';
import styled from 'styled-components'
import TabsBlock from './blocks/TabsBlock'
import './assets/css/normalize.css'
import tabsJSON from './assets/snapshot_pretty.json'
import GlobalStyle from "./components/GlobalStyles";

const Wrap = styled.div`
	position: relative;
	flex-direction: row;
	justify-content: flex-start;
	flex-wrap: wrap;
	align-items: flex-start;
	width: 100%;
	background-color: #A0A0A0;
`

const FoldersSection = styled.div`
	position: relative;
	overflow: scroll;
	z-index: 2;
	height: 800px;
	width: 100000px;
`

const LinksWrap = styled.div`
	display: flex;
	justify-content: fex-start;
	align-items: flex-start;
`

const ContainerWrap = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
`

const ContainerHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
`

const ContainerTitle = styled.h2`
	color: ${props => props.$color};
`

const Title = styled.h1`
	color: green;
`

const TreeWrap = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: flex-start;
`

const FoldersWrap = styled.div`
	width: 100%;
	overflow: scroll;
`

const Folder = styled.div`
	position: absolute;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	width: ${props => props.$width ? props.$width : 200}px;
	height: ${props => props.$height ? props.$height : 30}px;;
	background-color: #e3e3e3;
	border: 1px solid #000;
	left: ${props => props.$left ? props.$left : 0}px;
	top: ${props => props.$top ? props.$top : 0}px;
`

const LevelFolderWrap = styled.div`
	display: flex;
`

const LinesSVG = styled.svg`
	display: flex;
	position:absolute;
	top:0;
	left:0;
	width:100%;
	height:100%;
	z-index: 1;
`


const App = () => {
	const [activeTab, setActiveTab] = useState(1);
	const refs = useRef({});
	const { containers, id, sidebar : { panels, nav }, tabs } = tabsJSON;
	const panelsObjKeys = Object.keys(panels);
	const currentTabLinks = tabs[0][activeTab];
	let templateJSX = [];
	const folderWitdth = 200;
	const folderHeight = 30;
	const folderMargin = 50;
	const lvlMargin = 100;
	

	let deepArr = [];
	// реальный уровень вкладки в иерархии sidebery
	let curFolderLvlInData = [];
	let elsOnLvl = [];
	// фактический уровень после сортировки
	let curLvl = 0;
	let prevFolderName = '';
	// папка, которая заполняется в данный момент
	const linksObj = {};
	let curFolder = linksObj;
	let parentFolder = null;
	linksObj.linksArr = [];
	// объект, куда кладем по ключу JSX компонент и ссылку на родителя,
	// чтобы позже делать перерасчет отступа на основе deeperChildsLength
	// и отрисовать связи в SVG
	linksObj.JSXAndChildToParentObj = {};
	

	//console.log('tabs[0]', tabs[0])
	console.log('currentTabLinks', currentTabLinks)
	console.log('curFolder before for', curFolder)

	/*
	1) Когда открывается папка, уровень повышается 2 раза:
	то есть, 1 уровень открытия папки + 1 уровеь для ссылок в папке
	2) В Sidebery, папки могут быть дочерними не только у папок,
	но и у ссылок, здесь этот функционал обходится, уровень
	повышается только, если это папка.
	prevLvl - хранит значение уровня до открытия папки, чтобы
	вернуться к заполнению уровня, который был до открытия
	новой папки
	*/

	for (let i = 0; i < currentTabLinks.length; i++) {
		let { title, url, lvl } = currentTabLinks[i];
				
		const isFolder = url[0] === 'm';
				
		console.log('i -------------------------------------------------------', i);
		//console.log('folderName', folderName)
		//console.log('linksObj', linksObj)
		//console.log('curFolder', curFolder)
		//console.log('-')
		console.log('curLvl', curLvl)
		//console.log('prevLvl', prevLvl)
		console.log('url', url)
		console.log('title', title)
		console.log('lvl', lvl)
		console.log('deepArr', deepArr)
		//console.log('curFolderLvlInData', curFolderLvlInData)
		//console.log('lvl after = curLvl ', lvl)
		console.log('---');
		if (!curFolder.i) {
			curFolder.i = i;
		}
		
		for	(let k = 0; k < 10; k++) {
			console.log(`curFolderLvlInData[${k}]:`, curFolderLvlInData[k]);
		}
		console.log('---');
		console.log('linksObj', linksObj)
		

		if (lvl === undefined) {
			lvl = 0;
		}

		

		// если это папка
		//if (isFolder) {
			//let folderName = `lvl-${lvl}-${title}`;
			//console.log('folderName', folderName)
			
		if (isFolder && title === 'Home group') {
			continue;
		}


		// если это нулевой уровень, но не папка, то кладем вкладку
		// прямо в linksObj.linksArr и пропускаем проход
		if (lvl === 0 && !isFolder) {
			linksObj.linksArr.push({ title, url });
			continue;
		}

		// если уровень текущей вкладки меньше либо равен уровню
		// предыдущей папки, то это закрытие папки
		console.log('curFolderLvlInData[curFolderLvlInData.length - 1]', curFolderLvlInData[curFolderLvlInData.length - 1])
		//if (curLvl !== 0 && lvl <= curFolderLvlInData[curFolderLvlInData.length - 1].lvl) {
		if (lvl <= curFolderLvlInData[curFolderLvlInData.length - 1]?.lvl) {
			// ищем в массиве реальных уровней вкладок пару папок,
			// между которыми находится уровень текущей вкладки
			// и получаем индекс папки меньшего уровня из пары,
			// потому что новая ссылка должна лежать в ней
			let deepFolderIndex = 0;

			for (let j = 0; j < curFolderLvlInData.length; j++) {
				const firstFolder = curFolderLvlInData[j];
				const secondFolder = curFolderLvlInData[j + 1] ? curFolderLvlInData[j + 1] : null;

				if (secondFolder) {
					if (lvl - 1 >= firstFolder.lvl && lvl <= secondFolder.lvl) {
						//if (lvl !== secondFolder.lvl) {
							deepFolderIndex = j;
						//} else {
						//	deepFolderIndex = j + 1;
						//}
					}
				} else {
					break;
				}
			}

			console.log('deepFolderIndex', deepFolderIndex)

			console.log('curFolderLvlInData.slice(0, deepFolderIndex + 1)', curFolderLvlInData.slice(0, deepFolderIndex + 1))
			curFolderLvlInData = curFolderLvlInData.slice(0, deepFolderIndex + 1);
			curLvl = deepFolderIndex;
			//curFolder.deep = [...deepArr];

			
			
			

			//let tempObjForSearch = linksObj;
			
			console.log('+++');
			for (let j = deepArr.length - 1; j > deepFolderIndex; j--) {
				console.log('-');
				console.log(`going through linksObj, ${j} lvl:`, deepArr[j]);

				let children = Object
					.keys(curFolder)
					.filter(
						item => item !== 'linksArr'
						&& item !== 'deep'
						&& item !== 'parent'
						&& item !== 'i'
						&& item !== 'children'
						&& item !== 'deeperChildsLength'
					).length;
				
				console.log('children: ', children);

				curFolder.children = children;

				if (curFolder.deeperChildrenLength !== undefined) {
					if (curFolder.parent.deeperChildrenLength === undefined) {
						curFolder.parent.deeperChildrenLength = 0;
					}

					curFolder.parent.deeperChildrenLength += curFolder.deeperChildrenLength;
				} else if (curFolder.children !== 0) {
					if (curFolder.parent.deeperChildrenLength === undefined) {
						curFolder.parent.deeperChildrenLength = 0;
					}

					curFolder.parent.deeperChildrenLength += curFolder.children;
				}

				console.log('curFolder.parent.deeperChildrenLength after = : ', curFolder.parent.deeperChildrenLength)
				//console.log('current tempObjForSearch', tempObjForSearch)
				//tempObjForSearch = tempObjForSearch[deepArr[j]];

				//curFolder.parentFolderName = deepArr[deepArr.length - 2];

				linksObj.JSXAndChildToParentObj[deepArr[j]].parentFolderName = deepArr[j - 1];

				curFolder = curFolder.parent;
				console.log('curFolder after one step down: ', curFolder)

				
			}
			console.log('+++');

			// в переменную текущей папки кладем объект на уровень ниже
			//curFolder = tempObjForSearch;
			
			
			
			// удаляем из массива глубины название папки текущего уровня
			console.log('deepArr.slice(0, deepFolderIndex + 1)', deepArr.slice(0, deepFolderIndex + 1))
			deepArr = deepArr.slice(0, deepFolderIndex + 1);
			console.log('deepArr after slice: ', deepArr);
			// 

			/*
			let tempObjForSearch = linksObj;
			
			console.log('+++');
			for (let j = 0; j < deepArr.length; j++) {
				console.log('-');
				console.log(`going through linksObj, ${j} lvl:`, deepArr[j]);
				console.log('current tempObjForSearch', tempObjForSearch)
				tempObjForSearch = tempObjForSearch[deepArr[j]];
			}
			console.log('+++');

			// в переменную текущей папки кладем объект на уровень ниже
			curFolder = tempObjForSearch;
			*/
		}

		// если это нулевой уровень
		if (isFolder && lvl === 0) {
			const folderName = `lvl-${0}-${title}`;

			prevFolderName = folderName;

			curLvl = 0;
			// кладем в массив глубины название папки нулевого уровня
			deepArr[0] = folderName;
			// создаем объект для папки нулевого уровня
			linksObj[folderName] = {};
			// в переменную родительской папки кладем коренной объект
			parentFolder = linksObj;
			// в текущий объект для заполнения кладем ссылку на папку с названием нулевого уровня
			curFolder = linksObj[folderName];
			// в текущий объект кладем ссылку на родительский объект
			curFolder.parent = parentFolder;
			//console.log('curFolder in the first if', curFolder);
			// создаем массив для ссылок
			curFolder.linksArr = [];

			curFolder.deep = [...deepArr];

			

			// === ПРИСВОЕНИЕ ОТСТУПА ПАПКЕ В CSS ===

			// в объект для JSX создаем объект с уникальным ключем
			// и в нем сохраняем ссылку на родителя
			linksObj.JSXAndChildToParentObj[folderName] = { parent: parentFolder }

			// берем уровень папки из массива глубины
			let curFolderLvl = deepArr.length - 1;
			// кол-во элементов на уровне и ниже создаваемой папки
			let maxElsOnLvlAndBelow = 0;
			
			// если еще нет элементов на уровне, записываем 0, чтобы увеличивать число элементов
			if (elsOnLvl[curFolderLvl] === undefined) {
				elsOnLvl[curFolderLvl] = 0;

				// !!! закрыть кейс 7
				// eсли есть предыдущий уровень и элементы на нем
				// кладем их в текущий уровень
				let prevFolderLvl = deepArr.length - 2;
				let prevFolderLvlEls = elsOnLvl[prevFolderLvl];
				console.log('previous lvl: ', prevFolderLvl);
				console.log('previous lvl elements: ', prevFolderLvlEls);

				if (prevFolderLvlEls) {
					elsOnLvl[curFolderLvl] = prevFolderLvlEls - 1;
				}

			}

			

			// идем по массиву кол-ва элементов на этом уровне и ниже
			// и находим максимальное кол-во, чтобы расчитать отступ
			for (let i = curFolderLvl; i < elsOnLvl.length; i++) {
				let elsOnLvlAmount = elsOnLvl[i];
				console.log('search of max elements on lvl and below, lvl: ', i, 'elements: ', elsOnLvlAmount);

				if (elsOnLvlAmount > maxElsOnLvlAndBelow) {
					maxElsOnLvlAndBelow = elsOnLvlAmount;
				}
			}
			
			console.log('max elements on lvl and below: ', maxElsOnLvlAndBelow);
			
			// в массив кол-ва элементов на уровне, на уровень где сейчас
			// заполняется папка увеличиваем кол-во элементов на 1
			elsOnLvl[curFolderLvl] += 1;
			

			curFolder.left = (folderWitdth + folderMargin) * maxElsOnLvlAndBelow;
			curFolder.top = (folderHeight + lvlMargin) * curLvl;

			// в объект для JSX кладем JSX компонент
			linksObj.JSXAndChildToParentObj[folderName].JSX = (
				<Folder
					key={`${i}-${title}`}
					$width={folderWitdth}
					$height={folderHeight}
					$left={curFolder.left}
					$top={curFolder.top}
					ref={
						el => {
							if (el) refs.current[folderName] = el
							else return;
						}
					}
				>
					{title}	
				</Folder>
			)
		}
		
		//console.log('folderName after 1 if', folderName)
		/*
		// если это не нулевой уровень
		if (lvl) {
			folderName = `lvl-${lvl}-${title}`;
			curLvl = lvl;
			// кладем в массив глубины название папки текущего уровня
			deepArr.push(folderName);
			// создаем объект для папки текущего уровня
			curFolder[folderName] = {};
			// и массив для ссылок
			curFolder[folderName].linksArr = [];
		}
		*/

		
		// если это уровень глубже, то есть папка открывается
		if (isFolder && lvl !== 0) {
			curLvl += 1; // <--
			const folderName = `lvl-${curLvl}-${title}`;
			console.log('curLvl += 1', curLvl)
			// кладем в массив глубины название папки текущего уровня
			deepArr.push(folderName);
			// создаем объект для папки текущего уровня
			curFolder[folderName] = {};
			// в переменную родительской папки кладем папку, в которой находимся
			parentFolder = curFolder;
			// в текущий объект для заполнения кладем ссылку на папку с названием уровня глубже
			curFolder = curFolder[folderName];
			// в текущий объект кладем ссылку на родительский объект
			curFolder.parent = parentFolder;
			// и массив для ссылок
			curFolder.linksArr = [];

			curFolder.deep = [...deepArr];



			// === ПРИСВОЕНИЕ ОТСТУПА ПАПКЕ В CSS ===
			
			// в объект для JSX создаем объект с уникальным ключем
			// и в нем сохраняем ссылку на родителя
			linksObj.JSXAndChildToParentObj[folderName] = { parent: parentFolder }

			// берем уровень папки из массива глубины
			let curFolderLvl = deepArr.length - 1;
			// кол-во элементов на уровне и ниже создаваемой папки
			let maxElsOnLvlAndBelow = 0;
			
			// если еще нет элементов на уровне, записываем 0, чтобы увеличивать число элементов
			if (elsOnLvl[curFolderLvl] === undefined) {
				elsOnLvl[curFolderLvl] = 0;

				// !!! закрыть кейс 7
				// eсли есть предыдущий уровень и элементы на нем
				// кладем их в текущий уровень
				let prevFolderLvl = deepArr.length - 2;
				let prevFolderLvlEls = elsOnLvl[prevFolderLvl];
				console.log('previous lvl: ', prevFolderLvl);
				console.log('previous lvl elements: ', prevFolderLvlEls);

				if (prevFolderLvlEls) {
					elsOnLvl[curFolderLvl] = prevFolderLvlEls - 1;
				}
			}

			

			// идем по массиву кол-ва элементов на этом уровне и ниже
			// и находим максимальное кол-во, чтобы расчитать отступ
			for (let i = curFolderLvl; i < elsOnLvl.length; i++) {
				let elsOnLvlAmount = elsOnLvl[i];
				console.log('search of max elements on lvl and below, lvl: ', i, 'elements: ', elsOnLvlAmount);

				if (elsOnLvlAmount > maxElsOnLvlAndBelow) {
					maxElsOnLvlAndBelow = elsOnLvlAmount;
				}
			}
			
			console.log('max elements on lvl and below: ', maxElsOnLvlAndBelow);
			
			// в массив кол-ва элементов на уровне, на уровень где сейчас
			// заполняется папка увеличиваем кол-во элементов на 1
			elsOnLvl[curFolderLvl] += 1;
			

			curFolder.left = (folderWitdth + folderMargin) * maxElsOnLvlAndBelow;
			curFolder.top = (folderHeight + lvlMargin) * curLvl;

			// в объект для JSX кладем JSX компонент
			linksObj.JSXAndChildToParentObj[folderName].JSX = (
				<Folder
					key={`${i}-${title}`}
					$width={folderWitdth}
					$height={folderHeight}
					$left={curFolder.left}
					$top={curFolder.top}
					ref={
						el => {
							//const refFolderName = folderName;
							//console.log('set ref:', folderName);
							if (el) refs.current[folderName] = el
							else return;
						}
					}
				>
					{title}	
				</Folder>
			)
		}
		
		//console.log('folderName after 2 if', folderName)

		// если это уровень ниже, то есть папка закрывается
		// null + 1 === 1
		

		/*
		// если это уровень ниже, то есть папка закрывается
		if (lvl < curLvl) {
			curLvl = lvl;
			// удаляем из массива глубины название папки текущего уровня
			deepArr.pop();
			// в переменную текущей папки кладем объект на уровень ниже
			curFolder = deepArr[deepArr.length - 1];
		}
		*/

		

		//linksObj[folderName] = {};
		//linksObj[folderName].linksArr = [];

			
		//}
		

		if (isFolder) {
				curFolderLvlInData.push({ title, lvl });
		}
		console.log('curFolder.linksArr after if', curFolder.linksArr);

		if (!isFolder) {
			curFolder.linksArr.push({ title, url });	
		}
	}

	console.log('linksObj after sorting', linksObj);
	/*
	Не обработан кейс, когда открывается 2-я папка на нулевом уровне.
	*/
	/*
	const currentTabsLinksJSX = currentTabLinks.map((link) => {
		const { title, url, lvl } = link;
		if (url[0] === 'm') {

			console.log(url)
		}

		return (
			<>
				{url[0] === 'm' ? <TreeWrap> : null}
			</>
		)
			
	})
	*/

	/*
	<div>
				<a href={url}>{title}</a>
			</li>
	*/


	/*
	const linksJSX = panelsObjKeys.map((link, i) => {
		const { title, url } = tabs[0][link];
		return (
			<li>

			</li>
		)	
	})
	*/

	/*
	const containersJSX = panelsObjKeys.map((key) => {
		const { name, color } = panels[key];
		tabsObj[key] = {};
		tabsObj[key].name = name;
		tabsObj[key].color = color;

		return (
			<ContainerWrap key={name} >
				<ContainerHeader>
					<ContainerTitle $color={color} >{name}</ContainerTitle>
				</ContainerHeader>
				
			</ContainerWrap>
		)
	})
	*/
	

	/*
	const containersJSX = containers.map((container, i) => {
		const { name, color } = container;
		return (
			<ContainerWrap>
				<ContainerHeader>

				</ContainerHeader>
				
			</ContainerWrap>
		)
	})
	*/
	//console.log('containers:', containers);
	//console.log('id:', id);
	//console.log(sidebar);
	console.log('panels:', panels);
	console.log(Object.keys(panels));
	console.log('tabs', tabs);
	console.log('nav', nav);
	console.log('activeTab', activeTab);
	
	
	useEffect(() => {
		//const a = document.getElementById('a')
		//const b = document.getElementById('b')
		//const svg = document.getElementById('svg')
		let dataObjOfCurrentFolder = null;
		let objToConnetWithParent = null;
		let parentToConnect = null;

		Object.keys(refs.current).forEach((key) => {
			if (key === 'svgEl') return;

			console.log(key)
			dataObjOfCurrentFolder = linksObj.JSXAndChildToParentObj[key];
			objToConnetWithParent = refs.current[key];
			parentToConnect = refs.current[dataObjOfCurrentFolder.parentFolderName];

			console.log('dataObjOfCurrentFolder', dataObjOfCurrentFolder)
			console.log('objToConnetWithParent', objToConnetWithParent)
			console.log('parentToConnect', parentToConnect)

			if (parentToConnect) {
			//if ('lvl-1-Money' === key
				//|| key === 'lvl-2-Statistics'
				//|| key === 'lvl-2-Comprasion'
				//|| key === 'lvl-1-l-pvp'
			//) {
				

				const r1 = parentToConnect.getBoundingClientRect()
				const r2 = objToConnetWithParent.getBoundingClientRect()
				
				console.log('r1', r1)
				console.log('r2', r2)
				console.log('offsetLeft', parentToConnect.offsetLeft)
				console.log('offsetTop', parentToConnect.offsetTop)

				const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

				line.setAttribute("x1", parentToConnect.offsetLeft + r1.width / 2)
				line.setAttribute("y1", parentToConnect.offsetTop + folderHeight)

				line.setAttribute("x2", objToConnetWithParent.offsetLeft + r2.width / 2)
				line.setAttribute("y2", objToConnetWithParent.offsetTop)

				//line.setAttribute("x1", r1.left + r1.width / 2)
				//line.setAttribute("y1", r1.bottom)

				//line.setAttribute("x2", r2.left + r2.width / 2)
				//line.setAttribute("y2", r2.top)

				line.setAttribute("stroke", "black")

				refs.current.svgEl.appendChild(line)
			}
			
			
		})
		/*
		const r1 = refs.current[1].getBoundingClientRect()
		const r2 = refs.current[2].getBoundingClientRect()

		const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

		line.setAttribute("x1", r1.left + r1.width / 2)
		line.setAttribute("y1", r1.bottom)

		line.setAttribute("x2", r2.left + r2.width / 2)
		line.setAttribute("y2", r2.top)

		line.setAttribute("stroke", "black")

		refs.current[0].appendChild(line)
		*/
		}, [])
	

	let tabsJSX = null;
	let curLvlJsx = null;

	templateJSX = Object.keys(linksObj.JSXAndChildToParentObj).map((key) => { 
		return linksObj.JSXAndChildToParentObj[key].JSX;
	})

	

	return (
		<Wrap>
			<TabsBlock
				panels={panels}
				activeTab={activeTab}
				nav={nav}
				tabsKeys={panelsObjKeys}
				setActiveTabHook={setActiveTab}
			/>
			<FoldersWrap>
				<FoldersSection>
					{templateJSX}
					<LinesSVG ref={el => refs.current['svgEl'] = el} />
				</FoldersSection>
			</FoldersWrap>
			<GlobalStyle />
		</Wrap>
	)
}

export default memo(App)

/*
<FoldersWrap>
					<LevelFolderWrap>
						<Folder ref={el => refs.current[1] = el}>
							Level 1
						</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 2</Folder>
						<Folder
							ref={el => refs.current[2] = el}
							$marginLeft={'300px'}
						>
							Level 2
						</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 3</Folder>
						<Folder>Level 3</Folder>
					</LevelFolderWrap>
				</FoldersWrap>
				<FoldersWrap>
					<LevelFolderWrap>
						<Folder>Level 1</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 2</Folder>
						<Folder $marginLeft={'300px'}>Level 2</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 3</Folder>
						<Folder>Level 3</Folder>
					</LevelFolderWrap>
				</FoldersWrap>
*/


/*
<FoldersWrap>
				<LevelFolderWrap>
					<Folder>Level 1</Folder>
				</LevelFolderWrap>
				<FoldersWrap>
					<LevelFolderWrap>
						<Folder>Level 2</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 3</Folder>
						<Folder>Level 3</Folder>
					</LevelFolderWrap>
				</FoldersWrap>
				<LevelFolderWrap>
					<Folder>Level 2</Folder>
				</LevelFolderWrap>
				<FoldersWrap>
					<LevelFolderWrap>
						<Folder>Level 2</Folder>
					</LevelFolderWrap>
					<LevelFolderWrap>
						<Folder>Level 3</Folder>
						<Folder>Level 3</Folder>
					</LevelFolderWrap>
				</FoldersWrap>
			</FoldersWrap>
*/

/*
let tabsObj = {};
	let curLvl = 0;
	let curLvlFolderFill = null;
	let prevLvl = null;
	let curTitle = '';
	let isLvlUp = false;
	let isLvlDown = false;
	let deepArr = [];
	// реальный уровень вкладки в иерархии sidebery
	let curFolderLvlInData = [];
	let folderName = '';
	// папка, которая заполняется в данный момент
	const linksObj = {};
	let curFolder = linksObj;
	linksObj.linksArr = [];
	

	//console.log('tabs[0]', tabs[0])
	console.log('currentTabLinks', currentTabLinks)
	console.log('curFolder before for', curFolder)

	

	for (let i = 0; i < currentTabLinks.length; i++) {
		let { title, url, lvl } = currentTabLinks[i];
		const isFolder = url[0] === 'm';
		
		// если это не нулевой уровень и уровень больше уровня папки,
		// то прировнять уровень ссылки к уровню папки
		
		
		console.log('i -----------', i);
		//console.log('folderName', folderName)
		//console.log('linksObj', linksObj)
		//console.log('curFolder', curFolder)
		//console.log('-')
		console.log('curLvl', curLvl)
		//console.log('prevLvl', prevLvl)
		console.log('url', url)
		console.log('title', title)
		console.log('lvl', lvl)
		console.log('deepArr', deepArr)
		//console.log('curFolderLvlInData', curFolderLvlInData)
		//console.log('lvl after = curLvl ', lvl)
		console.log('---');
		for	(let k = 0; k < 10; k++) {
			console.log(`curFolderLvlInData[${k}]:`, curFolderLvlInData[k]);
		}
		console.log('---');
		console.log('linksObj', linksObj)
		

		

		// если это папка
		//if (isFolder) {
			//let folderName = `lvl-${lvl}-${title}`;
			//console.log('folderName', folderName)
			
			if (isFolder && title === 'Home group') {
				continue;
			}

			// если уровень текущей вкладки меньше либо равен уровню
			// предыдущей папки, то это закрытие папки
			console.log('curFolderLvlInData[curFolderLvlInData.length - 1]', curFolderLvlInData[curFolderLvlInData.length - 1])
			if (curLvl !== 0 && lvl <= curFolderLvlInData[curFolderLvlInData.length - 1].lvl) {
				// ищем в массиве реальных уровней вкладок пару папок,
				// между которыми находится уровень текущей вкладки
				// и получаем индекс папки меньшего уровня из пары,
				// потому что новая ссылка должна лежать в ней
				let deepFolderIndex = null;

				for (let j = 0; j < curFolderLvlInData.length; j++) {
					const firstFolder = curFolderLvlInData[j];
					const secondFolder = curFolderLvlInData[j + 1] ? curFolderLvlInData[j + 1] : null;

					if (secondFolder) {
						if (lvl - 1 >= firstFolder.lvl && lvl <= secondFolder.lvl) {
							//if (lvl !== secondFolder.lvl) {
								deepFolderIndex = j;
							//} else {
							//	deepFolderIndex = j + 1;
							//}
						}
					} else {
						break;
					}
					//if (lvl >= firstFolder.lvl && lvl <= secondFolder.lvl) {
						
					//}
				}

				console.log('deepFolderIndex', deepFolderIndex)

				console.log('curFolderLvlInData.slice(0, deepFolderIndex + 1)', curFolderLvlInData.slice(0, deepFolderIndex + 1))
				curFolderLvlInData = curFolderLvlInData.slice(0, deepFolderIndex + 1);
				//curFolderLvlInData.pop();
				//lvl = lvl - 1;
				//curLvl -= 1;
				//curLvl = lvl;
				curLvl = deepFolderIndex; // <==
				//prevLvl -= 1;
				//curLvlFolderFill = lvl;
				curFolder.deep = [...deepArr];
				// удаляем из массива глубины название папки текущего уровня
				
				//deepArr.pop();
				console.log('deepArr.slice(0, deepFolderIndex + 1)', deepArr.slice(0, deepFolderIndex + 1))
				deepArr = deepArr.slice(0, deepFolderIndex + 1);
				
				let tempObjForSearch = linksObj;

				for (let j = 0; j < deepArr.length; j++) {
					tempObjForSearch = tempObjForSearch[deepArr[j]];
				}

				// в переменную текущей папки кладем объект на уровень ниже
				curFolder = tempObjForSearch;
			}

			// если это нулевой уровень
			if (isFolder && lvl === undefined) {
				folderName = `lvl-${0}-${title}`;
				curLvl = 0;
				//curLvlFolderFill = 1;
				// кладем в массив глубины название папки нулевого уровня
				deepArr[0] = folderName;
				// создаем объект для папки нулевого уровня
				linksObj[folderName] = {};
				// в текущий объект для заполнения кладем ссылку на папку с названием нулевого уровня
				curFolder = linksObj[folderName];
				//console.log('curFolder in the first if', curFolder);
				// создаем массив для ссылок
				curFolder.linksArr = [];
			}
			
			console.log('folderName after 1 if', folderName)
			

			
			// если это уровень глубже, то есть папка открывается
			if (isFolder && lvl !== undefined) {
				//prevLvl = curLvl;
				curLvl += 1; // <--
				folderName = `lvl-${curLvl}-${title}`;
				console.log('curLvl += 1', curLvl)
				//curLvlFolderFill = lvl + 1;
				// кладем в массив глубины название папки текущего уровня
				deepArr.push(folderName);
				// создаем объект для папки текущего уровня
				curFolder[folderName] = {};
				// в текущий объект для заполнения кладем ссылку на папку с названием уровня глубже
				curFolder = curFolder[folderName];
				// и массив для ссылок
				curFolder.linksArr = [];
			}
			
			console.log('folderName after 2 if', folderName)

			// если это уровень ниже, то есть папка закрывается
			// null + 1 === 1
			

			

			

			//linksObj[folderName] = {};
			//linksObj[folderName].linksArr = [];

			
		//}
		

		if (isFolder) {
				curFolderLvlInData.push({ title, lvl: lvl === undefined ? 0 : lvl });
		}
		console.log('curFolder.linksArr after if', curFolder.linksArr);

		if (!isFolder) {
			curFolder.linksArr.push({ title, url });	
		}
	}
*/