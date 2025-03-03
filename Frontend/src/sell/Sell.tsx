import { FC, useState, useEffect } from 'react';
import Header from '../header/Header';
import Modal from 'react-modal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Sell.css';
import { authService, ProductRequest, ProductResponse } from '../AuthService';

Modal.setAppElement('#root');


interface Product {
  id: string;
  name: string;
  description: string;
  price: string;      
  category: string;
  images: string[];   
}

const Sell: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);

  const [productData, setProductData] = useState<{
    id?: string;                       
    name: string;
    description: string;
    price: string;                
    category: string;
    images: (File | string)[];
  }>({
    id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
  });

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

  function base64ToFile(base64Data: string, filename: string): File {
    const [meta, base64String] = base64Data.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const binary = atob(base64String); // decode base64
    const array = new Uint8Array(binary.length);
  
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
  
    return new File([array], filename, { type: mime });
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const savedProducts = await authService.getListing();
        if (savedProducts) {

          const updatedProducts: Product[] = savedProducts.map((prod) => ({
            id: prod.id,
            name: prod.name,
            description: prod.description,
            price: prod.price,    
            category: prod.category,
            images: prod.images, 
          }));
          setProducts(updatedProducts);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };
  
    fetchListings();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNumber = parseFloat(productData.price);
    if (isNaN(priceNumber)) {
      alert('Please enter a valid price');
      return;
    }
    

    if (productData.id) {

      const fileImages = productData.images.map((img, index) => {
        if (typeof img === 'string') {
          return base64ToFile(img, `existing-image-${index}.png`);
        } else {
          return img;
        }
      });

      const updateProductData: ProductRequest = {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: priceNumber,
        category: productData.category,
        images: fileImages,
      };

      const responseProducts: ProductResponse[] = await authService.updateProduct(updateProductData);

      
      const updatedProducts: Product[] = responseProducts.map((prod) => ({
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,    
        category: prod.category,
        images: prod.images, 
      }));
      
      setProducts(updatedProducts);
    } 

    else {
      try {
        const fileImages = productData.images.filter((img) => img instanceof File) as File[];
        const newProduct: ProductRequest = {
          id: productData.id ? productData.id : '',
          name: productData.name,
          description: productData.description,
          price: priceNumber, 
          category: productData.category,
          images: fileImages
        };
        const responseProducts = await authService.createProduct(newProduct);

        const newProducts: Product[] = responseProducts.map((prod) => ({
          id: prod.id,
          name: prod.name,
          description: prod.description,
          price: prod.price, 
          category: prod.category,
          images: prod.images,     
        }));

        setProducts(newProducts);

      } catch (error) {
        console.error('Error creating product:', error);
      }
    }

    setIsModalOpen(false);
    setProductData({
      id: '',
      name: '',
      description: '',
      price: '',
      category: '',
      images: [],
    });
  };

  const handleDelete = async (productId: string) => {
    const res = await authService.deleteListing(productId);
    const newProducts: Product[] = res.map((prod) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price, 
      category: prod.category,
      images: prod.images,     
    }));

    setProducts(newProducts);
  };

  const handleEdit = (product: Product) => {

    setProductData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.replace('$', ''),
      category: product.category,
      images: product.images, 
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      setProductData((prev) => ({
        ...prev,
        images: [...prev.images, ...incomingFiles],
      }));
    }
  };

  // Remove image from the array
  const removeImage = (index: number) => {
    const newImages = productData.images.filter((_, i) => i !== index);
    setProductData((prev) => ({ ...prev, images: newImages }));
  };

  // Card component for displaying a single product
  const ProductCard: FC<{ product: Product }> = ({ product }) => {
    return (
      <div className="product-card">
        <div className="image-carousel">
          {product.images.length > 0 ? (
            <Slider {...carouselSettings}>
              {product.images.map((img, index) => (
                <div key={index}>
                  <img src={img} alt={`Product ${index}`} className="product-image" />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="no-image-placeholder">No Images</div>
          )}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <div className="meta-info">
            <span className="price">{product.price}</span>
            <span className="category">{product.category}</span>
          </div>
          <p className="description">{product.description}</p>
          <div className="product-actions">
            <button className="edit-btn" onClick={() => handleEdit(product)}>
              Edit
            </button>
            <button className="delete-btn" onClick={() => handleDelete(product.id)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <div className="sell-container">
        <h2 className="listings-header">My Listings</h2>
        
        <div className="listings-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="empty-state">
              <p>No listings found. Create your first one!</p>
            </div>
          )}
        </div>

        <button 
          className="floating-action-btn"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              maxWidth: '600px',
              width: '90%',
              borderRadius: '12px',
              padding: '2rem',
            },
          }}
          overlayClassName="modal-overlay"
          className="modal-content"
        >
          <h2 className="listing">{productData.id ? 'Edit Listing' : 'Create New Listing'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                required
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                required
                step="0.01"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                required
                value={productData.category}
                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <div className="image-previews">
                {productData.images.map((img, index) => {
                  // If it's already a string, use it directly; otherwise create an object URL
                  const previewUrl =
                    typeof img === 'string' ? img : URL.createObjectURL(img);
                  return (
                    <div key={index} className="image-preview-container">
                      <img
                        src={previewUrl}
                        alt={`Preview ${index}`}
                        className="preview-image"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setProductData({
                    id: '',
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    images: [],
                  });
                }}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {productData.id ? 'Save Changes' : 'List Item'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Sell;
