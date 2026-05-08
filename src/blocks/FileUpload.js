import { memo, useState, useRef, useEffect } from 'react';
import { styled } from "styled-components";

const InputContainer = styled.div`
    display: flex;
    align-items: center;
    position: absolute;
    top: ${props => props.$isBottom ? 'auto' : '10px'};
    left: 10px;
    bottom: ${props => props.$isBottom ? '20px' : 'auto'};
    padding-right: 40px;
    z-index: 2;
    width: ${props => props.$width ? `${props.$width}px` : 'fit-content'};
    -webkit-width: ${props => props.$width ? `${props.$width}px` : 'fit-content'};
    transition: width 1s ease;
    overflow: hidden;
`

const InputFile = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
`

const InputLabel = styled.label`
    display: inline-block;
    padding: 12px 24px;
    background-color: #292929;
    color: white;
    font-family: 'Arial', sans-serif;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;
    cursor: ${props => props.$isClosed ? 'default' : 'pointer'};
    transition: opacity 1s ease, background-color 0.3s ease;
    margin-right: 10px;
    opacity: ${props => props.$isClosed ? 0 : props.$isFileUploaded ? 0.6 : 1};
    z-index: 1;
    white-space: nowrap;
    &:hover {
    	opacity: ${props => props.$isClosed ? 0 : 1};
        background-color: ${props => props.$isFileUploaded ? '#292929' : '#404040'};
    }
`

const UploadFileName = styled.span`
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    line-height: 18px;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    margin-right: 0px;
    z-index: 1;
`

const CloseButton = styled.div`
    display: inline-block;
    position: absolute;
    right: 10px;
    top: 50%;
    margin-top: -10px;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    opacity: ${props => props.$isFileUploaded ? 0.6 : 1};
    z-index: 2;
    border: 1px solid #292929;
    border-radius: 5px;
    transition: opacity 1s ease, border 0.3s ease;
    &::after {
        position: absolute;
        content: '';
        left: 3px;
        top: 3px;
        border-top: 6px solid transparent;
        border-right: 12px solid #292929;
        border-bottom: 6px solid transparent;
        transition: opacity 1s ease, border-right 0.3s ease, transform 1s ease;
        transform: ${props => props.$isClosed ? 'rotate(180deg)' : 'rotate(0)'};
        opacity: ${props => props.$isFileUploaded ? 0.6 : 1};
    }
    &:hover {
    	opacity: 1;
        border: ${props => props.$isFileUploaded ? '1px solid #292929' : '1px solid #404040'};
    }
    &:hover::after {
        opacity: 1;
        border-right: ${props => props.$isFileUploaded ? '12px solid #292929' : '12px solid #404040'};
    }
`

const buttonWidth = 40;
let defaultWidth = 0;

const FileUpload = ({
    receivedFileName,
    isFileUploaded,
    setTabsJSON,
    setActiveTab
}) => {
    const [fileName, setFileName] = useState(receivedFileName || 'No file selected');
    const [isClosed, setIsClosed] = useState(isFileUploaded);
    //const [elWidth, setElWidth] = useState(isFileUploaded ? buttonWidth : null);
    //const [isClosed, setIsClosed] = useState(false);
    const [elWidth, setElWidth] = useState();
    const ref = useRef();
    //console.log('--------')
    //console.log('receivedFileName', receivedFileName)
    //console.log('elWidth', elWidth)
    //console.log('isFileUploaded', isFileUploaded)
    //console.log('isClosed', isClosed)
    useEffect(() => {
        
            setElWidth(null);
            setTimeout(() => {
                const elData = ref.current.getBoundingClientRect();
                //console.log('u', elData.width)
                defaultWidth = elData.width;

                setElWidth(elData.width);
                //console.log('before if elWidth', elWidth);
                // Если это первая загрузка с localStorage,
                // то закрыть вкладку
                if (receivedFileName && elWidth === undefined) {
                    //console.log('if elWidth', elWidth);
                    setElWidth(buttonWidth);
                    setIsClosed(true)
                }
            })
        
        
        
    }, [fileName])

    return (
        <InputContainer
            $isBottom={isFileUploaded}
            $isClosed={isClosed}
            $width={elWidth}
            ref={ref}
        >
            <InputFile
                id="file-upload"
                type="file"
                onChange={
                    async (e) => {
                        const file = e.target.files[0];

                        if (!file) {
                            setFileName('No file selected');
                            return;
                        }

                        try {
                            const text = await file.text();
                            const json = JSON.parse(text);
                            localStorage.setItem("sidebery-json", JSON.stringify({ json, fileName: file.name }));
                            setTabsJSON(json);
                            setActiveTab(0);
                            setFileName(file.name);
                        } catch (e) {
                            console.log('Ошибка JSON', e);
                        }
                    }
                }
                accept=".json"
                disabled={isClosed}
            />
            <InputLabel
                htmlFor="file-upload"
                $isFileUploaded={isFileUploaded}
                $isClosed={isClosed}
            >
                {'Select File'}
            </InputLabel>
            <UploadFileName>{fileName}</UploadFileName>
            <CloseButton
                onClick={
                    () => {
                        //console.log('w')

                        setElWidth(isClosed ? defaultWidth : buttonWidth);
                        setIsClosed(!isClosed);
                    }
                }
                $isClosed={isClosed}
                $isFileUploaded={isFileUploaded}
            />
        </InputContainer>
    )
}

export default memo(FileUpload);