module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [ "airbnb", "airbnb/hooks" ],
    "overrides": [
        {
	      // обязательное свойство, заставляет читать jsx (+ ecmaFeatures)
	      "files": ["*.js", "*.jsx"]	      
	    },
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "ecmaFeatures": {
	      "jsx": true
	    },
	    "babelOptions": {
			"presets": ["@babel/preset-react"]
	    },
    },
    "rules": {
		"indent": [2, "tab", { "SwitchCase": 1, "VariableDeclarator": 1 }],
		"no-tabs": 0,
		"react/prop-types": 0,
		"react/jsx-indent": [2, "tab"],
		"react/jsx-indent-props": [2, "tab"],
		"react/function-component-definition": 0,
		"react/jsx-one-expression-per-line": 0,
		"react/jsx-filename-extension": 0,
		"react/react-in-jsx-scope": 0,
		"no-trailing-spaces": 0,
		"no-confusing-arrow": 0,
		"arrow-parens": 0,
		"semi": ["error", "never", { "beforeStatementContinuationChars": "always" }],
		"max-len": ["error", { "code": 80, "tabWidth": 0, "ignoreTemplateLiterals": true }],
		"jsx-a11y/label-has-associated-control": ["error", { assert: "either" } ],
		"jsx-a11y/no-noninteractive-element-to-interactive-role": [
			'error',
				{
					ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
					ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
					li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
					table: ['grid'],
					td: ['gridcell'],
					fieldset: ['radiogroup']
				},
		],
	}
}

/*
1) npm i --save-dev @babel/preset-react eslint eslint-config-airbnb eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks

2) In eslint v8, the legacy system (.eslintrc*) would still be supported, while in eslint v9, only the new system would be supported.

3) eslint-disable 
eslint-enable

4) all configs use eslint-plugin-react that has 4 spaces as default

5) jsx-a11y/no-noninteractive-element-to-interactive-role
The rule treats as error role="radiogroup" for fieldset tag, that's why it's needed an additional prop in the config.

6) alloy:
uses prettier
-
airbnb
uses 2 spaces
https://github.com/airbnb/javascript?tab=readme-ov-file#whitespace

eslint
4 spaces

7) Чтобы работал поиск ошибок доступности, нужно каждый доступный компонент прописывать в настройках, поэтому это не настраивается.
npm i --save-dev eslint-plugin-jsx-a11y
"plugins": ["jsx-a11y"]
"settings": {
	"jsx-a11y": {
		"polymorphicPropName": "as",
		"components": {
			"TestImgSrc": "img",
		}
	}
},
*/