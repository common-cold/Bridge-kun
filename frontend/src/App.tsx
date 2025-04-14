import { RecoilRoot } from 'recoil'
import './App.css'
import { InputSections } from './components/InputSections'
import { NavBar } from './components/NavBar'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeroSection } from './components/HeroSection'


const client = new QueryClient();

function App() {

  return <WagmiProvider config={config}>
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <div style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#fefbff",
            background: 'radial-gradient(circle, #7EC8E3 0%, #A1C6E7 60%, #ffffff 100%)',
            // background: 'radial-gradient(circle, #89f7fe 0%, #66a6ff 100%)'
        }}>
          <NavBar/>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "60px 0"}}>
            <HeroSection/>
            <InputSections/>
          </div>
        </div>
      </RecoilRoot> 
    </QueryClientProvider>
  </WagmiProvider>  
}

export default App
