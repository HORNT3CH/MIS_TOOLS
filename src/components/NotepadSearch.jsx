import React, { useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Form, Button, ButtonGroup, ToggleButton, Alert } from "react-bootstrap";

/**
 * MultipleNotePadPlusSearch
 * A tiny utility to turn a multi-line list into a Notepad++-friendly regex.
 * - Paste your IDs (one per line) on the left
 * - Click “Generate Regex” to create a non‑capturing alternation group
 * - Optionally switch to the Compact mode for a smart prefix+suffix‑aware regex
 * - Click Copy to copy the result (with fallback for older browsers)
 */
// JSX version of the component
export default function MultipleNotePadPlusSearch() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("explicit"); // explicit | compact
  const [result, setResult] = useState("");
  const [hint, setHint] = useState("");

  const lines = useMemo(() => {
    return input
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [input]);

  function escapeRegex(str) {
    // Escape regex special chars except digits/letters (so XML-like text is safe)
    return str.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
  }

  function longestCommonPrefix(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  }

  function longestCommonSuffix(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
    return a.slice(a.length - i);
  }

  function getCommonPrefix(arr) {
    if (arr.length === 0) return "";
    return arr.reduce((p, s) => longestCommonPrefix(p, s));
  }

  function getCommonSuffix(arr) {
    if (arr.length === 0) return "";
    return arr.reduce((p, s) => longestCommonSuffix(p, s));
  }

  function contiguousRanges(nums) {
    // nums must be sorted unique integers
    const ranges = [];
    let start = null;
    let prev = null;
    for (const n of nums) {
      if (start === null) {
        start = n;
        prev = n;
        continue;
      }
      if (n === prev + 1) {
        prev = n;
      } else {
        ranges.push([start, prev]);
        start = n;
        prev = n;
      }
    }
    if (start !== null) ranges.push([start, prev]);
    return ranges;
  }

  function rangeToRegex([a, b], pad = 0) {
    // Returns a simple shorthand where possible for equal-length numeric strings
    // Examples: 1-9 => \d, 10-19 => 1\d, 20-23 => 2[0-3], 01-07 => 0[1-7]
    if (a === b) return String(a).padStart(pad, "0");
    // same decade shortcut like 10-19 or 20-29
    if (a % 10 === 0 && b % 10 === 9) {
      return `${Math.floor(a / 10)}\\d`;
    }
    // same leading digit, not full decade -> use character class
    if (Math.floor(a / 10) === Math.floor(b / 10)) {
      const tens = Math.floor(a / 10);
      const lo = a % 10;
      const hi = b % 10;
      return `${tens}[${lo}-${hi}]`;
    }
    // fall back to explicit alternation for mixed decades
    const parts = [];
    for (let n = a; n <= b; n++) parts.push(String(n).padStart(pad, "0"));
    return `(?:${parts.join("|")})`;
  }

  function makeExplicitRegex(items) {
    const escaped = items.map(escapeRegex);
    return `(?:${escaped.join("|")})`;
  }

  function makeCompactRegex(items) {
    if (items.length === 0) return "";
    const pref = getCommonPrefix(items);
    const suff = getCommonSuffix(items);

    const middles = items.map((s) => s.slice(pref.length, s.length - suff.length));

    // Compact only when all middles are purely digits and same width
    const allDigits = middles.every((m) => /^\d+$/.test(m));
    const sameWidth = new Set(middles.map((m) => m.length)).size === 1;

    if (!allDigits || !sameWidth) {
      // Not suitable for numeric compaction — fall back to explicit list with shared prefix/suffix
      const inner = makeExplicitRegex(middles);
      return `${escapeRegex(pref)}${inner}${escapeRegex(suff)}`;
    }

    const width = middles[0].length;
    const nums = Array.from(new Set(middles.map((m) => parseInt(m, 10)))).sort((a, b) => a - b);
    const ranges = contiguousRanges(nums);

    const chunks = ranges.map((r) => rangeToRegex(r, width));
    const inner = chunks.length === 1 ? chunks[0] : `(?:${chunks.join("|")})`;

    return `${escapeRegex(pref)}${inner}${escapeRegex(suff)}`;
  }

  function generate() {
    setHint("");
    if (lines.length === 0) {
      setResult("");
      setHint("Paste a list on the left first.");
      return;
    }

    const unique = Array.from(new Set(lines));

    try {
      const pattern = mode === "compact" ? makeCompactRegex(unique) : makeExplicitRegex(unique);
      setResult(pattern);
    } catch (e) {
      console.error(e);
      setHint("Could not build regex. Falling back to explicit mode.");
      setResult(makeExplicitRegex(unique));
    }
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setHint("Copied to clipboard.");
    } catch (err) {
      // Fallback copy method
      try {
        const ta = document.createElement("textarea");
        ta.value = result;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        setHint(ok ? "Copied to clipboard (fallback)." : "Press Ctrl+C to copy.");
      } catch (e) {
        setHint("Press Ctrl+C to copy.");
      }
    }
  }

  function clearAll() {
    setInput("");
    setResult("");
    setHint("");
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Multiple NotePad Plus Search</h2>
      <Row>
        <Col md={6}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Input List</Card.Title>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={12}
                  placeholder="One ID per line"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </Form.Group>

              <div className="mb-3">
                <ButtonGroup>
                  <ToggleButton
                    id="mode-explicit"
                    type="radio"
                    variant="outline-primary"
                    name="mode"
                    value="explicit"
                    checked={mode === "explicit"}
                    onChange={() => setMode("explicit")}
                  >
                    Explicit
                  </ToggleButton>
                  <ToggleButton
                    id="mode-compact"
                    type="radio"
                    variant="outline-primary"
                    name="mode"
                    value="compact"
                    checked={mode === "compact"}
                    onChange={() => setMode("compact")}
                  >
                    Compact
                  </ToggleButton>
                </ButtonGroup>
              </div>

              <div className="d-flex gap-2">
                <Button variant="primary" onClick={generate}>Generate Regex</Button>
                <Button variant="secondary" onClick={() => { setInput(""); setResult(""); setHint(""); }}>Clear</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Result (Notepad++ Regex)</Card.Title>
              <Form.Control
                as="textarea"
                rows={12}
                readOnly
                value={result}
                placeholder="Result will appear here"
                className="mb-3"
              />

              <div className="d-flex align-items-center gap-2">
                <Button variant="dark" disabled={!result} onClick={copyResult}>Copy</Button>
                {hint && <Alert variant="secondary" className="m-0 py-1 px-2">{hint}</Alert>}
              </div>

              <hr />
              <div>
                <h6>How to use in Notepad++</h6>
                <ol className="mb-0 ps-3">
                  <li>Press <strong>Ctrl+F</strong> (or <strong>Ctrl+Shift+F</strong> for “Find in Files”).</li>
                  <li>Paste the pattern into <em>Find what</em>.</li>
                  <li>Set <strong>Search mode</strong> to <strong>Regular expression</strong>.</li>
                  <li>(Optional) Check <strong>Match case</strong> if needed.</li>
                  <li>Use Find All in Current Document.</li>
                </ol>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
