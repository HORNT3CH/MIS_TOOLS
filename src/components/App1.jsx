import { useState } from "react";
import { Container, Button, Form, Modal } from "react-bootstrap";

const App1 = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [sqlType, setSqlType] = useState("IN");
  const [warning, setWarning] = useState("");
  const [copiedQuery, setCopiedQuery] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  const convertToSQLClause = () => {
    const items = input
      .split("\n")
      .map(item => item.trim().replace(/^"(.+?)"$/g, "$1"))
      .filter(item => item.length > 0);

    if (items.length === 0) {
      setWarning("Please enter a list before converting.");
      setTimeout(() => setWarning(""), 3000);      
    } else {
      setOutput(`${sqlType} (\n'${items.join("',\n'")}'\n)`);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output).then(() => {
        setCopiedQuery("Copied to clipboard!");
        setTimeout(() => setCopiedQuery(null), 2000);        
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
        fallbackCopyText(output);
      });
    } else {
      fallbackCopyText(output);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedQuery("Copied to clipboard!");
      setTimeout(() => setCopiedQuery(null), 2000);      
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  };

  // Open modal
  const clearAll = () => {
    if (!input && !output) return;
    setShowConfirm(true);
  };

  // ✅ Clear EVERYTHING
  const handleConfirmClear = () => {
    setInput("");
    setOutput("");
    setWarning("");
    setCopiedQuery("");
    setSqlType("IN"); // optional reset to default
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <Container className="mt-4">
      <h2>SQL IN/NOT IN Generator (Removes Double Quotes)</h2>

      <Form.Control
        as="textarea"
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter list here..."
      />

      <h3>Select IN/NOT IN</h3>

      <Button
        className="mt-2"
        variant="warning"
        onClick={clearAll}
        disabled={!input && !output}
      >
        Reset Tool
      </Button>

      <Form.Select
        className="mt-2"
        value={sqlType}
        onChange={(e) => setSqlType(e.target.value)}
      >
        <option value="IN">IN</option>
        <option value="NOT IN">NOT IN</option>
      </Form.Select>

      {warning && (
        <div className="alert alert-danger mt-2" role="alert">
          {warning}
        </div>
      )}
      
      <Button className="mt-2" onClick={convertToSQLClause}>
        Convert
      </Button>

      <Form.Control
        as="textarea"
        rows={6}
        className="mt-3"
        readOnly
        value={output}
      />

      <Button
        className="mt-2"
        variant="secondary"
        onClick={copyToClipboard}
      >
        Copy
      </Button>

      {copiedQuery && (
        <div className="alert alert-success mt-2" role="alert">
          {copiedQuery}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal show={showConfirm} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Tool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will clear your input and output. Continue?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmClear}>
            Yes, Reset
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App1;