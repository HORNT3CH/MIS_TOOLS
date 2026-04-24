import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";

/**
 * XmlValidator
 * - Paste large XML into the textarea
 * - Click Analyze to validate
 * - Success = green alert for 3s
 * - Failure = red alert with specific missing/unexpected tags, 3s auto-dismiss
 */
export default function XmlValidator() {
  const [xmlText, setXmlText] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: "success", message: "" });
  const timerRef = useRef(null);

useEffect(() => {
  // Only auto-dismiss SUCCESS alerts
  if (alert.show && alert.variant === "success") {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAlert(a => ({ ...a, show: false }));
    }, 3000);
  }

  // For danger alerts, do nothing (they stay visible)

  return () => clearTimeout(timerRef.current);
}, [alert.show, alert.variant]);


  const handleAnalyze = () => {
    if (!xmlText.trim()) {
      setAlert({ show: true, variant: "danger", message: "Please paste some XML first." });
      return;
    }

    setLoading(true);

    // Slight delay to keep UI responsive for very large input
    setTimeout(() => {
      const result = validateXml(xmlText);
      if (result.valid) {
        setAlert({ show: true, variant: "success", message: "Valid XML" });
      } else {
        // Combine parser error (if any) with structural findings
        const issues = [];
        if (result.parserError) issues.push(`Parser: ${result.parserError}`);
        if (result.unexpectedClosers.length) {
          issues.push(
            `Unexpected closing tag(s): ${result.unexpectedClosers
              .map(u => `</${u.found}> at position ${u.index}${u.expected ? ` (expected </${u.expected}>)` : ""}`)
              .join("; ")}`
          );
        }
        if (result.missingClosers.length) {
          issues.push(
            `Missing closing tag(s): ${result.missingClosers.map(m => `<${m}>`).join(", ")}`
          );
        }
        setAlert({
          show: true,
          variant: "danger",
          message: `Invalid XML — ${issues.join(" | ")}`
        });
      }
      setLoading(false);
    }, 0);
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-0">XML Analyzer</h3>
          <small className="text-muted">Paste your XML below and click Analyze</small>
        </Col>
      </Row>

      {alert.show && (
        <Row className="mb-3">
          <Col>
            <Alert variant={alert.variant} className="mb-0">
              {alert.message}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Form>
            <Form.Group className="mb-3" controlId="xmlInput">
              <Form.Label>XML Input</Form.Label>
              <Form.Control
                as="textarea"
                value={xmlText}
                onChange={(e) => setXmlText(e.target.value)}
                placeholder="Paste XML here..."
                style={{ minHeight: "50vh", fontFamily: "monospace" }}
              />
              <Form.Text muted>
                Handles large XML. Self-closing tags like <code>&lt;tag /&gt;</code> are supported.
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleAnalyze}
                disabled={!xmlText.trim() || loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" /> Analyzing…
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setXmlText("")}
                disabled={loading || !xmlText}
              >
                Clear
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

/**
 * Validates XML in two layers:
 * 1) DOMParser well-formedness check (fast, built-in)
 * 2) Tag stack scan to detect missing or unexpected closing tags with basic positions
 *
 * Notes:
 * - XML requires matching open/close tags; "void elements" (like in HTML) do not apply.
 *   Use self-closing form <tag/> when appropriate.
 */
function validateXml(xmlString) {
  // 1) DOMParser — primary well-formedness test
  const parser = new DOMParser();
  const parsed = parser.parseFromString(xmlString, "application/xml");
  const parserErrNode = parsed.getElementsByTagName("parsererror")[0];

  let parserErrorText = "";
  if (parserErrNode) {
    // Different browsers expose this differently; we’ll try to grab text content
    parserErrorText = extractParserError(parserErrNode);
  }

  // 2) Structural scan with a simple tag stack (best effort, not a full XML tokenizer)
  const { missingClosers, unexpectedClosers } = scanTagStructure(xmlString);

  const valid = !parserErrNode && missingClosers.length === 0 && unexpectedClosers.length === 0;

  return {
    valid,
    parserError: parserErrorText,
    missingClosers,
    unexpectedClosers
  };
}

function extractParserError(parserErrNode) {
  try {
    // Firefox keeps the error text inside the node; Chrome often nests it
    const text = parserErrNode.textContent || "";
    // Trim and compress whitespace
    return text.replace(/\s+/g, " ").trim();
  } catch {
    return "Unknown XML parser error.";
  }
}

/**
 * Best-effort tag structure scan:
 * - Ignores comments, CDATA, DOCTYPE, processing instructions
 * - Handles self-closing tags <tag/> so they don't hit the stack
 * - Tracks unexpected closers and missing closers
 */
function scanTagStructure(xmlString) {
  const cleaned = xmlString
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove CDATA
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    // Remove DOCTYPE and other <! ... > declarations
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<![^>-][\s\S]*?>/g, "")
    // Remove processing instructions
    .replace(/<\?[\s\S]*?\?>/g, "");

  // Regex to match open/self-close and close tags
  // Group 1: opening tag name; Group 2: attributes+optional slash; Group 3: closing tag name
  const tagRegex = /<([A-Za-z_][\w:\-\.]*)([^>]*)>|<\/\s*([A-Za-z_][\w:\-\.]*)\s*>/g;

  const stack = [];
  const missingClosers = [];
  const unexpectedClosers = [];

  let match;
  while ((match = tagRegex.exec(cleaned)) !== null) {
    const [full] = match;
    const openName = match[1];
    const openAttrs = match[2];
    const closeName = match[3];
    const index = match.index;

    if (openName) {
      // Self-closing?
      const selfClosing = /\/\s*>$/.test(full) || /\/\s*$/.test(openAttrs || "");
      if (!selfClosing) {
        stack.push({ name: openName, index });
      }
    } else if (closeName) {
      if (stack.length === 0) {
        // No opener available
        unexpectedClosers.push({ found: closeName, expected: null, index });
      } else {
        const top = stack[stack.length - 1];
        if (top.name === closeName) {
          stack.pop();
        } else {
          // Mismatch: expected the top of stack
          unexpectedClosers.push({ found: closeName, expected: top.name, index });
          // Try to recover: pop until matching or empty
          let recovered = false;
          while (stack.length) {
            const popped = stack.pop();
            if (popped.name === closeName) {
              recovered = true;
              break;
            } else {
              // We popped something that never got its closer
              missingClosers.push(popped.name);
            }
          }
          if (!recovered) {
            // Couldn’t find a matching opener; keep going
          }
        }
      }
    }
  }

  // Anything left in the stack needs a closing tag
  while (stack.length) {
    missingClosers.push(stack.pop().name);
  }

  // Deduplicate to keep the alert concise
  const uniqueMissing = [...new Set(missingClosers)];
  return { missingClosers: uniqueMissing, unexpectedClosers };
}
