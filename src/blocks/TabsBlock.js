import { memo, useState } from 'react';
import { styled } from "styled-components";

const TabsWrap = styled.div`
	display: flex;
	align-items: center;
    width: 100%;
`;

const TabsButton = styled.button`
    display: flex;
    padding: 10px;
    padding-left: 15px;
    width: 100%;
    color: ${props => props.$color};
    font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
    background-color: ${props => props.$isActive || props.$isSmall ? '#292929' : '#404040'};
    cursor: ${props => props.$isSmall ? 'default' : 'pointer'};
    border: none;
    border-right: 1px solid #fff;
    border-top: 1px solid #fff;
    border-top-right-radius: 10px;
    opacity: ${props => props.$isActive || props.$isSmall ? 1 : 0.6};
    &:hover {
    	opacity: 1;
    }
`;

const TabsBlock = ({ panels, nav, setActiveTabHook, activeTab }) => {
	
    const tabsJSX = nav.map((item, i) => {
        if (i < nav.length - 2) {
            const panelItem = panels[item];

            if (panelItem) {
                //console.log('item', item)
                const { name, color } = panels[item];
                
                return (
                    <TabsButton
                        key={item}    
                        $color={name === 'Tabs' ? '#fff' : color}
                        $isActive={activeTab === i}
                        onClick={() => setActiveTabHook(i)}
                    >
                        {name}
                    </TabsButton>
                )
            }
        }
    })

	return (
		<TabsWrap>
            {
                tabsJSX.length ?
                    tabsJSX :
                <TabsButton
                    $color={'#fff'}
                    $isActive={0}
                    $isSmall
                >
                    {'Выберите json файл со вкладками.'}
                </TabsButton>
            }
		</TabsWrap>
	)
}

export default memo(TabsBlock);