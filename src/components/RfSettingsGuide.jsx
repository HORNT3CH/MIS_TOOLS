import { useState } from "react";
import { Container, Card, Button, Row, Col, Image, Badge } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

const RfSettingsGuide = () => {
  // Auto-generate image list Config 001.jpg → Config020.jpg
  const images = Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(3, "0");
    return {
      src: `/images/rf-settings/config ${num}.jpg`,
      title: `Config Step ${i + 1}`
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = images[currentIndex];

  const goPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
        <Card.Header className="bg-dark text-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1">RF Config Guide</h3>
            <div className="text-white-50">
              Step-by-step configuration images
            </div>
          </div>

          <Badge bg="primary" className="fs-6 px-3 py-2">
            {currentIndex + 1} / {images.length}
          </Badge>
        </Card.Header>

        <Card.Body className="bg-light p-4">
          <Row className="align-items-center">
            {/* Prev */}
            <Col xs="auto">
              <Button
                variant="dark"
                className="rounded-circle"
                style={{ width: 50, height: 50 }}
                onClick={goPrevious}
              >
                <ChevronLeft size={26} />
              </Button>
            </Col>

            {/* Image */}
            <Col>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center">
                  <h5 className="mb-3">{currentImage.title}</h5>

                  <Image
                    src={currentImage.src}
                    alt={currentImage.title}
                    fluid
                    rounded
                    style={{
                      maxHeight: "650px",
                      objectFit: "contain",
                      backgroundColor: "#fff"
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Next */}
            <Col xs="auto">
              <Button
                variant="dark"
                className="rounded-circle"
                style={{ width: 50, height: 50 }}
                onClick={goNext}
              >
                <ChevronRight size={26} />
              </Button>
            </Col>
          </Row>

          {/* Quick jump buttons */}
          <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
            {images.map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={index === currentIndex ? "primary" : "outline-secondary"}
                className="rounded-pill"
                onClick={() => goToImage(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RfSettingsGuide;