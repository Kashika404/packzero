import React, { useState, useEffect,useMemo  } from 'react';
import AddressForm from './components/AddressForm'; 
import Papa from 'papaparse';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import PackagingForm from './components/PackagingForm';
import PackagingList from './components/PackagingList';
import FillerForm from './components/FillerForm';
import FillerList from './components/FillerList';
import EditProductModal from './components/EditProductModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import RecommendationModal from './components/RecommendationModal';
import { Link } from 'react-router-dom'; 
import FilterControls from './components/FilterControls';

function App() {
  const [products, setProducts] = useState([]);
  const [packagingItems, setPackagingItems] = useState([]);
  const [fillers, setFillers] = useState([]);
  const [cart, setCart] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { user, logout, api } = useAuth();
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);

   const [productSearchTerm, setProductSearchTerm] = useState('');
  const [packagingSearchTerm, setPackagingSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all'); 
  const [packagingFilter, setPackagingFilter] = useState('all'); 

   const [fromAddress, setFromAddress] = useState({ name: "Shawn Ippotle", street1: "215 Clayton St.", city: "San Francisco", state: "CA", zip: "94117", country: "US", email: "shippotest.from@goshippo.com" });
  const [toAddress, setToAddress] = useState({ name: "Mr Hippo", street1: "965 Mission St #572", city: "San Francisco", state: "CA", zip: "94103", country: "US", email: "shippotest.to@goshippo.com" });

  const API_URL = 'http://localhost:8888/api';




  const filteredProducts = useMemo(() => {
    return products
        .filter(product => {
            if (productFilter === 'fragile') return product.isFragile;
            if (productFilter === 'not_fragile') return !product.isFragile;
            return true; 
        })
        .filter(product =>
            product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
        );
}, [products, productSearchTerm, productFilter]);

const filteredPackagingItems = useMemo(() => {
    return packagingItems
        .filter(item => {
            if (packagingFilter === 'all') return true;
            return item.type === packagingFilter;
        })
        .filter(item =>
            item.name.toLowerCase().includes(packagingSearchTerm.toLowerCase())
        );
}, [packagingItems, packagingSearchTerm, packagingFilter]);

 
  const fetchAllData = async () => {
    try {
      const [productsRes, packagingRes, fillersRes] = await Promise.all([
      
    
        api.get('/products'),
        api.get('/packaging'),
        api.get('/fillers'),
      ]);
      setProducts(productsRes.data);
      setPackagingItems(packagingRes.data);
      setFillers(fillersRes.data);
    } catch (error) {
      toast.error("Failed to fetch data from the server.");
      console.error('Error fetching data:', error);
    }
  };


useEffect(() => {
  
  if (api) {
    fetchAllData();
  }
}, [api]);

   const handleProductDelete = async (productId) => {
    
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted!");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

 

  const handlePackagingDelete = async (packagingId) => {

    try {
      await api.delete(`/packaging/${packagingId}`);
      toast.success("Packaging deleted!");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete packaging.");
    }
  };

   const handleFillerDelete = async (fillerId) => {

    try {
      await api.delete(`/fillers/${fillerId}`);
      toast.success("Filler deleted!");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete filler.");
    }
  };

  const handleOpenEditModal = (product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };
  const handleProductCreate = async (productData) => {
    try {
      await api.post('/products', productData);
      toast.success('Product created successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(`Failed to create product: ${error.response?.data?.message || 'Error'}`);
    }
  };
  

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProductToEdit(null);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    toast.info(`Added "${product.name}" to cart!`);
  };

    const removeFromCart = (indexToRemove) => {
    const itemNameToRemove = cart[indexToRemove].name;
    setCart(cart.filter((_, index) => index !== indexToRemove));
    toast.error(`Removed "${itemNameToRemove}" from cart`);
  };



  const getRecommendation = async () => {

    if (cart.length === 0) {
      toast.warn("Please add items to the cart first.");
      return;
    }
    try {
     
      const productIds = cart.map(p => p.id);
      const response = await api.post(`/recommend`, { productIds });
      
      setRecommendationResult({ ...response.data, cart: [...cart] });
      
     
      setIsRecommendationModalOpen(true);
      
      
      setCart([]);
      
    } catch (error) {
      
      toast.error(`Could not get recommendation: ${error.response?.data?.message || "An error occurred."}`);
    }
  };

  const handlePackagingCsvImport = (file) => {
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
     
        const processedData = results.data.map(row => ({
          ...row,
          length: parseFloat(row.length),
          width: parseFloat(row.width),
          height: parseFloat(row.height),
          maxWeight: parseFloat(row.maxWeight),
          cost: parseFloat(row.cost),
        }));

        try {
          const response = await api.post(`/packaging/bulk`, processedData);
          toast.success(`Successfully imported ${response.data.count} packaging items!`);
          fetchAllData();
        } catch (error) {
          const errorMessage = error.response?.data?.message || "An error occurred during import.";
          toast.error(`Import failed: ${errorMessage}`);
          console.error(error.response?.data?.details || error);
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file.");
        console.error(error);
      }
    });
  };



const handleFillerCsvImport = (file) => {
  if (!file) {
    toast.error("No file selected.");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
     
      const processedData = results.data;

      try {
        const response = await api.post(`/fillers/bulk`, processedData);
        toast.success(`Successfully imported ${response.data.count} filler items!`);
        fetchAllData(); 
      } catch (error) {
        const errorMessage = error.response?.data?.message || "An error occurred during import.";
        toast.error(`Import failed: ${errorMessage}`);
        console.error(error.response?.data?.details || error);
      }
    },
    error: (error) => {
      toast.error("Failed to parse CSV file.");
      console.error(error);
    }
  });
};


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick />
     

      <header className="bg-white shadow-sm">
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">PackZero Dashboard</h1>
         
          <div className="flex items-center gap-6">
             
            <Link to="/settings" className="text-gray-600 font-semibold hover:text-blue-600">
                {user?.email}
            </Link>
            <nav className="space-x-4">
                <Link to="/shipments" className="text-blue-600 font-semibold hover:underline">Shipment History</Link>
                <Link to="/analytics" className="text-blue-600 font-semibold hover:underline">View Analytics</Link>
            </nav>
        </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <section className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Order Recommendation</h2>
          <div className="bg-white p-4 rounded-lg">
            <strong className="block mb-2 text-gray-800">Cart Items:</strong>
            {cart.length > 0 ? (
           
                 <ul className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md animate-fade-in">
                    <span>
                      {item.name} {item.isFragile && <span className="text-red-500 font-semibold">(Fragile)</span>}
                    </span>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="Remove from cart"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Click "Add to Cart" on a product below.</p>
            )}
             <button onClick={getRecommendation} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={cart.length === 0}>
              Get Best Packaging
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Shipping Details</h2>
            <p className="text-sm text-gray-500 mb-4">Enter sender and recipient addresses to get live shipping rates.</p>
            <AddressForm 
                fromAddress={fromAddress}
                setFromAddress={setFromAddress}
                toAddress={toAddress}
                setToAddress={setToAddress}
            />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Product Inventory</h2>
               <FilterControls
            searchTerm={productSearchTerm}
            setSearchTerm={setProductSearchTerm}
            filter={productFilter}
            setFilter={setProductFilter}
            filterOptions={[
              { value: 'all', label: 'All' },
              { value: 'fragile', label: 'Fragile' },
              { value: 'not_fragile', label: 'Not Fragile' }
            ]}
            searchPlaceholder="Search products by name..."
          />
              <ProductList products={filteredProducts} onDelete={handleProductDelete} onAddToCart={addToCart} onEdit={handleOpenEditModal} />
              <hr className="my-6"/>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Add a New Product</h3>
         
              <ProductForm onProductSubmit={handleProductCreate} />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">

              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Packaging Inventory</h2>

              <FilterControls
            searchTerm={packagingSearchTerm}
            setSearchTerm={setPackagingSearchTerm}
            filter={packagingFilter}
            setFilter={setPackagingFilter}
            filterOptions={[
              { value: 'all', label: 'All' },
              { value: 'BOX', label: 'Boxes' },
              { value: 'MAILER', label: 'Mailers' }
            ]}
            searchPlaceholder="Search packaging by name..."
          />

              <PackagingList items={filteredPackagingItems}  onDelete={handlePackagingDelete} />

               <div className="mt-6 border-t pt-6">
                <label 
                  htmlFor="csv-import"
                  className="w-full text-center block bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer"
                >
                  Import from CSV
                </label>
                <input
                  type="file"
                  id="csv-import"
                  accept=".csv"
                  className="hidden" 
                  onChange={(e) => handlePackagingCsvImport(e.target.files[0])}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Must have headers: name, type, length, width, height, maxWeight, cost
                </p>
              </div>
              <hr className="my-6"/>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Add New Packaging</h3>
              <PackagingForm onPackagingCreated={fetchAllData} />
            </div>
           

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Protective Fillers</h2>
              <FillerList items={fillers} onDelete={handleFillerDelete} />
              <div className="mt-6 border-t pt-6">
                <label 
                  htmlFor="filler-csv-import"
                  className="w-full text-center block bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer"
                >
                  Import Fillers from CSV
                </label>
                <input
                  type="file"
                  id="filler-csv-import"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFillerCsvImport(e.target.files[0])}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Header: name
                </p>
              </div>
              <hr className="my-6"/>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Or Add Manually</h3>
              <FillerForm onFillerCreated={fetchAllData} />
            </div>
          </div>
        </div>
      </main>

      <EditProductModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} product={productToEdit} onProductUpdated={fetchAllData} />
       
       <RecommendationModal isOpen={isRecommendationModalOpen} onClose={() => setIsRecommendationModalOpen(false)} results={recommendationResult} fromAddress={fromAddress} toAddress={toAddress} />
    </div>
  );
}

export default App;



