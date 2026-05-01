import { useState } from "react";
import { Container, Button, Form, Modal } from "react-bootstrap";

const D365List = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");  
  const [warning, setWarning] = useState("");
  const [copiedList, setCopiedList] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  const convertToList = () => {
    const items = input
      .split("\n")
      .map(item => item.trim())
      .filter(item => item.length > 0);

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

  const clearAll = () => {
    if (!input && !output) return;
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    setInput("");
    setOutput("");
    setWarning("");
    setCopiedList("");
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <Container className="mt-4">
      <h2>D365 List with Ending Comma</h2>

      <Form.Control
        as="textarea"
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter list here..."
      />

      {warning && (
        <div className="alert alert-danger mt-2" role="alert">
          {warning}
        </div>
      )}

      <div className="d-flex gap-2 mt-2">
        <Button onClick={convertToList}>
          Convert
        </Button>

        <Button
          variant="warning"
          onClick={clearAll}
          disabled={!input && !output}
        >
          Reset Tool
        </Button>
      </div>

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

      {copiedList && (
        <div className="alert alert-success mt-2" role="alert">
          {copiedList}
        </div>
      )}

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

export default D365List;