import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, TouchableHighlight } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchProduct = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]); // To store search suggestions
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null); // To store user data
  const [products, setProducts] = useState<any[]>([]); // To store list of products
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set()); // Store selected categories
  const router = useRouter();

  // Create a ref for the TextInput to focus on it programmatically
  const searchInputRef = useRef<TextInput>(null);

  // Fetch user data to get userId
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data); // Store the complete user data
    } catch (error) {
      console.error('Error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('https://finalccspayment.onrender.com/api/auth/products/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Server error details:', errorDetails);
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data); // Store the list of products
      setFilteredProducts(data); // Show all products by default
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product click
  const handleProductClick = (productId: number) => {
    if (!productId) {
      console.error('Product ID is undefined');
      return;
    }
    router.push(`/ProductDetails?productId=${productId}`);
  };

  // Filter products based on search term and update suggestions
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);

    if (searchTerm.trim() === '') {
      setSuggestions([]); // If search term is empty, clear suggestions
      return;
    }

    // Real-time filtering by name, description, price, category
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm) || // If searching by price
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);

    // Set suggestions for autocomplete
    const matchingSuggestions = filtered.map(product => ({
      id: product.product_id,
      name: product.name,
    }));

    setSuggestions(matchingSuggestions);
  };

  // Handle category filter
  const toggleCategory = (category: string) => {
    const newSelectedCategories = new Set(selectedCategories);
    if (newSelectedCategories.has(category)) {
      newSelectedCategories.delete(category); // Unselect category
    } else {
      newSelectedCategories.add(category); // Select category
    }
    setSelectedCategories(newSelectedCategories);

    // Filter products based on selected categories
    if (newSelectedCategories.size > 0) {
      const filtered = products.filter(product =>
        newSelectedCategories.has(product.category)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products); // Show all products if no category is selected
    }
  };

  // Get unique categories from the products list
  const getCategories = () => {
    const categories = new Set(products.map(product => product.category));
    return Array.from(categories);
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data to get userId
    fetchProducts(); // Fetch products

    // Focus on the search input when the component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <TextInput
        ref={searchInputRef} // Assign the ref to the input
        style={styles.searchInput}
        placeholder="Search Products..."
        value={searchTerm}
        onChangeText={handleSearch} // Update on every input change for real-time filtering
        autoFocus={true} // Automatically focus the input when the component mounts
      />

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {/* Category Filter Buttons */}
          <View style={styles.categoryContainer}>
            {getCategories().map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  selectedCategories.has(category) && styles.selectedCategoryButton,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategories.has(category) && styles.selectedCategoryButtonText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Suggestions Display */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <TouchableHighlight
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleProductClick(suggestion.id)}
                >
                  <Text>{suggestion.name}</Text>
                </TouchableHighlight>
              ))}
            </View>
          )}

          {/* Product Grid */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.productContainer,
                  index % 2 === 0 ? { marginRight: 10 } : null, // Add margin for spacing between items
                ]}
                onPress={() => handleProductClick(item.product_id)} // Handle click on the container
              >
                {item.product_image ? (
                  <Image
                    source={{ uri: item.product_image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text>No Image Available</Text>
                )}
                <Text style={styles.productName}>{item.name}</Text>
                <Text>₱{item.price}</Text>
              </TouchableOpacity>
            )}
            numColumns={2} // Display 2 products per row
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1B3A28',
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    backgroundColor: '#004d00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryButton: {
    backgroundColor: '#004d00',
  },
  categoryButtonText: {
    color: '#333',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200, // Limit the height of the suggestions list
    marginBottom: 10,
    padding: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  productContainer: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  productImage: {
    width: 160,
    height: 160,
    marginBottom: 10,
    borderRadius: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default SearchProduct;
