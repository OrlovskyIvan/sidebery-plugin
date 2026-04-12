import React, { memo, useState, useRef, useEffect } from 'react';
import styled from 'styled-components'
import TabsBlock from './blocks/TabsBlock'
import './assets/css/normalize.css'
import tabsJSON from './assets/snapshot_pretty.json'
import GlobalStyle from "./components/GlobalStyles";

const Wrap = styled.div`
	position: relative;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	flex-wrap: wrap;
	align-items: flex-start;
	width: 100%;
	background-color: #A0A0A0;
`

const FoldersSection = styled.div`
	display: flex;
	overflow: scroll;
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
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	flex-wrap: wrap;
	flex-grow: 0;
	flex-basis: 0%;
`

const Folder = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	min-width: 300px;
	min-height: 100px;
	background-color: #e3e3e3;
	border: 1px solid #000;
	margin-left: ${props => props.$marginLeft ? props.$marginLeft : 0};
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
	height:100%
`


const App = () => {
	const [activeTab, setActiveTab] = useState(1);
	const refs = useRef([]);
	const { containers, id, sidebar : { panels, nav }, tabs } = tabsJSON;
	const panelsObjKeys = Object.keys(panels);
	const currentTabLinks = tabs[0][activeTab];
	let curLvl = 0;
	let deepArr = [];
	// реальный уровень вкладки в иерархии sidebery
	let curFolderLvlInData = [];
	let folderName = '';
	// папка, которая заполняется в данный момент
	const linksObj = {};
	let curFolder = linksObj;
	let parentFolder = null;
	linksObj.linksArr = [];
	

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

			
			/*
			curFolder.childs = Object.keys(curFolder).filter(item => item !== 'linksArr' && item !== 'deep').length

			let tempObjForSearch = linksObj;
			
			console.log('+++');
			for (let j = deepArr.length - 1; j >= deepFolderIndex; j++) {
				console.log('-');
				console.log(`going through linksObj, ${j} lvl:`, deepArr[j]);
				console.log('current tempObjForSearch', tempObjForSearch)
				tempObjForSearch = tempObjForSearch[deepArr[j]];
			}
			console.log('+++');

			// в переменную текущей папки кладем объект на уровень ниже
			curFolder = tempObjForSearch;
			*/
			
			
			// удаляем из массива глубины название папки текущего уровня
			console.log('deepArr.slice(0, deepFolderIndex + 1)', deepArr.slice(0, deepFolderIndex + 1))
			deepArr = deepArr.slice(0, deepFolderIndex + 1);
			console.log('deepArr after slice: ', deepArr);
			// 

			
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
		}

		// если это нулевой уровень
		if (isFolder && lvl === 0) {
			folderName = `lvl-${0}-${title}`;
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
		}
		
		console.log('folderName after 1 if', folderName)
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
			folderName = `lvl-${curLvl}-${title}`;
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
		}
		
		console.log('folderName after 2 if', folderName)

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
		console.log()
		const r1 = refs.current[1].getBoundingClientRect()
		const r2 = refs.current[2].getBoundingClientRect()

		const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

		line.setAttribute("x1", r1.left + r1.width / 2)
		line.setAttribute("y1", r1.bottom)

		line.setAttribute("x2", r2.left + r2.width / 2)
		line.setAttribute("y2", r2.top)

		line.setAttribute("stroke", "black")

		refs.current[0].appendChild(line)
	}, [])
	

	let tabsJSX = null;
	let curLvlJsx = null;

	Object.keys(linksObj).map((key) => {
		if (key !== 'linksArr' && key !== 'deep') {
			//curLvlJsx = 
		}
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
			<FoldersSection>
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
			</FoldersSection>
			<LinesSVG ref={el => refs.current[0] = el} />
			<GlobalStyle />
		</Wrap>
	)
}

export default memo(App)

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