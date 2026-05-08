import React, { memo, useState, useRef, useEffect } from 'react';
import styled from 'styled-components'
import TabsBlock from './blocks/TabsBlock'
import './assets/css/normalize.css'
//import tabsJSON from './assets/snapshot_pretty.json'
import GlobalStyle from "./components/GlobalStyles";
import Folder from './blocks/Folder';
import FileUpload from './blocks/FileUpload';

const Wrap = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	flex-wrap: nowrap;
	align-items: stretch;
	width: 100%;
	height: 100%;
	background-color: #A0A0A0;
`

const FoldersSection = styled.div`
	position: relative;
	min-height: 100%;
	min-width: 100%;
	width: ${props => props.$width ? props.$width : 0}px;
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
	height: 100%;
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

const GroupSVG = styled.g``

const RectSVG = styled.rect``

const lerpColor = (c1, c2, t) => {
	const a = parseInt(c1.slice(1), 16)
	const b = parseInt(c2.slice(1), 16)

	const r1 = (a >> 16) & 255
	const g1 = (a >> 8) & 255
	const b1 = a & 255

	const r2 = (b >> 16) & 255
	const g2 = (b >> 8) & 255
	const b2 = b & 255

	const r = Math.round(r1 + (r2 - r1) * t)
	const g = Math.round(g1 + (g2 - g1) * t)
	const b_ = Math.round(b1 + (b2 - b1) * t)

	return `rgb(${r}, ${g}, ${b_})`
}
// localStorage.setItem('json', JSON.stringify(data));
//const data = JSON.parse(localStorage.getItem('json'));
const App = () => {
	//console.log('tabsJSON', tabsJSON)
	const localStorageData = JSON.parse(localStorage.getItem("sidebery-json"));
	//console.log(localStorageData?.json)
	const [tabsJSON, setTabsJSON] = useState(localStorageData?.json);
	const [activeTab, setActiveTab] = useState(0);
	const cacheLinksObj = useRef({});
	const folderWitdth = 90;
	const folderHeight = 30;
	const folderMargin = 5;
	const folderBorder = 2;
	const lvlMargin = 60;
	const templateJSXSVGGradient = [];
	const isTabsJSON = Boolean(tabsJSON);
	let templateJSX = [];
	let curTabDataObj = cacheLinksObj.current[activeTab];
	let panels = [];
	let nav = [];
	let panelsObjKeys = [];
	//console.log(localStorage.getItem("sidebery-json"))
	//console.log(JSON.parse(localStorage.getItem("sidebery-json")))
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
	//localStorage.removeItem("sidebery-json");
	if (isTabsJSON) {
		const { sidebar, tabs } = tabsJSON;
		panels = sidebar.panels;
		nav = sidebar.nav;
		//console.log(tabs)
		//console.log(tabs[0])
		
		const currentTabLinks = tabs[0][activeTab];
		const currentTabLinksLength = currentTabLinks.length;
		panelsObjKeys = Object.keys(panels);
		let deepArr = [];
		// реальный уровень вкладки в иерархии sidebery
		let curFolderLvlInData = [];
		let elsOnLvl = [];
		// фактический уровень после сортировки
		let curLvl = 0;
		let prevFolderName = '';
		// папка, которая заполняется в данный момент
		cacheLinksObj.current[activeTab] = {};
		curTabDataObj = cacheLinksObj.current[activeTab];
		let curFolder = curTabDataObj;
		let parentFolder = null;
		curTabDataObj.linksArr = [];
		// объект, куда кладем по ключу JSX компонент и ссылку на родителя,
		// а также имя родительской папки, чтобы позже делать перерасчет
		// отступа на основе deeperChildsLength и отрисовать связи в SVG
		curTabDataObj.JSXAndChildToParentObj = {};
		curTabDataObj.refs = {};
		curTabDataObj.maxLvl = 0;
		curTabDataObj.width = 0;

		for (let i = 0; i < currentTabLinksLength; i++) {



			//console.log('tabs[0]', tabs[0])
			//console.log('currentTabLinks', currentTabLinks)
			//console.log('curFolder before for', curFolder)

			let { title, url, lvl } = currentTabLinks[i];

			const isFolder = url[0] === 'm';

			//console.log('i -------------------------------------------------------', i);
			//console.log('folderName', folderName)
			//console.log('linksObj', linksObj)
			//console.log('curFolder', curFolder)
			//console.log('-')
			//console.log('curLvl', curLvl)
			//console.log('prevLvl', prevLvl)
			//console.log('url', url)
			//console.log('title', title)
			//console.log('lvl', lvl)
			//console.log('deepArr', deepArr)
			//console.log('curFolderLvlInData', curFolderLvlInData)
			//console.log('lvl after = curLvl ', lvl)
			//console.log('---');
			if (!curFolder.i) {
				curFolder.i = i;
			}

			for (let k = 0; k < 10; k++) {
				//console.log(`curFolderLvlInData[${k}]:`, curFolderLvlInData[k]);
			}
			//console.log('---');
			//console.log('curTabDataObj', curTabDataObj)


			if (lvl === undefined) {
				lvl = 0;
			}



			// если это папка

			if (isFolder && title === 'Home group') {
				continue;
			}

			// если это нулевой уровень, но не папка, то кладем вкладку
			// прямо в linksObj.linksArr и пропускаем проход
			if (lvl === 0 && !isFolder) {
				curTabDataObj.linksArr.push({ title, url });
				continue;
			}

			// если уровень текущей вкладки меньше либо равен уровню
			// предыдущей папки, то это закрытие папки
			//console.log('curFolderLvlInData[curFolderLvlInData.length - 1]', curFolderLvlInData[curFolderLvlInData.length - 1])
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

				//console.log('deepFolderIndex', deepFolderIndex)

				//console.log('curFolderLvlInData.slice(0, deepFolderIndex + 1)', curFolderLvlInData.slice(0, deepFolderIndex + 1))
				curFolderLvlInData = curFolderLvlInData.slice(0, deepFolderIndex + 1);
				curLvl = deepFolderIndex;
				
				//console.log('+++');
				for (let j = deepArr.length - 1; j > deepFolderIndex; j--) {
					//console.log('-');
					//console.log(`going through linksObj, ${j} lvl:`, deepArr[j]);

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

					//console.log('children: ', children);

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

					//console.log('curFolder.parent.deeperChildrenLength after = : ', curFolder.parent.deeperChildrenLength)
					
					// в объект JSX и ссылок на родителя кладем имя родительской папки
					curTabDataObj.JSXAndChildToParentObj[deepArr[j]].parentFolderName = deepArr[j - 1];

					curFolder = curFolder.parent;
					//console.log('curFolder after one step down: ', curFolder)


				}
				//console.log('+++');

				// удаляем из массива глубины название папки текущего уровня
				//console.log('deepArr.slice(0, deepFolderIndex + 1)', deepArr.slice(0, deepFolderIndex + 1))
				deepArr = deepArr.slice(0, deepFolderIndex + 1);
				//console.log('deepArr after slice: ', deepArr);
			}

			// если это нулевой уровень
			if (isFolder && lvl === 0) {
				const folderName = `lvl-${0}-№${i}-${title}`;

				prevFolderName = folderName;

				curLvl = 0;
				// кладем в массив глубины название папки нулевого уровня
				deepArr[0] = folderName;
				// создаем объект для папки нулевого уровня
				curTabDataObj[folderName] = {};
				// в переменную родительской папки кладем коренной объект
				parentFolder = curTabDataObj;
				// в текущий объект для заполнения кладем ссылку на папку с названием нулевого уровня
				curFolder = curTabDataObj[folderName];
				// в текущий объект кладем ссылку на родительский объект
				curFolder.parent = parentFolder;
				//console.log('curFolder in the first if', curFolder);
				// создаем массив для ссылок
				curFolder.linksArr = [];

				curFolder.deep = [...deepArr];



				// === ПРИСВОЕНИЕ ОТСТУПА ПАПКЕ В CSS ===

				// в объект для JSX создаем объект с уникальным ключем
				// и в нем сохраняем ссылку на родителя
				curTabDataObj.JSXAndChildToParentObj[folderName] = { parent: parentFolder }

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
					//console.log('previous lvl: ', prevFolderLvl);
					//console.log('previous lvl elements: ', prevFolderLvlEls);

					if (prevFolderLvlEls) {
						elsOnLvl[curFolderLvl] = prevFolderLvlEls - 1;
					}

				}



				// идем по массиву кол-ва элементов на этом уровне и ниже
				// и находим максимальное кол-во, чтобы расчитать отступ
				for (let i = curFolderLvl; i < elsOnLvl.length; i++) {
					let elsOnLvlAmount = elsOnLvl[i];
					//console.log('search of max elements on lvl and below, lvl: ', i, 'elements: ', elsOnLvlAmount);

					if (elsOnLvlAmount > maxElsOnLvlAndBelow) {
						maxElsOnLvlAndBelow = elsOnLvlAmount;
					}
				}

				//console.log('max elements on lvl and below: ', maxElsOnLvlAndBelow);

				// в массив кол-ва элементов на уровне, на уровень где сейчас
				// заполняется папка увеличиваем кол-во элементов на 1
				elsOnLvl[curFolderLvl] += 1;


				curFolder.left = (folderWitdth + folderMargin) * maxElsOnLvlAndBelow;
				curFolder.top = (folderHeight + lvlMargin) * curLvl;

				// в объект для JSX кладем данные для JSX компонента
				curTabDataObj.JSXAndChildToParentObj[folderName].JSXdata = {
					key: `${i}-${title}`,
					folderName,
					url,
					$width: folderWitdth,
					$height: folderHeight,
					$left: curFolder.left,
					$top: curFolder.top,
					$folderBorder: folderBorder,
					$zIndex: currentTabLinksLength + 10 - i,
					linksArr: curFolder.linksArr,
					refFunc: el => {
						if (el) curTabDataObj.refs[folderName] = el
						else return;
					},
					title
				};
			}


			// если это уровень глубже, то есть папка открывается
			if (isFolder && lvl !== 0) {
				curLvl += 1; // <--
				const folderName = `lvl-${curLvl}-№${i}-${title}`;
				//console.log('curLvl += 1', curLvl)
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
				curTabDataObj.JSXAndChildToParentObj[folderName] = { parent: parentFolder }

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
					//console.log('previous lvl: ', prevFolderLvl);
					//console.log('previous lvl elements: ', prevFolderLvlEls);

					if (prevFolderLvlEls) {
						elsOnLvl[curFolderLvl] = prevFolderLvlEls - 1;
					}
				}



				// идем по массиву кол-ва элементов на этом уровне и ниже
				// и находим максимальное кол-во, чтобы расчитать отступ
				for (let i = curFolderLvl; i < elsOnLvl.length; i++) {
					let elsOnLvlAmount = elsOnLvl[i];
					//console.log('search of max elements on lvl and below, lvl: ', i, 'elements: ', elsOnLvlAmount);

					if (elsOnLvlAmount > maxElsOnLvlAndBelow) {
						maxElsOnLvlAndBelow = elsOnLvlAmount;
					}
				}

				//console.log('max elements on lvl and below: ', maxElsOnLvlAndBelow);

				// если на этом уровне элементов меньше чем максимальное
				// значение ниже и на этом уровне, приравниваем кол-во
				// элементов на этом уровне к максимальному значению
				// и увеличиваем на 1, если нет, то просто увеличиваем на 1
				if (elsOnLvl[curFolderLvl] < maxElsOnLvlAndBelow) {
					elsOnLvl[curFolderLvl] = maxElsOnLvlAndBelow;
					elsOnLvl[curFolderLvl] += 1;
				} else {
					elsOnLvl[curFolderLvl] += 1;
				}

				//console.log('els on the lvl before: ', elsOnLvl[curFolderLvl - 1]);
				//console.log('els on the current lvl: ', elsOnLvl[curFolderLvl]);
				// дополнение к кейсу 7
				// если на предыдущем уровне элементов больше, чем на текущем,
				// то приравниваем кол-во элементов на текущем уровне к кол-ву
				// элементов на предыдущем, чтобы папка не "уехала влево"
				if (elsOnLvl[curFolderLvl - 1] > elsOnLvl[curFolderLvl]) {
					elsOnLvl[curFolderLvl] = elsOnLvl[curFolderLvl - 1];
				}

				// конечный отступ слева равен длине папке и отступу после нее
				// умноженному на кол-во элементов на этом уровне
				// -1, потому что убираем отступ последней папки
				curFolder.left = (folderWitdth + folderMargin) * (elsOnLvl[curFolderLvl] - 1);
				curFolder.top = (folderHeight + lvlMargin) * curLvl;

				// в объект для JSX кладем данные для JSX компонента
				curTabDataObj.JSXAndChildToParentObj[folderName].JSXdata = {
					key: `${i}-${title}`,
					folderName,
					url,
					$width: folderWitdth,
					$height: folderHeight,
					$left: curFolder.left,
					$top: curFolder.top,
					$folderBorder: folderBorder,
					$zIndex: currentTabLinksLength + 10 - i,
					linksArr: curFolder.linksArr,
					refFunc: el => {
						if (el) curTabDataObj.refs[folderName] = el
						else return;
					},
					title
				};
			}

			//console.log('folderName after 2 if', folderName)


			if (isFolder) {
				curFolderLvlInData.push({ title, lvl });
			}
			//console.log('curFolder.linksArr after if', curFolder.linksArr);

			if (!isFolder) {
				curFolder.linksArr.push({ title, url });
			}

			if (curLvl > curTabDataObj.maxLvl) {
				curTabDataObj.maxLvl = curLvl;
			}

			if (curFolder.left > curTabDataObj.width) {
				curTabDataObj.width = curFolder.left + folderWitdth;
			}
			
		}

		templateJSX = Object.keys(curTabDataObj.JSXAndChildToParentObj).map((key) => {
			const JSXdata = curTabDataObj.JSXAndChildToParentObj[key].JSXdata;
			//console.log(key, JSXdata.linksArr);
			return <Folder {...JSXdata} refData={curTabDataObj.refs}>{JSXdata.title}</Folder>
		})

		for (let i = 0; i <= curTabDataObj.maxLvl; i++) {
			templateJSXSVGGradient.push(
				<RectSVG
					key={`rect-${i}`}
					x="0"
					y={`${(folderHeight + lvlMargin) * i}px`}
					width="100%"
					height={`${folderHeight + lvlMargin}px`}
					fill={lerpColor('#eeeeee', '#686868', (i + 1) / (curTabDataObj.maxLvl + 1))}
				/>
			);
		}
	}




	//console.log('curTabDataObj after sorting', curTabDataObj);


	//console.log('containers:', containers);
	//console.log('id:', id);
	//console.log(sidebar);
	//console.log('panels:', panels);
	//console.log(Object.keys(panels));
	//console.log('tabs', tabs);
	//console.log('nav', nav);
	//console.log('activeTab', activeTab);


	useEffect(() => {
		if (isTabsJSON) {
			curTabDataObj.refs.svgGroupEl.replaceChildren()

			let dataObjOfCurrentFolder = null;
			let objToConnetWithParent = null;
			let parentToConnect = null;

			Object.keys(curTabDataObj.refs).forEach((key) => {
				if (key === 'svgEl' || key === 'svgGroupEl') return;
				//console.log(curTabDataObj.refs)
				//console.log(key)
				dataObjOfCurrentFolder = curTabDataObj.JSXAndChildToParentObj[key];
				objToConnetWithParent = curTabDataObj.refs[key];
				parentToConnect = curTabDataObj.refs[dataObjOfCurrentFolder.parentFolderName];

				//console.log('dataObjOfCurrentFolder', dataObjOfCurrentFolder)
				//console.log('objToConnetWithParent', objToConnetWithParent)
				//console.log('parentToConnect', parentToConnect)

				if (parentToConnect) {
					const r1 = parentToConnect.getBoundingClientRect()
					const r2 = objToConnetWithParent.getBoundingClientRect()

					//console.log('r1', r1)
					//console.log('r2', r2)
					//console.log('offsetLeft', parentToConnect.offsetLeft)
					//console.log('offsetTop', parentToConnect.offsetTop)

					const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

					line.setAttribute("x1", parentToConnect.offsetLeft + r1.width / 2)
					line.setAttribute("y1", parentToConnect.offsetTop + r1.height)

					line.setAttribute("x2", objToConnetWithParent.offsetLeft + r2.width / 2)
					line.setAttribute("y2", objToConnetWithParent.offsetTop)

					line.setAttribute("stroke", "#585858")

					curTabDataObj.refs.svgGroupEl.appendChild(line)
				}


			})
		}
		
	}, [activeTab])

	return (
		<Wrap>
			<TabsBlock
				panels={panels}
				activeTab={activeTab}
				nav={nav}
				//nav={[]}
				tabsKeys={panelsObjKeys}
				setActiveTabHook={setActiveTab}
			/>
			<FoldersWrap>
				<FoldersSection $width={isTabsJSON ? curTabDataObj.width : 1000}>
					{
						isTabsJSON ? (
							<>
								{templateJSX}
								<LinesSVG ref={el => curTabDataObj.refs['svgEl'] = el}>
									{templateJSXSVGGradient}
									<GroupSVG ref={el => curTabDataObj.refs['svgGroupEl'] = el} />

								</LinesSVG>
							</>
						) : null
					}
					<FileUpload
						receivedFileName={localStorageData?.fileName}
						isFileUploaded={isTabsJSON}
						setTabsJSON={setTabsJSON}
						setActiveTab={setActiveTab}
					/>
				</FoldersSection>
			</FoldersWrap>
			<GlobalStyle />
		</Wrap>
	)
}

export default memo(App)