// File: src/components/OperationResult.jsx
import React from "react";

const OperationResult = ({ result }) => {
  return (
    <section style={{ marginBottom: "20px" }}>
      <h2>Operation Result / Executed SQL</h2>
      <pre
        style={{
          background: "#f9f9f9",
          padding: "10px",
          border: "1px solid #ddd",
        }}
      >
        {result}
      </pre>
    </section>
  );
};

export default OperationResult;
