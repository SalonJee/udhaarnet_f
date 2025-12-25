import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { calculateCreditScore, getRiskLevel } from '../utils/creditScore';

const API_URL = 'http://192.168.10.102:3000/api';

const BuyerHomeScreen = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const [credits, setCredits] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Poll for pending requests every 30 seconds
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCredits(), fetchCreditSummary(), fetchPendingRequests()]);
      setError(null);
    } catch (err) {
      setError('Unable to connect to server');
      console.warn('Network error. Please ensure backend server is running on http://192.168.10.102:3000');
    } finally {
      setLoading(false);
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
      console.warn('Unable to fetch credits. Please ensure backend is running.');
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
      console.warn('Unable to fetch credit summary. Please ensure backend is running.');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/credits/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const previousCount = pendingRequests.length;
        setPendingRequests(data);
        
        // Auto-show notifications if there are new pending requests
        if (data.length > 0 && data.length > previousCount) {
          setShowNotifications(true);
        }
      }
    } catch (err) {
      // Silently handle network errors to prevent app crashes
      console.warn('Unable to fetch pending requests. Please ensure backend is running.');
    }
  };

  const handleApproveCredit = async (creditId) => {
    try {
      const response = await fetch(`${API_URL}/credits/${creditId}/approve`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Alert.alert('Success', 'Credit request approved successfully');
        fetchPendingRequests();
        fetchCredits();
        fetchCreditSummary();
        setShowNotifications(false);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to approve credit');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to approve credit: ' + err.message);
    }
  };

  const handleRejectCredit = async (creditId) => {
    Alert.alert(
      'Reject Credit Request',
      'Are you sure you want to reject this credit request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/credits/${creditId}/reject`, {
                method: 'POST',
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Rejected by buyer' })
              });

              if (response.ok) {
                Alert.alert('Success', 'Credit request rejected');
                fetchPendingRequests();
                setShowNotifications(false);
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to reject credit');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to reject credit: ' + err.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Do you want to log out?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome, {user?.name || user?.profile?.name || 'Buyer'}!</Text>
          <Text style={styles.phoneNumber}>{user?.phoneNumber}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Text style={styles.icon}>🔔</Text>
            {pendingRequests.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Text style={styles.icon}>⏻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <View style={styles.notificationsPanel}>
          <View style={styles.notificationsPanelHeader}>
            <Text style={styles.notificationsPanelTitle}>Credit Requests</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyNotifications}>
              <Text style={styles.emptyNotificationsText}>No pending requests</Text>
            </View>
          ) : (
            <ScrollView style={styles.notificationsList}>
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.notificationItem}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationShopName}>{request.shopName || 'Shop'}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text style={styles.notificationSellerName}>
                    From: {request.sellerName}
                  </Text>
                  
                  <Text style={styles.notificationDescription}>
                    {request.description}
                  </Text>
                  
                  <Text style={styles.notificationAmount}>
                    Amount: Rs. {request.amount.toFixed(2)}
                  </Text>
                  
                  {request.dueDate && (
                    <Text style={styles.notificationDueDate}>
                      Due: {new Date(request.dueDate).toLocaleDateString()}
                    </Text>
                  )}
                  
                  <View style={styles.notificationActions}>
                    <TouchableOpacity
                      style={[styles.notificationButton, styles.approveButton]}
                      onPress={() => handleApproveCredit(request.id)}
                    >
                      <Text style={styles.notificationButtonText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.notificationButton, styles.rejectButton]}
                      onPress={() => handleRejectCredit(request.id)}
                    >
                      <Text style={styles.notificationButtonText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        renderCreditsTab()
      )}
    </ScrollView>
  );

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
            <Text style={styles.summaryValue}>${(creditSummary.activeAmount + creditSummary.pendingAmount).toFixed(2)}</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    marginRight: 15,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  phoneNumber: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 3,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#fff',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  notificationsPanel: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 500,
  },
  notificationsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
  },
  emptyNotificationsText: {
    color: '#999',
    fontSize: 14,
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationShopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  notificationSellerName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  notificationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9534f',
    marginBottom: 5,
  },
  notificationDueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  notificationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#5cb85c',
  },
  rejectButton: {
    backgroundColor: '#d9534f',
  },
  notificationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});

export default BuyerHomeScreen;
