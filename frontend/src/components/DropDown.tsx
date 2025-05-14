import { useState } from "react"
import { ChainOption } from "./InputSections";


interface DropDownProps {
    chainOptions: ChainOption[],
    defaultChain: ChainOption,
    onChange: (chain: { value: string; label: string; icon: string }) => void
}

export function DropDownComponent({chainOptions, defaultChain, onChange}: DropDownProps) {

    const [selectedChain, setSelectedChain] = useState<ChainOption>(defaultChain);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);


    return <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
        <div className="dropDownStyle" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} onClick={()=> {
                setIsExpanded(prev => !prev)
            }}>
            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center", fontFamily: "Satoshi-Medium", border: "5px"}}>
                <img 
                    className="iconStyle"
                    src={selectedChain.icon} 
                />           
                {selectedChain.label}           
            </div>
            <div 
                style={{backgroundColor: "transparent", border: "none"}}>
                <svg
                    style={{
                      width: "18px",
                      height: "18px",
                      transition: "transform 0.3s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      stroke: "#696969",
                    }}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                >         
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
            </div>
        </div>
        {
            isExpanded && (
            <div 
                style={{
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    maxHeight: isExpanded ? "120px" : "0px",
                    position: 'absolute',
                    width: '100%',
                    top: '100%',
                    left: 0,
                    zIndex: 999,
                    background: '#fff',
                    border: '1px solid #D3D3D3',
                    borderRadius: '10px',
                    marginTop: "2px",
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
                {
                    chainOptions.map((chain, index) => 
                        <div 
                            key={index}
                            onMouseEnter={()=> setHovered(index)}
                            onMouseLeave={()=> setHovered(null)}
                            onClick={()=> {
                                setSelectedChain(chain)
                                onChange(chain)
                                setIsExpanded(false) 
                            }}
                            style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                paddingInline: "10px",
                                paddingBlock: "15px", 
                                backgroundColor: hovered === index ? "#D3D3D3" : "#FFFFFF",
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                fontFamily: "Satoshi-Medium"
                                }}>
                            <img
                                className="iconStyle"
                                src={chain.icon}
                            />
                            {chain.label}
                        </div>
                    )
                }
            </div>    
        )}
    </div>
}