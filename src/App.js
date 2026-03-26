import React from 'react'
import styled from 'styled-components'
import './assets/css/normalize.css'

const Wrap = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
`

const Title = styled.h1`
	color: green;
`

const App = () => (
	<Wrap>
		<Title>esbuild production ready config &#128640;</Title>
	</Wrap>
)

export default App
