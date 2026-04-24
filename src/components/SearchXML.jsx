import { useState } from 'react';

const SearchXML = () => {
  const [rows, setRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');

        const allElements = xmlDoc.getElementsByTagName('*');
        const parsedRows = [];

        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i];
          if (el.children.length === 0 && el.textContent.trim()) {
            parsedRows.push({
              tag: el.tagName,
              value: el.textContent.trim()
            });
          }
        }

        setRows(parsedRows);
      } catch {
        alert('Invalid XML file.');
      }
    };

    reader.readAsText(file);
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    
  };

  const matchesSearch = (value) =>
    searchValue &&
    value.toLowerCase().includes(searchValue.toLowerCase());

  const hasMatch = rows.some((row) => matchesSearch(row.value));

  return (
    <div className="container text-center my-5">
      <h1 className="mb-4">Search XML</h1>

      <input
        type="text"
        placeholder="Enter value to highlight"
        value={searchValue}
        onChange={handleSearchChange}
        className="form-control w-50 mx-auto mb-2"
      />

      {/* Alert if no match found and input is not empty */}
      {searchValue && rows.length > 0 && !hasMatch && (
        <div className="alert alert-danger w-50 mx-auto mb-3">
          String Not Found
        </div>
      )}

      <input
        type="file"
        accept=".xml"
        onChange={handleFileChange}
        className="form-control w-50 mx-auto mb-4"
      />

      {rows.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>ELEMENT</th>
                <th>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={matchesSearch(row.value) ? 'table-warning' : ''}
                >
                  <td><strong>{row.tag}</strong></td>
                  <td><strong>{row.value}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchXML;
