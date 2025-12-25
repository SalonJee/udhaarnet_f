/**
 * Credit Score Mechanism
 * 
 * Base Score: 50
 * 
 * Calculation:
 * + On-time payments: +40 points (weighted by percentage)
 * - Late payments: -30 points (weighted by percentage)
 * - Overdue payments: -40 points (weighted by percentage)
 * 
 * Risk Levels:
 * - Good: 70-100 (Green)
 * - Medium: 40-69 (Yellow)
 * - High: 0-39 (Red)
 */

const BASE_SCORE = 50;
const ON_TIME_BONUS = 40;
const LATE_PENALTY = 30;
const OVERDUE_PENALTY = 40;

export const calculateCreditScore = (transactions = []) => {
  if (!transactions || transactions.length === 0) {
    return BASE_SCORE;
  }

  let score = BASE_SCORE;
  
  const onTimeCount = transactions.filter(t => t.status === 'paid' || t.status === 'verified').length;
  const lateCount = transactions.filter(t => t.status === 'late').length;
  const overdueCount = transactions.filter(t => t.status === 'overdue').length;
  
  const totalTransactions = transactions.length;
  
  // Calculate percentages
  const onTimePercentage = totalTransactions > 0 ? onTimeCount / totalTransactions : 0;
  const latePercentage = totalTransactions > 0 ? lateCount / totalTransactions : 0;
  const overduePercentage = totalTransactions > 0 ? overdueCount / totalTransactions : 0;
  
  // Apply weighted calculations
  score += onTimePercentage * ON_TIME_BONUS;
  score -= latePercentage * LATE_PENALTY;
  score -= overduePercentage * OVERDUE_PENALTY;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getRiskLevel = (score) => {
  if (score >= 70) {
    return {
      level: 'Good',
      color: '#4CAF50',
      backgroundColor: '#E8F5E9',
      icon: '✓',
    };
  } else if (score >= 40) {
    return {
      level: 'Medium',
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      icon: '⚠',
    };
  } else {
    return {
      level: 'High',
      color: '#F44336',
      backgroundColor: '#FFEBEE',
      icon: '✕',
    };
  }
};

export const formatCreditScore = (score, riskLevel) => {
  return {
    score: Math.round(score),
    riskLevel,
    displayText: `${Math.round(score)}/100`,
  };
};
