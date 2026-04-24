import { useState } from "react";
import { Container, Button, Form } from "react-bootstrap";

const D365List = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");  
  const [warning, setWarning] = useState("");
  const [copiedList, setCopiedList] = useState("");

  const convertToList = () => {
    const items = input
      .split("\n")
      .map(item => item.trim()) // Trim whitespace
      .filter(item => item.length > 0); // Remove empty lines

    if (items.length === 0) {
      setWarning("Please enter a list before converting.");
      setTimeout(() => setWarning(""), 3000);      
    } else {
      setOutput(`${items.join(",")},`);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output).then(() => {
        setCopiedList("Copied to clipboard!");
        setTimeout(() => setCopiedList(null), 2000);
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
        fallbackCopyText(output);
      });
    } else {
      fallbackCopyText(output);
    }
  };

  // Fallback method for older browsers
  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedList("Copied to clipboard!");
      setTimeout(() => setCopiedList(null), 2000);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <Container className="mt-4">
      <h2>D365 List with Ending Comma</h2>
      <Form.Control as="textarea" rows={6} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter list here..." />
      {warning && (
        <div className="alert alert-danger mt-2" role="alert">
        {warning}
      </div>
      )}

      <Button className="mt-2" onClick={convertToList}>Convert</Button>

      <Form.Control as="textarea" rows={6} className="mt-3" readOnly value={output} />
      <Button className="mt-2" variant="secondary" onClick={copyToClipboard}>Copy</Button>
      {copiedList && (
        <div className="alert alert-success mt-2" role="alert">
        {copiedList}
      </div>
      )}
    </Container>
  );
};

export default D365List;
