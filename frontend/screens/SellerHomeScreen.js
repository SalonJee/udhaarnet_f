import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { calculateCreditScore, formatCreditScore, getRiskLevel } from '../utils/creditScore';

const API_URL = 'http://192.168.8.121:3000/api';

const SellerHomeScreen = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);
  const [buyerCreditScores, setBuyerCreditScores] = useState({});
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    pendingVerifications: 0,
    overdueCount: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [addCreditModalVisible, setAddCreditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [newCreditForm, setNewCreditForm] = useState({
    buyerName: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchSellerData();
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const response = await fetch(`${API_URL}/credits/buyers/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch buyers list');
      }

      const buyersList = await response.json();
      setBuyers(buyersList);
    } catch (err) {
      console.log('Failed to fetch buyers:', err.message);
      // Don't show alert, just log silently
    }
  };

  const fetchSellerData = async () => {
    try {
      setLoading(true);

      // Fetch real credits from API
      const response = await fetch(`${API_URL}/credits/seller-credits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch credits');
      }

      const apiCredits = await response.json();
      console.log('Fetched credits:', apiCredits);
      setCredits(apiCredits);

      // Calculate credit scores for each buyer
      const scoreMap = {};
      apiCredits.forEach((credit) => {
        if (!scoreMap[credit.buyerId]) {
          scoreMap[credit.buyerId] = [];
        }
        scoreMap[credit.buyerId].push(credit);
      });

      const creditScores = {};
      Object.keys(scoreMap).forEach((buyerId) => {
        const transactions = scoreMap[buyerId];
        const score = calculateCreditScore(transactions);
        const riskLevel = getRiskLevel(score);
        creditScores[buyerId] = {
          score,
          riskLevel,
          formatted: formatCreditScore(score, riskLevel),
        };
      });

      setBuyerCreditScores(creditScores);

      // Calculate stats
      const totalOutstanding = apiCredits
        .filter(c => c.status !== 'paid')
        .reduce((sum, c) => sum + c.amount, 0);
      const pendingVerifications = apiCredits.filter(c => c.status === 'pending').length;
      const overdueCount = apiCredits.filter(c => c.status === 'overdue').length;

      setStats({
        totalOutstanding,
        pendingVerifications,
        overdueCount,
      });
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to fetch seller data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.navigate('RoleSelection');
  };

  const openPaymentModal = (transaction) => {
    setSelectedTransaction(transaction);
    setPaymentMethod('Cash');
    setPaymentReference('');
    setPaymentNotes('');
    setModalVisible(true);
  };

  const closePaymentModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  const openAddCreditModal = () => {
    setNewCreditForm({
      buyerName: '',
      amount: '',
      description: '',
      dueDate: '',
    });
    setAddCreditModalVisible(true);
  };

  const closeAddCreditModal = () => {
    setAddCreditModalVisible(false);
    setNewCreditForm({
      buyerName: '',
      amount: '',
      description: '',
      dueDate: '',
    });
  };

  const handleAddCredit = async () => {
    // Validation
    if (!newCreditForm.buyerName.trim()) {
      Alert.alert('Error', 'Please enter buyer name');
      return;
    }

    if (!newCreditForm.amount || parseFloat(newCreditForm.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!newCreditForm.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/credits/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerName: newCreditForm.buyerName.trim(),
          amount: parseFloat(newCreditForm.amount),
          description: newCreditForm.description.trim(),
          dueDate: newCreditForm.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add credit');
      }

      Alert.alert('Success', `Credit of Rs. ${newCreditForm.amount} added for ${newCreditForm.buyerName}`);
      closeAddCreditModal();

      // Refresh data immediately
      await fetchSellerData();
    } catch (err) {
      console.error('Add credit error:', err);
      Alert.alert('Error', 'Failed to add credit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/credits/${selectedTransaction.id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          paymentReference,
          notes: paymentNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      Alert.alert('Success', `Payment recorded for Rs. ${selectedTransaction.amount}`);
      closePaymentModal();
      await fetchSellerData(); // Refresh data
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'Failed to record payment: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'verified':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      case 'late':
        return '#FF5722';
      default:
        return '#666';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentMethodOptions = () => [
    'Cash',
    'eSewa',
    'Khalti',
    'FonePay',
    'Bank Transfer',
  ];

  const handleExportCSV = async () => {
    if (credits.length === 0) {
      Alert.alert('No Data', 'There are no credits to export');
      return;
    }

    try {
      // Create CSV content
      const headers = ['ID', 'Buyer Name', 'Amount', 'Description', 'Status', 'Created Date', 'Due Date', 'Paid Date', 'Payment Method'];
      const rows = credits.map(credit => [
        credit.id,
        credit.buyerName || 'Unknown',
        credit.amount,
        credit.description,
        credit.status,
        new Date(credit.createdAt).toLocaleDateString(),
        credit.dueDate ? new Date(credit.dueDate).toLocaleDateString() : 'N/A',
        credit.paidDate ? new Date(credit.paidDate).toLocaleDateString() : 'N/A',
        credit.paymentMethod || 'N/A',
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      // For mobile, use Share API
      if (Platform.OS !== 'web') {
        await Share.share({
          message: csvContent,
          title: 'Credits Export',
        });
      } else {
        // For web, create downloadable file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `credits_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        Alert.alert('Success', 'CSV file downloaded successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export CSV: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.profile?.name || 'Seller'}!</Text>
          <Text style={styles.shopName}>🏪 {user?.profile?.shopName || 'Shop'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>Rs. {stats.totalOutstanding.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Outstanding</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏳</Text>
          <Text style={styles.statValue}>{stats.pendingVerifications}</Text>
          <Text style={styles.statLabel}>Pending Verifications</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⚠️</Text>
          <Text style={styles.statValue}>{stats.overdueCount}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openAddCreditModal}>
          <Text style={styles.btnText}>➕ Add New Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => Alert.alert('All Credits', `You have ${credits.length} total credits with Rs. ${credits.reduce((sum, c) => sum + c.amount, 0).toFixed(2)} in outstanding amounts`)}>
          <Text style={styles.btnText}>📋 View All Credits</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleExportCSV}>
          <Text style={styles.btnText}>📥 Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions ({credits.length})</Text>

        {credits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first credit to get started</Text>
          </View>
        ) : (
          credits.map((transaction) => {
            const creditScore = buyerCreditScores[transaction.buyerId];
            const riskInfo = creditScore?.riskLevel;

            return (
              <View
                key={transaction.id}
                style={[
                  styles.transactionCard,
                  { borderLeftColor: getStatusColor(transaction.status) },
                ]}
              >
                <View style={styles.transactionHeader}>
                  <Text style={styles.buyerName}>👤 {transaction.buyerName}</Text>
                  <Text style={styles.amount}>Rs. {transaction.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.transactionBody}>
                  <Text style={styles.description}>
                    {transaction.description || 'No description'}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.date}>
                      📅 {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(transaction.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{getStatusDisplay(transaction.status)}</Text>
                    </View>
                  </View>
                </View>

                {/* Credit Score Card */}
                {riskInfo && (
                  <View
                    style={[
                      styles.creditScoreCard,
                      { backgroundColor: riskInfo.backgroundColor },
                    ]}
                  >
                    <View style={styles.creditScoreInfo}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                        {riskInfo.icon}
                      </Text>
                      <View>
                        <Text style={styles.creditScoreLabel}>Buyer Credit Score</Text>
                        <Text style={[styles.creditScore, { color: riskInfo.color }]}>
                          {creditScore.formatted.displayText}
                        </Text>
                        <Text style={{ fontSize: 12, color: riskInfo.color }}>
                          Risk: {riskInfo.level}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.transactionActions}>
                  <TouchableOpacity style={[styles.btn, styles.btnSmall]}>
                    <Text style={styles.btnSmallText}>Details</Text>
                  </TouchableOpacity>
                  {(transaction.status === 'verified' || transaction.status === 'overdue' || transaction.status === 'pending') && (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnSmallSuccess]}
                      onPress={() => openPaymentModal(transaction)}
                    >
                      <Text style={styles.btnSmallText}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Payment Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>

            {selectedTransaction && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>
                  Buyer: {selectedTransaction.buyerName}
                </Text>
                <Text style={styles.modalInfoLabel}>
                  Amount: Rs. {selectedTransaction.amount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                {getPaymentMethodOptions().map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.pickerOption,
                      paymentMethod === method && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        paymentMethod === method && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reference Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter reference number (optional)"
                value={paymentReference}
                onChangeText={setPaymentReference}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter notes (optional)"
                value={paymentNotes}
                onChangeText={setPaymentNotes}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={closePaymentModal}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleMarkPaid}>
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Credit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addCreditModalVisible}
        onRequestClose={closeAddCreditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Credit</Text>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Buyer *</Text>
                <View style={styles.pickerContainer}>
                  {buyers.length > 0 ? (
                    buyers.map((buyer) => (
                      <TouchableOpacity
                        key={buyer.id}
                        style={[
                          styles.pickerOption,
                          newCreditForm.buyerName === buyer.name && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setNewCreditForm({ ...newCreditForm, buyerName: buyer.name })}
                        disabled={submitting}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            newCreditForm.buyerName === buyer.name && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {buyer.name}
                        </Text>
                        <Text style={styles.pickerOptionSubtext}>
                          {buyer.municipality}, Ward {buyer.wardNumber}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyStateText}>No buyers available</Text>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (Rs.) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                  value={newCreditForm.amount}
                  onChangeText={(text) =>
                    setNewCreditForm({ ...newCreditForm, amount: text })
                  }
                  editable={!submitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Enter description"
                  multiline
                  value={newCreditForm.description}
                  onChangeText={(text) =>
                    setNewCreditForm({ ...newCreditForm, description: text })
                  }
                  editable={!submitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Due Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newCreditForm.dueDate}
                  onChangeText={(text) =>
                    setNewCreditForm({ ...newCreditForm, dueDate: text })
                  }
                  editable={!submitting}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={closeAddCreditModal}
                disabled={submitting}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleAddCredit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>Add Credit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  header: {
    backgroundColor: '#FF9500',
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
  shopName: {
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
  statsGrid: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#FF9500',
  },
  btnSecondary: {
    backgroundColor: '#2196F3',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSmall: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnSmallSuccess: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  transactionBody: {
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  creditScoreCard: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 6,
  },
  creditScoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditScoreLabel: {
    fontSize: 11,
    color: '#666',
  },
  creditScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  modalInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  pickerOptionSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerOptionSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    paddingVertical: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
});

export default SellerHomeScreen;