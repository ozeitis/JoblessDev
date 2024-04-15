import { useState } from "react";

function TruncatedText({ text, maxLength }: { text: string, maxLength: number }) {
    const [isTruncated, setIsTruncated] = useState(true);
  
    const ToggleButton = ({ onClick, isExpanded }: { onClick: () => void, isExpanded: boolean }) => (
      <button
        onClick={onClick}
        className="text-black font-semibold text-xs" // Slightly reduced the boldness for a subtler look
        style={{ 
          display: "inline", // Changed to inline to appear next to the text
          marginLeft: "5px", // Adds a little space between the text and button
          verticalAlign: "baseline", // Aligns the button with the text baseline
          fontSize: "0.75rem", // Makes the button text a bit smaller
        }}
      >
        {isExpanded ? (
          <>
            View Less <span style={{ fontWeight: "bold" }}>▲</span>
          </>
        ) : (
          <>
            View More <span style={{ fontWeight: "bold" }}>▼</span>
          </>
        )}
      </button>
    );
  
    return (
      <div>
        <p style={{ display: "inline" }}>
          {isTruncated ? `${text.slice(0, maxLength)}...` : text}
        </p>
        <ToggleButton onClick={() => setIsTruncated(!isTruncated)} isExpanded={!isTruncated} />
      </div>
    );
}

export default TruncatedText;
