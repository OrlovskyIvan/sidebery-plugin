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
    background-color: ${props => props.$isActive ? '#292929' : '#404040'};
    cursor: pointer;
    border: none;
    border-right: 1px solid #fff;
    border-top: 1px solid #fff;
    border-top-right-radius: 10px;
    opacity: ${props => props.$isActive ? 1 : 0.6};
    &:hover {
    	opacity: 1;
    }
`;

const TabsBlock = ({ panels, tabsKeys, nav, setActiveTabHook, activeTab }) => {
	//const [value, setValue] = useState(tabs);
    //console.log('tabsObj', tabsObj)
	//console.log('-------------------------------------');
	
    const tabsJSX = nav.map((item, i) => {
        if (i < nav.length - 2) {
            const panelItem = panels[item];

            if (panelItem) {
                console.log('item', item)
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

    /*
    const tabsJSX = tabsKeys.map((key) => {
        const { name, color } = panels[key];
        
        return (
            <TabsButton
                key={key}    
                $color={name === 'Tabs' ? '#fff' : color}
                $isActive={activeTab === key}
                onClick={() => setActiveabHook(key)}
            >
                {name}
            </TabsButton>
        )
    })
        */

	return (
		<TabsWrap>
            {tabsJSX}
		</TabsWrap>
	)
}

export default memo(TabsBlock);