import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Group, Member, Collection, MemberSummary, GroupSummary, OverallSummary, WeeklyData } from '@/types';

interface DataContextType {
  groups: Group[];
  members: Member[];
  collections: Collection[];
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addCollection: (collection: Omit<Collection, 'id' | 'principalPaid' | 'interestPaid'>) => void;
  updateCollection: (id: string, collection: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  getMemberSummary: (memberId: string) => MemberSummary | null;
  getAllMemberSummaries: () => MemberSummary[];
  getGroupSummary: (groupNo: string) => GroupSummary | null;
  getAllGroupSummaries: () => GroupSummary[];
  getOverallSummary: () => OverallSummary;
  getWeeklyData: () => WeeklyData[];
  getCollectionsForWeek: (weekNo: number) => Collection[];
  getExpectedCollectionsForWeek: (weekNo: number) => MemberSummary[];
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to generate ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Sample data for demonstration
const sampleGroups: Group[] = [
  { id: '1', groupNo: 'G001', groupName: 'Sakthi Group', groupHeadName: 'Lakshmi Devi', headContact: '9876543210', meetingDay: 'Monday', formationDate: '2024-01-15' },
  { id: '2', groupNo: 'G002', groupName: 'Anbu Group', groupHeadName: 'Kumar Raj', headContact: '9876543211', meetingDay: 'Tuesday', formationDate: '2024-02-01' },
  { id: '3', groupNo: 'G003', groupName: 'Vetri Group', groupHeadName: 'Saroja M', headContact: '9876543212', meetingDay: 'Wednesday', formationDate: '2024-02-15' },
];

const sampleMembers: Member[] = [
  { id: '1', memberId: 'M001', memberName: 'Lakshmi Devi', address: '12 Gandhi Street', landmark: 'Near Temple', groupNo: 'G001', loanAmount: 10000, totalInterest: 4000, weeks: 14, startDate: '2025-01-01', status: 'Active' },
  { id: '2', memberId: 'M002', memberName: 'Kumar Raj', address: '45 Nehru Road', landmark: 'Bus Stand', groupNo: 'G001', loanAmount: 15000, totalInterest: 6000, weeks: 14, startDate: '2025-01-01', status: 'Active' },
  { id: '3', memberId: 'M003', memberName: 'Saroja M', address: '78 Anna Nagar', landmark: 'School', groupNo: 'G002', loanAmount: 20000, totalInterest: 8000, weeks: 14, startDate: '2025-01-01', status: 'Active' },
  { id: '4', memberId: 'M004', memberName: 'Ravi K', address: '23 Main Road', landmark: 'Hospital', groupNo: 'G002', loanAmount: 12000, totalInterest: 4800, weeks: 14, startDate: '2025-01-01', status: 'Active' },
  { id: '5', memberId: 'M005', memberName: 'Meena S', address: '56 Park Avenue', landmark: 'Market', groupNo: 'G003', loanAmount: 8000, totalInterest: 3200, weeks: 14, startDate: '2025-01-01', status: 'Active' },
];

const sampleCollections: Collection[] = [
  { id: '1', collectionDate: '2025-01-06', memberId: 'M001', groupNo: 'G001', weekNo: 1, amountPaid: 1000, principalPaid: 714.29, interestPaid: 285.71, status: 'Paid', collectedBy: 'Agent 1' },
  { id: '2', collectionDate: '2025-01-06', memberId: 'M002', groupNo: 'G001', weekNo: 1, amountPaid: 1500, principalPaid: 1071.43, interestPaid: 428.57, status: 'Paid', collectedBy: 'Agent 1' },
  { id: '3', collectionDate: '2025-01-13', memberId: 'M001', groupNo: 'G001', weekNo: 2, amountPaid: 1000, principalPaid: 714.29, interestPaid: 285.71, status: 'Paid', collectedBy: 'Agent 1' },
  { id: '4', collectionDate: '2025-01-13', memberId: 'M002', groupNo: 'G001', weekNo: 2, amountPaid: 1500, principalPaid: 1071.43, interestPaid: 428.57, status: 'Paid', collectedBy: 'Agent 1' },
  { id: '5', collectionDate: '2025-01-20', memberId: 'M001', groupNo: 'G001', weekNo: 3, amountPaid: 1000, principalPaid: 714.29, interestPaid: 285.71, status: 'Paid', collectedBy: 'Agent 1' },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('microfinance_groups');
    return saved ? JSON.parse(saved) : sampleGroups;
  });
  
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('microfinance_members');
    return saved ? JSON.parse(saved) : sampleMembers;
  });
  
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('microfinance_collections');
    return saved ? JSON.parse(saved) : sampleCollections;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('microfinance_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('microfinance_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('microfinance_collections', JSON.stringify(collections));
  }, [collections]);

  // Group operations
  const addGroup = useCallback((group: Omit<Group, 'id'>) => {
    setGroups(prev => [...prev, { ...group, id: generateId() }]);
  }, []);

  const updateGroup = useCallback((id: string, group: Partial<Group>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...group } : g));
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  // Member operations
  const addMember = useCallback((member: Omit<Member, 'id'>) => {
    setMembers(prev => [...prev, { ...member, id: generateId() }]);
  }, []);

  const updateMember = useCallback((id: string, member: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...member } : m));
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  // Collection operations
  const addCollection = useCallback((collection: Omit<Collection, 'id' | 'principalPaid' | 'interestPaid'>) => {
    const member = members.find(m => m.memberId === collection.memberId);
    if (!member) return;

    const totalPayable = member.loanAmount + member.totalInterest;
    const principalRatio = member.loanAmount / totalPayable;
    const interestRatio = member.totalInterest / totalPayable;

    const principalPaid = Math.round(collection.amountPaid * principalRatio * 100) / 100;
    const interestPaid = Math.round(collection.amountPaid * interestRatio * 100) / 100;

    setCollections(prev => [...prev, {
      ...collection,
      id: generateId(),
      principalPaid,
      interestPaid
    }]);
  }, [members]);

  const updateCollection = useCallback((id: string, collection: Partial<Collection>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...collection } : c));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  // Summary calculations
  const getMemberSummary = useCallback((memberId: string): MemberSummary | null => {
    const member = members.find(m => m.memberId === memberId);
    if (!member) return null;

    const memberCollections = collections.filter(c => c.memberId === memberId);
    const totalPrincipalCollected = memberCollections.reduce((sum, c) => sum + c.principalPaid, 0);
    const totalInterestCollected = memberCollections.reduce((sum, c) => sum + c.interestPaid, 0);
    const totalPayable = member.loanAmount + member.totalInterest;

    return {
      memberId: member.memberId,
      memberName: member.memberName,
      groupNo: member.groupNo,
      loanAmount: member.loanAmount,
      totalPayable,
      totalPrincipalCollected,
      totalInterestCollected,
      principalBalance: member.loanAmount - totalPrincipalCollected,
      interestBalance: member.totalInterest - totalInterestCollected,
      totalCollected: totalPrincipalCollected + totalInterestCollected,
      totalBalance: totalPayable - (totalPrincipalCollected + totalInterestCollected),
      weeksPaid: memberCollections.length,
      status: member.status
    };
  }, [members, collections]);

  const getAllMemberSummaries = useCallback((): MemberSummary[] => {
    return members.map(m => getMemberSummary(m.memberId)).filter((s): s is MemberSummary => s !== null);
  }, [members, getMemberSummary]);

  const getGroupSummary = useCallback((groupNo: string): GroupSummary | null => {
    const group = groups.find(g => g.groupNo === groupNo);
    if (!group) return null;

    const groupMembers = members.filter(m => m.groupNo === groupNo);
    const groupCollections = collections.filter(c => c.groupNo === groupNo);

    const totalLoanAmount = groupMembers.reduce((sum, m) => sum + m.loanAmount, 0);
    const totalInterestAmount = groupMembers.reduce((sum, m) => sum + m.totalInterest, 0);
    const totalPayable = totalLoanAmount + totalInterestAmount;

    const principalCollected = groupCollections.reduce((sum, c) => sum + c.principalPaid, 0);
    const interestCollected = groupCollections.reduce((sum, c) => sum + c.interestPaid, 0);
    const totalCollected = principalCollected + interestCollected;

    return {
      groupNo: group.groupNo,
      groupName: group.groupName,
      groupHead: group.groupHeadName,
      totalMembers: groupMembers.length,
      totalLoanAmount,
      totalPayable,
      principalCollected,
      interestCollected,
      principalBalance: totalLoanAmount - principalCollected,
      interestBalance: totalInterestAmount - interestCollected,
      totalCollected,
      totalBalance: totalPayable - totalCollected,
      collectionRate: totalPayable > 0 ? Math.round((totalCollected / totalPayable) * 10000) / 100 : 0
    };
  }, [groups, members, collections]);

  const getAllGroupSummaries = useCallback((): GroupSummary[] => {
    return groups.map(g => getGroupSummary(g.groupNo)).filter((s): s is GroupSummary => s !== null);
  }, [groups, getGroupSummary]);

  const getOverallSummary = useCallback((): OverallSummary => {
    const totalLoanDisbursed = members.reduce((sum, m) => sum + m.loanAmount, 0);
    const totalInterestAmount = members.reduce((sum, m) => sum + m.totalInterest, 0);
    const totalPayable = totalLoanDisbursed + totalInterestAmount;

    const totalPrincipalCollected = collections.reduce((sum, c) => sum + c.principalPaid, 0);
    const totalInterestCollected = collections.reduce((sum, c) => sum + c.interestPaid, 0);
    const totalAmountCollected = totalPrincipalCollected + totalInterestCollected;

    const activeLoans = members.filter(m => m.status === 'Active').length;
    const completedLoans = members.filter(m => m.status === 'Completed').length;

    return {
      totalGroups: groups.length,
      totalMembers: members.length,
      activeLoans,
      completedLoans,
      totalLoanDisbursed,
      totalPayable,
      totalPrincipalCollected,
      totalInterestCollected,
      totalAmountCollected,
      principalBalanceOutstanding: totalLoanDisbursed - totalPrincipalCollected,
      interestBalanceOutstanding: totalInterestAmount - totalInterestCollected,
      totalBalanceOutstanding: totalPayable - totalAmountCollected,
      overallCollectionRate: totalPayable > 0 ? Math.round((totalAmountCollected / totalPayable) * 10000) / 100 : 0,
      principalRecoveryRate: totalLoanDisbursed > 0 ? Math.round((totalPrincipalCollected / totalLoanDisbursed) * 10000) / 100 : 0,
      interestRecoveryRate: totalInterestAmount > 0 ? Math.round((totalInterestCollected / totalInterestAmount) * 10000) / 100 : 0,
      averageLoanSize: members.length > 0 ? Math.round((totalLoanDisbursed / members.length) * 100) / 100 : 0
    };
  }, [groups, members, collections]);

  const getWeeklyData = useCallback((): WeeklyData[] => {
    const maxWeek = Math.max(...collections.map(c => c.weekNo), 0);
    const weeklyData: WeeklyData[] = [];

    for (let weekNo = 1; weekNo <= maxWeek; weekNo++) {
      const weekCollections = collections.filter(c => c.weekNo === weekNo);
      weeklyData.push({
        weekNo,
        amountCollected: weekCollections.reduce((sum, c) => sum + c.amountPaid, 0),
        numberOfPayments: weekCollections.length
      });
    }

    return weeklyData;
  }, [collections]);

  const getCollectionsForWeek = useCallback((weekNo: number): Collection[] => {
    return collections.filter(c => c.weekNo === weekNo);
  }, [collections]);

  const getExpectedCollectionsForWeek = useCallback((_weekNo: number): MemberSummary[] => {
    const allSummaries = getAllMemberSummaries();
    return allSummaries.filter(summary => {
      const member = members.find(m => m.memberId === summary.memberId);
      if (!member) return false;
      return summary.weeksPaid < member.weeks && member.status === 'Active';
    });
  }, [getAllMemberSummaries, members]);

  // Export/Import
  const exportToJSON = useCallback((): string => {
    return JSON.stringify({ groups, members, collections }, null, 2);
  }, [groups, members, collections]);

  const importFromJSON = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.groups) setGroups(data.groups);
      if (data.members) setMembers(data.members);
      if (data.collections) setCollections(data.collections);
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  }, []);

  const clearAllData = useCallback(() => {
    setGroups([]);
    setMembers([]);
    setCollections([]);
  }, []);

  const value = useMemo(() => ({
    groups,
    members,
    collections,
    addGroup,
    updateGroup,
    deleteGroup,
    addMember,
    updateMember,
    deleteMember,
    addCollection,
    updateCollection,
    deleteCollection,
    getMemberSummary,
    getAllMemberSummaries,
    getGroupSummary,
    getAllGroupSummaries,
    getOverallSummary,
    getWeeklyData,
    getCollectionsForWeek,
    getExpectedCollectionsForWeek,
    exportToJSON,
    importFromJSON,
    clearAllData
  }), [
    groups, members, collections,
    addGroup, updateGroup, deleteGroup,
    addMember, updateMember, deleteMember,
    addCollection, updateCollection, deleteCollection,
    getMemberSummary, getAllMemberSummaries,
    getGroupSummary, getAllGroupSummaries,
    getOverallSummary, getWeeklyData,
    getCollectionsForWeek, getExpectedCollectionsForWeek,
    exportToJSON, importFromJSON, clearAllData
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
