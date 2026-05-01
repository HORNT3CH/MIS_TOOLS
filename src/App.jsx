import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
} from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Button,
  NavDropdown,
} from "react-bootstrap";
import Home from "./components/Home";
import App1 from "./components/App1";
import App2 from "./components/App2";
import App3 from "./components/App3";
import TodoApp from "./components/TodoApp";
import XmlToJsonConverter from "./components/XmlToJsonConverter";
import SqlPrettifier from "./components/SqlPrettifier";
import CaseConverter from "./components/CaseConverter";
import XmlViewer from "./components/XmlViewer";
import D365List from "./components/D365List";
import XmlFormatter from "./components/XmlFormatter";
import XmlValidator from "./components/XmlValidator";
import SearchXml from "./components/SearchXML";
import NotepadSearch from "./components/NotepadSearch";
import XmlItemTotals from "./components/XmlItemTotals";
import RfSettingsGuide from "./components/RfSettingsGuide";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
        style={{ minHeight: "100vh" }}
      >
        <Navbar
          expand="lg"
          sticky="top"
          bg={darkMode ? "dark" : "white"}
          variant={darkMode ? "dark" : "light"}
          className="shadow-sm border-bottom"
        >
          <Container fluid="lg">
            <Navbar.Brand
              as={Link}
              to="/"
              className="fw-bold d-flex align-items-center gap-2"
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: darkMode ? "#0dcaf0" : "#0d6efd",
                }}
              ></span>
              MIS Tools
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="main-navbar-nav" />

            <Navbar.Collapse id="main-navbar-nav">
              <Nav className="me-auto align-items-lg-center gap-lg-1">
                <Nav.Link as={Link} to="/" className="fw-semibold">
                  Home
                </Nav.Link>

                {/* ✅ SQL TOOLS */}
                <NavDropdown title="SQL Tools" id="sql-tools-dropdown">
                  <NavDropdown.Item as={Link} to="/app1">
                    Remove Double Quotes
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/app2">
                    Create From List
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/app3">
                    Saved Queries
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/sql">
                    SQL Prettifier
                  </NavDropdown.Item>
                </NavDropdown>

                {/* GENERAL TOOLS */}
                <NavDropdown title="General Tools" id="general-tools-dropdown">
                  <NavDropdown.Item as={Link} to="/todo">
                    Todo
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/case">
                    Case Converter
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/d365list">
                    D365 List
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/rfsettingsguide">
                    RF Settings Guide
                  </NavDropdown.Item>
                </NavDropdown>

                {/* XML TOOLS */}
                <NavDropdown title="XML Tools" id="xml-tools-dropdown">
                  <NavDropdown.Item as={Link} to="/xml">
                    XML to JSON
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/xmlviewer">
                    XML Viewer
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/xmlformatter">
                    XML Formatter
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/xmlvalidator">
                    XML Validator
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/searchxml">
                    Search XML
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/xmlitemtotals">
                    XML Item Totals
                  </NavDropdown.Item>
                </NavDropdown>

                {/* SEARCH / TEXT */}
                <NavDropdown title="Search / Text" id="search-tools-dropdown">
                  <NavDropdown.Item as={Link} to="/notepadsearch">
                    Notepad++ Search Regex
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>

              <div className="d-flex align-items-center mt-3 mt-lg-0">
                <Button
                  variant={darkMode ? "outline-light" : "outline-dark"}
                  onClick={() => setDarkMode(!darkMode)}
                  className="fw-semibold px-3"
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </Button>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app1" element={<App1 />} />
            <Route path="/app2" element={<App2 />} />
            <Route path="/app3" element={<App3 />} />
            <Route path="/todo" element={<TodoApp />} />
            <Route path="/xml" element={<XmlToJsonConverter />} />
            <Route path="/sql" element={<SqlPrettifier />} />
            <Route path="/case" element={<CaseConverter />} />
            <Route path="/xmlviewer" element={<XmlViewer />} />
            <Route path="/d365list" element={<D365List />} />
            <Route path="/xmlformatter" element={<XmlFormatter />} />
            <Route path="/searchxml" element={<SearchXml />} />
            <Route path="/notepadsearch" element={<NotepadSearch />} />
            <Route path="/xmlvalidator" element={<XmlValidator />} />
            <Route path="/xmlitemtotals" element={<XmlItemTotals />} />
            <Route path="/rfsettingsguide" element={<RfSettingsGuide />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;