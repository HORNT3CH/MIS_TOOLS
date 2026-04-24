import { Container, Card, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const toolSections = [
  {
    title: "SQL Tools",
    badge: "Database",
    className: "section-sql",
    items: [
      { to: "/app1", title: "Remove Double Quotes", desc: "Clean quoted values fast" },
      { to: "/app2", title: "Create From List", desc: "Build query-ready lists" },
      { to: "/app3", title: "Saved Queries", desc: "Access your saved SQL snippets" },
      { to: "/sql", title: "SQL Prettifier", desc: "Format SQL for readability" },
    ],
  },
  {
    title: "General Tools",
    badge: "Utility",
    className: "section-general",
    items: [
      { to: "/todo", title: "Todo App", desc: "Track quick tasks" },
      { to: "/case", title: "Case Converter", desc: "Convert text casing instantly" },
      { to: "/d365list", title: "D365 List", desc: "Work with D365 values" },
    ],
  },
  {
    title: "XML Tools",
    badge: "Markup",
    className: "section-xml",
    items: [
      { to: "/xml", title: "XML to JSON", desc: "Convert XML into JSON" },
      { to: "/xmlviewer", title: "XML Viewer", desc: "Inspect structured XML" },
      { to: "/xmlformatter", title: "XML Formatter", desc: "Beautify XML content" },
      { to: "/xmlvalidator", title: "XML Validator", desc: "Validate XML syntax" },
      { to: "/searchxml", title: "Search XML", desc: "Find tags and values quickly" },
      { to: "/xmlitemtotals", title: "XML Item Totals", desc: "Total XML item quantities" },
    ],
  },
  {
    title: "Search / Text",
    badge: "Text",
    className: "section-text",
    items: [
      { to: "/notepadsearch", title: "Notepad++ Regex Search", desc: "Build and test regex searches" },
    ],
  },
];

const Home = () => {
  return (
    <div className="home-page">
      <Container className="py-4 py-lg-5">
        <div className="dashboard-hero shadow-sm mb-5">
          <div>
            <p className="hero-eyebrow mb-2">Internal Toolkit</p>
            <h1 className="fw-bold mb-2">MIS Tools Dashboard</h1>
            <p className="hero-subtext mb-0">
              A cleaner, faster way to launch your SQL, XML, and utility tools.
            </p>
          </div>
        </div>

        {toolSections.map((section, idx) => (
          <section key={idx} className="mb-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className={`section-accent ${section.className}`}></div>
                <div>
                  <h4 className="mb-0 fw-bold">{section.title}</h4>
                </div>
              </div>

              <Badge pill className="section-badge">
                {section.badge}
              </Badge>
            </div>

            <Row>
              {section.items.map((item, index) => (
                <Col key={index} xs={12} sm={6} lg={4} xl={3} className="mb-4">
                  <Card className="tool-card-modern h-100 border-0">
                    <Card.Body className="p-4 d-flex flex-column">                      

                      <Card.Title className="fw-semibold mb-2">
                        {item.title}
                      </Card.Title>

                      <Card.Text className="tool-desc mb-4">
                        {item.desc}
                      </Card.Text>

                      <div className="mt-auto">
                        <Link
                          to={item.to}
                          className="stretched-link text-decoration-none tool-link fw-semibold"
                        >
                          Open Tool →
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        ))}
      </Container>
    </div>
  );
};

export default Home;