import React, { useState, useEffect } from 'react';
import Header from './header/Header';
import Modal from 'react-modal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Dashboard.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
}

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false
        }
      }
    ]
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="products-grid">
          {products.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="product-image-container">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="product-thumbnail"
                  />
                ) : (
                  <div className="no-image-placeholder">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="price-category">
                  <span className="price">{product.price}</span>
                  <span className="category">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="product-modal"
          overlayClassName="modal-overlay"
        >
          {selectedProduct && (
            <div className="modal-content">
              <button 
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
              
              <div className="carousel-container">
                {selectedProduct.images.length > 0 ? (
                  <Slider {...carouselSettings}>
                    {selectedProduct.images.map((image, index) => (
                      <div key={index} className="slide-container">
                        <img
                          src={image}
                          alt={`${selectedProduct.name} - ${index + 1}`}
                          className="carousel-image"
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div className="no-image-placeholder">No Images Available</div>
                )}
              </div>

              <div className="product-details">
                <h2>{selectedProduct.name}</h2>
                <div className="meta-info">
                  <span className="price">{selectedProduct.price}</span>
                  <span className="category">{selectedProduct.category}</span>
                </div>
                <p className="description">{selectedProduct.description}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;