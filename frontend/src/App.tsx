import { RecoilRoot } from 'recoil'
import './App.css'
import { InputSections } from './components/InputSections'
import { NavBar } from './components/NavBar'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const client = new QueryClient();

function App() {

  return <WagmiProvider config={config}>
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <div style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#fefbff"}}>
          <NavBar/>
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <InputSections/>
          </div>
        </div>
      </RecoilRoot> 
    </QueryClientProvider>
  </WagmiProvider>  
}

export default App
