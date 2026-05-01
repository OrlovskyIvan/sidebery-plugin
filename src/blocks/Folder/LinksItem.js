import { memo, useState } from 'react';
import { styled } from "styled-components";

const Wrap = styled.li`
	display: block;
    position: relative;
	margin-bottom: 0px;
	width: 300px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	border-bottom: 1px solid #000;
	padding: 2px;
	padding-right: 14px;
	font-size: 14px;
	font-weight: normal;
    cursor: pointer;
    &:hover {
        color: #fff;
        background-color: #474747;
    }
`;



const LinksItem = ({ url, children }) => {
	const [copied, setCopied] = useState(false);

    const handleOnCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);

            // сброс через время (опционально)
            setTimeout(() => setCopied(false), 1000);
        } catch (err) {
            console.error("Ошибка копирования:", err);
        }
    };

	return (
		<Wrap
            onClick={handleOnCopy}
        >
            {children}
		</Wrap>
	)
}

export default memo(LinksItem);