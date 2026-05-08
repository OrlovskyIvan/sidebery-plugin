import { memo, useState, setRef } from 'react';
import { styled } from "styled-components";
import LinksItem from './LinksItem';

const TabsButton = styled.button`
	display: block;
	position: absolute;
	padding: 0;
	width: 10px;
	height: 10px;
	right: 2px;
	bottom: 2px;
	background-color: #000;
	border: 0;
	cursor: pointer;
	border-radius: 3px;
    color: #fff;
    font-size: 10px;
    line-height: 10px;
    text-align: center;
	&:hover {
		opacity: 0.7;
	}
`;

const FolderWrap = styled.div`
	position: absolute;
	width: ${props => props.$width ? props.$width : 200}px;
	min-height: ${props => props.$height ? props.$height : 30}px;
	background-color: #e3e3e3;
	border: ${props => props.$folderBorder ? props.$folderBorder : 3}px solid #000;
	border-radius: 4px;
	left: ${props => props.$left ? props.$left : 0}px;
	top: ${props => props.$top ? props.$top : 0}px;
	font-size: 12px;
	font-weight: bold;
	padding: 2px;
	padding-right: 14px;
	overflow-wrap: break-word;
	z-index: ${props => props.$zIndex ? props.$zIndex : 5};
`

const LinksList = styled.ul`
	position: absolute;
	top: ${props => props.$top ? props.$top : 0}px;
	left: ${props => props.$left ? props.$left : 0}px;
	background-color: #e3e3e3;
	border: 1px solid #000;
`;

const Folder = ({
		folderName,
		refFunc,
		url,
		$folderBorder,
		refData,
		linksArr,
		children,
		...props
	}) => {
	const [isOpen, setIsOpen] = useState({ open: false, top: 0 });
	const [copied, setCopied] = useState(false);

	const handleOnCopy = async () => {
		try {
			await navigator.clipboard.writeText("Текст для копирования");
			setCopied(true);

			// сброс через время (опционально)
			setTimeout(() => setCopied(false), 1000);
		} catch (err) {
			console.error("Ошибка копирования:", err);
		}
	};

	return (
		<FolderWrap
            {...props}
            ref={refFunc}
			$folderBorder={$folderBorder}
        >
            {children}
			{
				linksArr.length > 0 &&
				<TabsButton
					onClick={
						() => {
							const folderRef = refData[folderName];
							const pos = refData[folderName].getBoundingClientRect()
							//console.log(refData[folderName]);
							//console.log(pos);

							setIsOpen({
								open: !isOpen.open,
								top: pos.height - $folderBorder,
								left: -$folderBorder
							});

							try {
								navigator.clipboard.writeText(url);
							} catch (err) {
								console.error("Ошибка копирования url:", err);
							}
						}
					}
				>
                    {isOpen.open && '\u2716'}
				</TabsButton>
			}
			{
				isOpen.open &&
				<LinksList $top={isOpen.top} $left={isOpen.left}>
					{
						linksArr.map((linkObj, index) => (
							<LinksItem key={index} url={linkObj.url}>
								{linkObj.title}
							</LinksItem>
						))
					}
				</LinksList>
			}
		</FolderWrap>
	)
}

export default memo(Folder);