import { useState } from "react";

export default function XmlTotalsViewer() {
  const [selectedType, setSelectedType] = useState("shipments");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [meta, setMeta] = useState({});

  const parserMap = {
    shipments: parseShipmentsXml,
    orders: parseOrdersXml,
    receipts: parseReceiptsXml,
    purchaseOrders: parsePurchaseOrdersXml,
  };

  function handleTypeChange(e) {
    setSelectedType(e.target.value);
    setResults([]);
    setError("");
    setMeta({});
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setResults([]);
    setError("");
    setMeta({});

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlText = event.target.result;
      processXml(xmlText, e.target ? selectedType : selectedType);
    };
    reader.onerror = () => {
      setError("Unable to read the selected XML file.");
    };
    reader.readAsText(file);
  }

  function processXml(xmlText, type) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        setError("The XML file could not be parsed. Please verify the file format.");
        setResults([]);
        setMeta({});
        return;
      }

      const parseFunction = parserMap[type];
      if (!parseFunction) {
        setError("No parser exists for the selected XML type.");
        setResults([]);
        setMeta({});
        return;
      }

      const parsed = parseFunction(xmlDoc);

      if (Array.isArray(parsed)) {
        setResults(parsed);
        setMeta({});
      } else {
        setResults(parsed.results || []);
        setMeta(parsed.meta || {});
      }

      setError("");
    } catch (err) {
      setError("An unexpected error occurred while processing the XML file.");
      setResults([]);
      setMeta({});
    }
  }

  function getTagValue(parent, tagName, fallback = "") {
    return parent.getElementsByTagName(tagName)[0]?.textContent?.trim() || fallback;
  }

  function parseShipmentsXml(xmlDoc) {
    const shipmentDetails = xmlDoc.getElementsByTagName("t_al_host_shipment_detail");
    const grouped = {};

    for (let i = 0; i < shipmentDetails.length; i++) {
      const detail = shipmentDetails[i];

      const orderNumber = getTagValue(detail, "order_number", "Unknown Order");
      const itemNumber = getTagValue(detail, "item_number", "Unknown Item");
      const quantityShipped = Number(getTagValue(detail, "quantity_shipped", "0"));

      const key = `${orderNumber}|||${itemNumber}`;

      if (!grouped[key]) {
        grouped[key] = {
          orderNumber,
          itemNumber,
          quantity: 0,
        };
      }

      grouped[key].quantity += quantityShipped;
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.orderNumber !== b.orderNumber) {
        return a.orderNumber.localeCompare(b.orderNumber);
      }
      return a.itemNumber.localeCompare(b.itemNumber);
    });
  }

  function parseOrdersXml(xmlDoc) {
    const orderDetails = xmlDoc.getElementsByTagName("t_al_host_order_detail");
    const grouped = {};

    for (let i = 0; i < orderDetails.length; i++) {
      const detail = orderDetails[i];

      const orderNumber = getTagValue(detail, "order_number", "Unknown Order");
      const lineNumber = getTagValue(detail, "line_number", "Unknown Line");
      const itemNumber = getTagValue(detail, "item_number", "Unknown Item");
      const qty = Number(getTagValue(detail, "qty", "0"));

      const key = `${orderNumber}|||${lineNumber}|||${itemNumber}`;

      if (!grouped[key]) {
        grouped[key] = {
          orderNumber,
          lineNumber,
          itemNumber,
          quantity: 0,
        };
      }

      grouped[key].quantity += qty;
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.orderNumber !== b.orderNumber) {
        return a.orderNumber.localeCompare(b.orderNumber);
      }

      const lineA = Number(a.lineNumber);
      const lineB = Number(b.lineNumber);

      if (!Number.isNaN(lineA) && !Number.isNaN(lineB) && lineA !== lineB) {
        return lineA - lineB;
      }

      if (a.lineNumber !== b.lineNumber) {
        return a.lineNumber.localeCompare(b.lineNumber);
      }

      return a.itemNumber.localeCompare(b.itemNumber);
    });
  }

  function parseReceiptsXml(xmlDoc) {
    const receiptDetails = xmlDoc.getElementsByTagName("t_al_host_receipt");
    const grouped = {};
    let hasClose157 = false;

    for (let i = 0; i < receiptDetails.length; i++) {
      const detail = receiptDetails[i];

      const transactionCode = getTagValue(detail, "transaction_code", "");

      if (transactionCode === "157") {
        hasClose157 = true;
        continue;
      }

      if (transactionCode !== "151") {
        continue;
      }

      const poNumber = getTagValue(detail, "po_number", "Unknown PO Number");
      const warehouse = getTagValue(detail, "wh_id", "Unknown Warehouse");
      const poType = getTagValue(detail, "po_type", "Unknown PO Type");
      const lineNumber = getTagValue(detail, "line_number", "Unknown Line");
      const itemNumber = getTagValue(detail, "item_number", "Unknown Item");
      const qtyReceived = Number(getTagValue(detail, "qty_received", "0"));

      const key = `${poNumber}|||${warehouse}|||${poType}|||${lineNumber}|||${itemNumber}`;

      if (!grouped[key]) {
        grouped[key] = {
          poNumber,
          warehouse,
          poType,
          lineNumber,
          itemNumber,
          quantity: 0,
        };
      }

      grouped[key].quantity += qtyReceived;
    }

    const sortedResults = Object.values(grouped).sort((a, b) => {
      if (a.poNumber !== b.poNumber) {
        return a.poNumber.localeCompare(b.poNumber);
      }

      if (a.warehouse !== b.warehouse) {
        return a.warehouse.localeCompare(b.warehouse);
      }

      if (a.poType !== b.poType) {
        return a.poType.localeCompare(b.poType);
      }

      const lineA = Number(a.lineNumber);
      const lineB = Number(b.lineNumber);

      if (!Number.isNaN(lineA) && !Number.isNaN(lineB) && lineA !== lineB) {
        return lineA - lineB;
      }

      if (a.lineNumber !== b.lineNumber) {
        return a.lineNumber.localeCompare(b.lineNumber);
      }

      return a.itemNumber.localeCompare(b.itemNumber);
    });

    return {
      results: sortedResults,
      meta: {
        hasClose157,
      },
    };
  }

  function parsePurchaseOrdersXml(xmlDoc) {
    const poDetails = xmlDoc.getElementsByTagName("t_al_host_po_detail");
    const grouped = {};

    for (let i = 0; i < poDetails.length; i++) {
      const detail = poDetails[i];

      const poNumber = getTagValue(detail, "po_number", "Unknown PO Number");
      const warehouse = getTagValue(detail, "wh_id", "Unknown Warehouse");
      const lineNumber = getTagValue(detail, "line_number", "Unknown Line");
      const itemNumber = getTagValue(detail, "item_number", "Unknown Item");
      const quantity = Number(getTagValue(detail, "quantity", "0"));

      const key = `${poNumber}|||${warehouse}|||${lineNumber}|||${itemNumber}`;

      if (!grouped[key]) {
        grouped[key] = {
          poNumber,
          warehouse,
          lineNumber,
          itemNumber,
          quantity: 0,
        };
      }

      grouped[key].quantity += quantity;
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.poNumber !== b.poNumber) {
        return a.poNumber.localeCompare(b.poNumber);
      }

      if (a.warehouse !== b.warehouse) {
        return a.warehouse.localeCompare(b.warehouse);
      }

      const lineA = Number(a.lineNumber);
      const lineB = Number(b.lineNumber);

      if (!Number.isNaN(lineA) && !Number.isNaN(lineB) && lineA !== lineB) {
        return lineA - lineB;
      }

      if (a.lineNumber !== b.lineNumber) {
        return a.lineNumber.localeCompare(b.lineNumber);
      }

      return a.itemNumber.localeCompare(b.itemNumber);
    });
  }

  function getGrandTotal() {
    return results.reduce((sum, row) => sum + row.quantity, 0);
  }

  function renderShipmentsTable() {
    return (
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Order Number</th>
            <th>Item Number</th>
            <th>Quantity Shipped</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={`${row.orderNumber}-${row.itemNumber}-${index}`}>
              <td>{row.orderNumber}</td>
              <td>{row.itemNumber}</td>
              <td>{row.quantity}</td>
            </tr>
          ))}
          <tr className="table-primary fw-bold">
            <td colSpan="2">Grand Total</td>
            <td>{getGrandTotal()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  function renderOrdersTable() {
    return (
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Order Number</th>
            <th>Line Number</th>
            <th>Item Number</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={`${row.orderNumber}-${row.lineNumber}-${row.itemNumber}-${index}`}>
              <td>{row.orderNumber}</td>
              <td>{row.lineNumber}</td>
              <td>{row.itemNumber}</td>
              <td>{row.quantity}</td>
            </tr>
          ))}
          <tr className="table-primary fw-bold">
            <td colSpan="3">Grand Total</td>
            <td>{getGrandTotal()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  function renderReceiptsTable() {
    return (
      <>
        {meta.hasClose157 && (
          <div className="alert alert-info">
            A receipt close transaction with transaction code <strong>157</strong> was present in
            this XML file and was excluded from the detail results.
          </div>
        )}

        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>PO Number</th>
              <th>Warehouse</th>
              <th>PO Type</th>
              <th>Line Number</th>
              <th>Item Number</th>
              <th>Qty Received</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr
                key={`${row.poNumber}-${row.warehouse}-${row.poType}-${row.lineNumber}-${row.itemNumber}-${index}`}
              >
                <td>{row.poNumber}</td>
                <td>{row.warehouse}</td>
                <td>{row.poType}</td>
                <td>{row.lineNumber}</td>
                <td>{row.itemNumber}</td>
                <td>{row.quantity}</td>
              </tr>
            ))}
            <tr className="table-primary fw-bold">
              <td colSpan="5">Grand Total</td>
              <td>{getGrandTotal()}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }

  function renderPurchaseOrdersTable() {
    return (
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>PO Number</th>
            <th>Warehouse</th>
            <th>Line Number</th>
            <th>Item Number</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr
              key={`${row.poNumber}-${row.warehouse}-${row.lineNumber}-${row.itemNumber}-${index}`}
            >
              <td>{row.poNumber}</td>
              <td>{row.warehouse}</td>
              <td>{row.lineNumber}</td>
              <td>{row.itemNumber}</td>
              <td>{row.quantity}</td>
            </tr>
          ))}
          <tr className="table-primary fw-bold">
            <td colSpan="4">Grand Total</td>
            <td>{getGrandTotal()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  function renderResults() {
    if (results.length === 0 && !meta.hasClose157) return null;

    if (selectedType === "shipments") {
      return renderShipmentsTable();
    }

    if (selectedType === "orders") {
      return renderOrdersTable();
    }

    if (selectedType === "receipts") {
      return renderReceiptsTable();
    }

    if (selectedType === "purchaseOrders") {
      return renderPurchaseOrdersTable();
    }

    return null;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title mb-3">XML Totals Viewer</h4>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">XML Type</label>
              <select
                className="form-select"
                value={selectedType}
                onChange={handleTypeChange}
              >
                <option value="shipments">Shipments</option>
                <option value="orders">Orders</option>
                <option value="receipts">Receipts</option>
                <option value="purchaseOrders">Purchase Orders</option>
              </select>
            </div>

            <div className="col-md-8">
              <label className="form-label">Browse XML File</label>
              <input
                type="file"
                className="form-control"
                accept=".xml,text/xml"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {fileName && (
            <div className="mb-3">
              <span className="fw-semibold">Selected File:</span> {fileName}
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {renderResults()}
        </div>
      </div>
    </div>
  );
}