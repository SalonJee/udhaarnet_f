import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { calculateCreditScore, getRiskLevel } from '../utils/creditScore';

const API_URL = 'http://192.168.8.121:3000/api';

const BuyerHomeScreen = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [credits, setCredits] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'credits'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCredits(), fetchCreditSummary()]);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Product fetch error:', err);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${API_URL}/credits/buyer-credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (err) {
      console.error('Credits fetch error:', err);
    }
  };

  const fetchCreditSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/credits/buyer-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCreditSummary(data);
      }
    } catch (err) {
      console.error('Summary fetch error:', err);
    }
  };

  const handleAddToCart = (product) => {
    Alert.alert('Added to Cart', `${product.name} added to cart!`);
  };

  const handleLogout = () => {
    logout();
    navigation.navigate('RoleSelection');
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, Buyer!</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>

        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>📦 Products</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'credits' && styles.activeTab]}
          onPress={() => setActiveTab('credits')}
        >
          <Text style={[styles.tabText, activeTab === 'credits' && styles.activeTabText]}>💳 My Credits</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : activeTab === 'products' ? (
        renderProductsTab()
      ) : (
        renderCreditsTab()
      )}
    </ScrollView>
  );

  function renderProductsTab() {
    return (
      <>
        <View style={styles.searchContainer}>
          <Text style={styles.searchPlaceholder}>🔍 Search products...</Text>
        </View>

        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {categories.map((category, idx) => (
                  <View key={idx} style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>📦</Text>
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Products</Text>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>No products available</Text>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImage}>
                  <Text style={styles.productImageText}>📦</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addToCartBtn}
                  onPress={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <Text style={styles.addToCartText}>{product.stock > 0 ? 'Add' : 'Out'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Browse our collection...</Text>
        </View>
      </>
    );
  }

  function renderCreditsTab() {
    if (!creditSummary) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No credit information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.creditsSection}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Outstanding</Text>
            <Text style={styles.summaryValue}>${(creditSummary.verifiedAmount + creditSummary.pendingAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryValue, { color: '#d9534f' }]}>${creditSummary.overdueAmount?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: '#5cb85c' }]}>${creditSummary.paidAmount?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {/* Credits List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History & Debts</Text>
          {credits.length === 0 ? (
            <Text style={styles.emptyText}>No credit records</Text>
          ) : (
            credits.map((credit) => {
              const riskLevel = getRiskLevel(calculateCreditScore([credit]));
              const riskColor = riskLevel === 'Good' ? '#5cb85c' : riskLevel === 'Medium' ? '#f0ad4e' : '#d9534f';
              
              return (
                <View key={credit.id} style={styles.creditCard}>
                  <View style={styles.creditHeader}>
                    <View style={styles.sellerInfo}>
                      <Text style={styles.sellerName}>{credit.sellerName || 'Unknown Seller'}</Text>
                      <Text style={styles.creditDescription}>{credit.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: riskColor }]}>
                      <Text style={styles.statusText}>{credit.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.creditDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={styles.detailValue}>${credit.amount.toFixed(2)}</Text>
                    </View>
                    {credit.dueDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Due Date:</Text>
                        <Text style={styles.detailValue}>{new Date(credit.dueDate).toLocaleDateString()}</Text>
                      </View>
                    )}
                    {credit.paidDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Paid Date:</Text>
                        <Text style={styles.detailValue}>{new Date(credit.paidDate).toLocaleDateString()}</Text>
                      </View>
                    )}
                    {credit.paymentMethod && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method:</Text>
                        <Text style={styles.detailValue}>{credit.paymentMethod}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Keep your payments on time to maintain good credit standing</Text>
        </View>
      </View>
    );
  }

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  searchContainer: {
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  creditsSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImageText: {
    fontSize: 40,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 3,
  },
  productStock: {
    fontSize: 11,
    color: '#666',
  },
  addToCartBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  creditCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  creditDescription: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  creditDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffe0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#c33',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  emptyStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});

export default BuyerHomeScreen;
