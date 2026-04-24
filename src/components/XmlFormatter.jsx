import { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

const XmlFormatter = () => {
  const [inputXml, setInputXml] = useState('');
  const [formattedXml, setFormattedXml] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [error, setError] = useState('');

  const formatXml = (xml) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'application/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        setError('Invalid XML format.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const serializer = new XMLSerializer();
      const raw = serializer.serializeToString(xmlDoc);
      const prettyXml = formatXmlManually(raw);
      setFormattedXml(prettyXml);
    } catch {
      setError('An error occurred while parsing XML.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatXmlManually = (xml) => {
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    const PADDING = '  ';
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
        indent = 1;
      }

      formatted += PADDING.repeat(pad) + node + '\r\n';
      pad += indent;
    });

    return formatted.trim();
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formattedXml)
        .then(() => {
          setCopyStatus('Copied to clipboard!');
          setTimeout(() => setCopyStatus(''), 2000);
        })
        .catch(() => fallbackCopyText(formattedXml));
    } else {
      fallbackCopyText(formattedXml);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <Container className="mt-4">
      <h2>XML Formatter</h2>
      <Row className="mb-3" style={{ height: '50vh' }}>
        <Col md={6} className="h-100">
          <Form.Control
            as="textarea"
            className="h-100"
            placeholder="Paste your XML here..."
            value={inputXml}
            onChange={(e) => setInputXml(e.target.value)}
          />
        </Col>
        <Col md={6} className="h-100">
          <Form.Control
            as="textarea"
            className="h-100"
            placeholder="Formatted XML will appear here..."
            value={formattedXml}
            readOnly
          />
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex gap-2">
        <Button variant="primary" onClick={() => formatXml(inputXml)}>Format XML</Button>
        <Button variant="success" onClick={copyToClipboard}>Copy</Button>
      </div>

      {copyStatus && (
        <div className="alert alert-success mt-2" role="alert">
          {copyStatus}
        </div>
      )}
    </Container>
  );
};

export default XmlFormatter;
