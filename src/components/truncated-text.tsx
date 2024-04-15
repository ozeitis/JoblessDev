import { useState } from "react";

function TruncatedText({ text, maxLength } : { text: string, maxLength: number }) {
    const [isTruncated, setIsTruncated] = useState(true);

    // Function to format text into paragraphs
    const formatParagraphs = (text : string) => {
        // Splitting the text into paragraphs at each bullet point
        const paragraphs = text.split("• ").map((paragraph, index) => {
            // Ensuring the first paragraph does not get an unnecessary indentation
            if (index > 0) {
                return (
                    <p style={{ textIndent: "2em", marginTop: "1em" }}>
                        {"• " + paragraph}
                    </p>
                );
            } else {
                return <p>{paragraph}</p>;
            }
        });

        return paragraphs;
    };

    const ToggleButton = ({ onClick, isExpanded } : { onClick: () => void, isExpanded: boolean }) => (
        <button
            onClick={onClick}
            className="text-black font-semibold text-xs"
            style={{
                display: "inline",
                marginLeft: "5px",
                verticalAlign: "baseline",
                fontSize: "0.75rem",
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
            {isTruncated ? (
                <p style={{ display: "inline" }}>
                    {`${text.slice(0, maxLength)}...`}
                </p>
            ) : (
                formatParagraphs(text)
            )}
            <ToggleButton onClick={() => setIsTruncated(!isTruncated)} isExpanded={!isTruncated} />
        </div>
    );
}

export default TruncatedText;
