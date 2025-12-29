// Shield component to visualize protection status

const Shield = ({ active }) => {
  return (
    <div className={`shield-wrapper ${active ? 'active' : 'inactive'}`}>
      <svg 
        viewBox="0 0 100 120" 
        xmlns="http://www.w3.org/2000/svg"
        className="shield-svg"
      >
        {/* Shield Base */}
        <path 
          d="M50,10 L10,30 V70 C10,85 25,100 50,110 C75,100 90,85 90,70 V30 L50,10 Z" 
          className="shield-base"
        />
        
        {/* Shield Inner */}
        <path 
          d="M50,20 L20,35 V65 C20,75 30,90 50,97 C70,90 80,75 80,65 V35 L50,20 Z" 
          className="shield-inner"
        />
        
        {/* Lock Icon when inactive */}
        {!active && (
          <g className="lock-icon">
            <rect x="40" y="50" width="20" height="15" rx="2" />
            <path d="M45,50 V40 C45,35 55,35 55,40 V50" strokeWidth="3" fill="none" />
          </g>
        )}
        
        {/* Check Icon when active */}
        {active && (
          <path 
            d="M35,60 L45,70 L65,50" 
            strokeWidth="5" 
            fill="none" 
            stroke="#fff" 
            className="check-icon"
          />
        )}
        
        {/* Glow effect when active */}
        {active && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </svg>
    </div>
  );
};
