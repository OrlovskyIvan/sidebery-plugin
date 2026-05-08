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
	padding: 3px;
	padding-right: 22px;
	font-size: 14px;
    line-height: 14px;
	font-weight: normal;
    cursor: pointer;
    &:hover {
        color: #fff;
        background-color: #474747;
    }
    &:hover::after {
        color: #fff;
    }
    &::after {
        content: '${props => props.$isCopied ? '\u2714' : ''}';
        position: absolute;
        right: 3px;
        top: 50%;
        margin-top: -8px;
        color: #474747;
        font-size: 16px;
        line-height: 16px;
        text-align: center;
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
            console.error("Ошибка копирования url:", err);
        }
    };

	return (
		<Wrap
            $isCopied={copied}
            onClick={handleOnCopy}
        >
            {children}
		</Wrap>
	)
}

export default memo(LinksItem);