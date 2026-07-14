import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import PurchaseView from './components/PurchaseView';
import EmployeeView from './components/EmployeeView';
import AccountingView from './components/AccountingView';
import BankingAndLoanView from './components/BankingAndLoanView';
import ReportsView from './components/ReportsView';
import GridReportView from './components/GridReportView';
import RdlReportView from './components/RdlReportView';
import Login from './components/Login';
import CRMView from './components/CRMView';
import ProjectsView from './components/ProjectsView';
import ManufacturingView from './components/ManufacturingView';
import ServiceView from './components/ServiceView';
import DocumentsView from './components/DocumentsView';
import WorkflowView from './components/WorkflowView';
import AIView from './components/AIView';
import IntegrationView from './components/IntegrationView';
import FixedAssetsView from './components/FixedAssetsView';
import { navEngine } from './lib/navigationEngine';

import {
  seedCollectionIfEmpty,
  fetchCollectionFromFirestore,
  saveSettingsToFirestore,
  syncCollectionToFirestore,
  db,
  onAuthStateChange,
  signOutUser,
} from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import {
  Product,
  Customer,
  Supplier,
  Invoice,
  PurchaseOrder,
  BankAccount,
  Transaction,
  AccountHead,
  Employee,
  Attendance,
  LoanAccount,
  AppSettings,
} from './types';

import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PO,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ACCOUNT_HEADS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LOANS,
} from './data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentSubTab, setCurrentSubTab] = useState('');
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [globalAlert, setGlobalAlert] = useState<{ message: string; title: string; type: 'info' | 'error' | 'success' } | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message: any) => {
      const msgStr = String(message);
      let alertType: 'info' | 'error' | 'success' = 'info';
      let alertTitle = 'Notification';
      
      const lower = msgStr.toLowerCase();
      if (
        lower.includes('error') || 
        lower.includes('cannot') || 
        lower.includes('invalid') || 
        lower.includes('insufficient') || 
        lower.includes('failed') || 
        lower.includes('required') || 
        lower.includes('please')
      ) {
        alertType = 'error';
        alertTitle = 'System Alert / Error';
      } else if (
        lower.includes('success') || 
        lower.includes('completed') || 
        lower.includes('registered') || 
        lower.includes('saved') || 
        lower.includes('dispatched') || 
        lower.includes('loaded') || 
        lower.includes('registered successfully') ||
        lower.includes('complete!')
      ) {
        alertType = 'success';
        alertTitle = 'Success Confirmation';
      }
      
      setGlobalAlert({
        message: msgStr,
        title: alertTitle,
        type: alertType,
      });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profile = userDocSnap.data();
            setCurrentUser(profile);
            localStorage.setItem('nexova_current_user', JSON.stringify(profile));
          } else {
            // Profile doc doesn't exist yet, we'll let Login component create it on first sign-in
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('nexova_current_user');
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('nexova_current_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error("Error during log out:", e);
    }
  };

  const DEFAULT_SETTINGS: AppSettings = {
    companyName: 'M/S Madani Traders',
    companyAddress: 'Dhaka Sadar Head Office, Dhaka, Bangladesh',
    phone: '01712345678',
    tinNumber: '382910384812',
    binNumber: '002849182-0201',
    tradeLicense: 'TRAD/DNCC/029103/2026',
    defaultVatRate: 5,
    defaultDiscountRate: 0,
    baseCurrency: '৳',
    receiptFooterMessage: 'Thank you for choosing Nexova ERP! Please visit again.',
    autoPrintReceipt: true,
    enableSmsNotification: false,
    defaultWarehouse: 'Main Depot, Dhaka',
    defaultUnit: 'Pcs',
    lowStockThreshold: 5,
    timezone: 'Asia/Dhaka',
    taxes: [
      { id: '1', name: 'Standard VAT', rate: 5, type: 'Sales', status: 'Active' },
      { id: '2', name: 'Supplementary Duty (SD)', rate: 10, type: 'Both', status: 'Active' },
      { id: '3', name: 'Import Custom Duty', rate: 15, type: 'Purchase', status: 'Active' },
      { id: '4', name: 'Zero Rated Tax', rate: 0, type: 'Both', status: 'Active' },
    ],
    paymentMethods: [
      { id: '1', name: 'Cash on Hand', type: 'Cash', charge: 0, status: 'Active' },
      { id: '2', name: 'bKash Merchant Pay', type: 'Mobile Wallet', charge: 1.5, status: 'Active' },
      { id: '3', name: 'Nagad Business Account', type: 'Mobile Wallet', charge: 1.0, status: 'Active' },
      { id: '4', name: 'Mutual Trust Bank Transfer', type: 'Bank', charge: 0, status: 'Active' },
      { id: '5', name: 'Visa/Mastercard Terminal', type: 'Card Gateway', charge: 2.0, status: 'Active' },
    ],
    usersList: [
      { id: '1', name: 'Rony Mia', username: 'admin_rony', email: 'ronymia2022@gmail.com', role: 'Administrator', status: 'Active', avatar: 'RM' },
      { id: '2', name: 'Tasnim Ahmed', username: 'tasnim_mgr', email: 'tasnim@madani.com', role: 'Manager', status: 'Active', avatar: 'TA' },
      { id: '3', name: 'Sabbir Rahman', username: 'sabbir_csh', email: 'sabbir@madani.com', role: 'Cashier', status: 'Active', avatar: 'SR' },
      { id: '4', name: 'Sumona Yasmin', username: 'sumona_sales', email: 'sumona@madani.com', role: 'Sales Agent', status: 'Inactive', avatar: 'SY' },
    ],
  };

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nexova_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_SETTINGS;
  });

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nexova_app_settings', JSON.stringify(newSettings));
    try {
      await saveSettingsToFirestore(newSettings);
    } catch (e) {
      console.error("Error saving settings to Firestore:", e);
    }
  };

  // Core shared state engines
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>([]);

  useEffect(() => {
    localStorage.setItem('nexova_products_count', String(products.length));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexova_invoices_count', String(invoices.length));
  }, [invoices]);

  const [loading, setLoading] = useState(true);

  // Firestore initial load & seed effect
  useEffect(() => {
    if (!authChecked) return;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // Load settings
        const settingsDocs = await fetchCollectionFromFirestore<any>('settings');
        const appSettingsDoc = settingsDocs.find(d => d.id === 'app');
        if (appSettingsDoc) {
          // Remove the id field added by fetchCollectionFromFirestore to match AppSettings type
          const { id, ...sanitizedSettings } = appSettingsDoc;
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...sanitizedSettings,
            // Ensure usersList is loaded if missing
            usersList: (sanitizedSettings.usersList && sanitizedSettings.usersList.length > 0)
              ? sanitizedSettings.usersList
              : DEFAULT_SETTINGS.usersList
          };
          setSettings(mergedSettings as AppSettings);
        } else {
          await saveSettingsToFirestore(DEFAULT_SETTINGS);
          setSettings(DEFAULT_SETTINGS);
        }

        // Seed or load collections
        const seededProducts = await seedCollectionIfEmpty('products', INITIAL_PRODUCTS);
        setProducts(seededProducts);

        const seededCustomers = await seedCollectionIfEmpty('customers', INITIAL_CUSTOMERS);
        setCustomers(seededCustomers);

        const seededSuppliers = await seedCollectionIfEmpty('suppliers', INITIAL_SUPPLIERS);
        setSuppliers(seededSuppliers);

        const seededInvoices = await seedCollectionIfEmpty('invoices', INITIAL_INVOICES);
        setInvoices(seededInvoices);

        const seededPOs = await seedCollectionIfEmpty('purchaseOrders', INITIAL_PO);
        setPurchaseOrders(seededPOs);

        const seededBankAccounts = await seedCollectionIfEmpty('bankAccounts', INITIAL_BANK_ACCOUNTS);
        setBankAccounts(seededBankAccounts);

        const seededTransactions = await seedCollectionIfEmpty('transactions', INITIAL_TRANSACTIONS);
        setTransactions(seededTransactions);

        const seededAccountHeads = await seedCollectionIfEmpty('accountHeads', INITIAL_ACCOUNT_HEADS);
        setAccountHeads(seededAccountHeads);

        const seededEmployees = await seedCollectionIfEmpty('employees', INITIAL_EMPLOYEES);
        setEmployees(seededEmployees);

        const seededAttendances = await seedCollectionIfEmpty('attendances', INITIAL_ATTENDANCE);
        setAttendances(seededAttendances);

        const seededLoans = await seedCollectionIfEmpty('loanAccounts', INITIAL_LOANS);
        setLoanAccounts(seededLoans);
      } catch (e) {
        console.error('Error loading Firestore data on mount:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, authChecked]);

  // Synchronize changes to Firestore when states update, AFTER initial load is done!
  useEffect(() => {
    if (loading || !currentUser) return;
    saveSettingsToFirestore(settings);
  }, [settings, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('products', products);
  }, [products, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('customers', customers);
  }, [customers, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('suppliers', suppliers);
  }, [suppliers, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('invoices', invoices);
  }, [invoices, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('purchaseOrders', purchaseOrders);
  }, [purchaseOrders, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('bankAccounts', bankAccounts);
  }, [bankAccounts, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('transactions', transactions);
  }, [transactions, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('accountHeads', accountHeads);
  }, [accountHeads, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('employees', employees);
  }, [employees, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('attendances', attendances);
  }, [attendances, loading, currentUser]);

  useEffect(() => {
    if (loading || !currentUser) return;
    syncCollectionToFirestore('loanAccounts', loanAccounts);
  }, [loanAccounts, loading, currentUser]);

  // --- STATE MUTATION HANDLERS ---

  // INVENTORY MUTATORS
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const p: Product = {
      ...newProd,
      id: `p_dynamic_${Date.now()}`,
    };
    setProducts((prev) => [...prev, p]);
  };

  const handleEditStock = (productId: string, newStockVal: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStockVal } : p))
    );
  };

  // CUSTOMER MUTATORS
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'outstandingBalance'>) => {
    const c: Customer = {
      ...newCust,
      id: `c_dynamic_${Date.now()}`,
      outstandingBalance: 0,
    };
    setCustomers((prev) => [...prev, c]);
  };

  const handleRecordCollection = (customerId: string, amount: number) => {
    // 1. Subtract from customer outstanding
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) }
          : c
      )
    );

    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    // 2. Deposit into bank account (Default to first cash account)
    setBankAccounts((prev) =>
      prev.map((b, idx) => (idx === 0 ? { ...b, balance: b.balance + amount } : b))
    );

    // 3. Log transaction ledger entry
    const newTx: Transaction = {
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Collection receipt from ${targetCustomer.name}`,
      type: 'Deposit',
      amount: amount,
      accountId: bankAccounts[0]?.id || 'b1',
      category: 'Dues Collection',
      referenceNo: `REC-${Date.now().toString().slice(-4)}`,
    };
    setTransactions((prev) => [...prev, newTx]);

    // 4. Update ledger accounts balances
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '1010') {
          // Cash in Hand
          return { ...ah, balance: ah.balance + amount };
        }
        if (ah.code === '1030') {
          // Accounts Receivable
          return { ...ah, balance: Math.max(0, ah.balance - amount) };
        }
        return ah;
      })
    );
  };

  // SALES / POS MUTATORS
  const handleAddInvoice = (newInvoice: Invoice) => {
    // 1. Append invoice
    setInvoices((prev) => [...prev, newInvoice]);

    // 2. Subtract product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = newInvoice.items.find((it) => it.productId === p.id);
        if (soldItem) {
          return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
        }
        return p;
      })
    );

    // 3. Add to accounts / transactions depending on payment method
    if (newInvoice.paymentMethod === 'Credit') {
      // Add outstanding credit to customer
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newInvoice.customerId
            ? { ...c, outstandingBalance: c.outstandingBalance + newInvoice.total }
            : c
        )
      );

      // Log transaction as Deposit but with pending payment method indicator
      const newTx: Transaction = {
        id: `tx_dynamic_${Date.now()}`,
        date: newInvoice.date,
        description: `Credit sale matching invoice ${newInvoice.invoiceNo}`,
        type: 'Deposit',
        amount: newInvoice.total,
        accountId: 'b1', // references Cash in Hand
        category: 'Sales Income',
        referenceNo: newInvoice.invoiceNo,
      };
      setTransactions((prev) => [...prev, newTx]);

      // Update Chart of accounts
      setAccountHeads((prev) =>
        prev.map((ah) => {
          if (ah.code === '1030') {
            // Accounts Receivable increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          if (ah.code === '4010') {
            // Sales Revenue increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          return ah;
        })
      );
    } else {
      // Cash/Mobile Deposit instantly
      const targetBankIdx = newInvoice.paymentMethod === 'Mobile Banking' ? 2 : 0; // index of bank to deposit
      setBankAccounts((prev) =>
        prev.map((b, idx) =>
          idx === targetBankIdx ? { ...b, balance: b.balance + newInvoice.total } : b
        )
      );

      const newTx: Transaction = {
        id: `tx_dynamic_${Date.now()}`,
        date: newInvoice.date,
        description: `${newInvoice.paymentMethod} sale matching invoice ${newInvoice.invoiceNo}`,
        type: 'Deposit',
        amount: newInvoice.total,
        accountId: bankAccounts[targetBankIdx]?.id || 'b1',
        category: 'Sales Income',
        referenceNo: newInvoice.invoiceNo,
      };
      setTransactions((prev) => [...prev, newTx]);

      // Update Chart of accounts
      setAccountHeads((prev) =>
        prev.map((ah) => {
          if (ah.code === '1010') {
            // Cash in Hand increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          if (ah.code === '4010') {
            // Sales Revenue increases
            return { ...ah, balance: ah.balance + newInvoice.total };
          }
          return ah;
        })
      );
    }
  };

  // PURCHASE MUTATORS
  const handleAddSupplier = (newSup: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const s: Supplier = {
      ...newSup,
      id: `s_dynamic_${Date.now()}`,
      outstandingBalance: 0,
    };
    setSuppliers((prev) => [...prev, s]);
  };

  const handleAddPurchaseOrder = (newPO: PurchaseOrder) => {
    setPurchaseOrders((prev) => [...prev, newPO]);
  };

  const handleReceivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // 1. Change PO status
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Received' as const } : p))
    );

    // 2. Replenish inventory product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const item = po.items.find((line) => line.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      })
    );

    // 3. Increase Supplier outstanding balance (Payables credit ledger)
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === po.supplierId ? { ...s, outstandingBalance: s.outstandingBalance + po.total } : s
      )
    );

    // 4. Log Cost transaction ledger
    const newTx: Transaction = {
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Replenished product inventory matching PO ${po.poNo}`,
      type: 'Withdrawal',
      amount: po.total,
      accountId: 'b1',
      category: 'Cost of Goods Sold',
      referenceNo: po.poNo,
    };
    setTransactions((prev) => [...prev, newTx]);

    // 5. Update chart of accounts (Accounts Payable and Cost of Goods Sold)
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '2010') {
          // Accounts Payable increases
          return { ...ah, balance: ah.balance + po.total };
        }
        if (ah.code === '5010') {
          // Cost of Goods Sold increases
          return { ...ah, balance: ah.balance + po.total };
        }
        return ah;
      })
    );
  };

  // HRM MUTATORS
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const e: Employee = {
      ...newEmp,
      id: `e_dynamic_${Date.now()}`,
    };
    setEmployees((prev) => [...prev, e]);
  };

  const handleUpdateAttendance = (employeeId: string, status: Attendance['status']) => {
    const targetEmployee = employees.find((e) => e.id === employeeId);
    if (!targetEmployee) return;

    const todayDate = new Date().toISOString().split('T')[0];

    setAttendances((prev) => {
      const existing = prev.find((a) => a.employeeId === employeeId && a.date === todayDate);
      if (existing) {
        return prev.map((a) =>
          a.employeeId === employeeId && a.date === todayDate
            ? {
                ...a,
                status,
                checkIn: status === 'Present' ? '08:50 AM' : status === 'Late' ? '09:25 AM' : '—',
                checkOut: status === 'Present' || status === 'Late' ? '05:00 PM' : '—',
              }
            : a
        );
      } else {
        const newAtt: Attendance = {
          id: `att_dynamic_${Date.now()}`,
          employeeId,
          employeeName: targetEmployee.name,
          date: todayDate,
          status,
          checkIn: status === 'Present' ? '08:50 AM' : status === 'Late' ? '09:25 AM' : '—',
          checkOut: status === 'Present' || status === 'Late' ? '05:00 PM' : '—',
        };
        return [...prev, newAtt];
      }
    });
  };

  // BANKING & LOAN MUTATORS
  const handleAddBankAccount = (newBank: Omit<BankAccount, 'id' | 'balance'>) => {
    const b: BankAccount = {
      ...newBank,
      id: `b_dynamic_${Date.now()}`,
      balance: 0,
    };
    setBankAccounts((prev) => [...prev, b]);
  };

  const handleAddLoan = (newLoan: Omit<LoanAccount, 'id' | 'accountNo' | 'disbursedAmount' | 'outstandingAmount' | 'status'>) => {
    const accountNo = `LN-DBBL-2026-${400 + loanAccounts.length}`;
    const l: LoanAccount = {
      ...newLoan,
      id: `l_dynamic_${Date.now()}`,
      accountNo,
      disbursedAmount: newLoan.amount,
      outstandingAmount: newLoan.amount,
      status: 'Active',
    };
    setLoanAccounts((prev) => [...prev, l]);
  };

  const handleLogTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions((prev) => [...prev, newTx]);

    // Deduct or deposit from bank account
    setBankAccounts((prev) =>
      prev.map((b) => {
        if (b.id === tx.accountId) {
          const delta = tx.type === 'Deposit' || tx.type === 'Income' ? tx.amount : -tx.amount;
          return { ...b, balance: b.balance + delta };
        }
        return b;
      })
    );

    // Update Chart of accounts balances
    setAccountHeads((prev) =>
      prev.map((ah) => {
        if (ah.code === '1010') {
          // Cash in Hand adjusted
          const delta = tx.type === 'Deposit' || tx.type === 'Income' ? tx.amount : -tx.amount;
          return { ...ah, balance: ah.balance + delta };
        }
        return ah;
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to default demo values? All your changes will be lost!')) {
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setSuppliers(INITIAL_SUPPLIERS);
      setInvoices(INITIAL_INVOICES);
      setPurchaseOrders(INITIAL_PO);
      setBankAccounts(INITIAL_BANK_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setAccountHeads(INITIAL_ACCOUNT_HEADS);
      setEmployees(INITIAL_EMPLOYEES);
      setAttendances(INITIAL_ATTENDANCE);
      setLoanAccounts(INITIAL_LOANS);
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('nexova_app_settings');
      alert('Database successfully reset to demo defaults!');
    }
  };

  const handleImportData = (importedData: any) => {
    try {
      if (importedData.products) setProducts(importedData.products);
      if (importedData.customers) setCustomers(importedData.customers);
      if (importedData.suppliers) setSuppliers(importedData.suppliers);
      if (importedData.invoices) setInvoices(importedData.invoices);
      if (importedData.purchaseOrders) setPurchaseOrders(importedData.purchaseOrders);
      if (importedData.bankAccounts) setBankAccounts(importedData.bankAccounts);
      if (importedData.transactions) setTransactions(importedData.transactions);
      if (importedData.accountHeads) setAccountHeads(importedData.accountHeads);
      if (importedData.employees) setEmployees(importedData.employees);
      if (importedData.attendances) setAttendances(importedData.attendances);
      if (importedData.loanAccounts) setLoanAccounts(importedData.loanAccounts);
      if (importedData.settings) {
        setSettings(importedData.settings);
        localStorage.setItem('nexova_app_settings', JSON.stringify(importedData.settings));
      }
      alert('System Database imported successfully!');
    } catch (err) {
      alert('Failed to import database. Invalid JSON schema.');
    }
  };

  const systemData = {
    products,
    customers,
    suppliers,
    invoices,
    purchaseOrders,
    bankAccounts,
    transactions,
    accountHeads,
    employees,
    attendances,
    loanAccounts,
    settings,
  };

  // Handle high-level shortcut routing from Dashboard view
  const handleTabChange = (tab: string, subTab: string = '') => {
    setCurrentTab(tab);
    setCurrentSubTab(subTab);
    
    // Track recent navigation item visits
    const matchedItem = navEngine.getAllItems().find(item => item.tab === tab && item.subTab === subTab);
    if (matchedItem) {
      navEngine.addRecent(matchedItem.id);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4 font-sans select-none">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
          <div className="absolute font-black text-xs text-indigo-400">A</div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-black tracking-tight text-slate-100">M/S Madani Traders Cloud</h2>
          <p className="text-[11px] text-slate-400 font-medium font-mono">Initializing Firestore Real-Time Database Connection (asia-southeast1)...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ErrorBoundary variant="full">
        <Login settings={settings} onLoginSuccess={handleLoginSuccess} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary variant="full">
      <div className="flex h-screen bg-slate-50 text-slate-700 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} currentSubTab={currentSubTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar with Clock */}
        <Header
          currentTab={currentTab}
          currentSubTab={currentSubTab}
          onTabChange={handleTabChange}
          settings={settings}
          isVisualEditMode={isVisualEditMode}
          onToggleVisualEditMode={() => setIsVisualEditMode(!isVisualEditMode)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic content render views */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <ErrorBoundary variant="section" sectionName="Dashboard Module">
              <DashboardView
                products={products}
                customers={customers}
                invoices={invoices}
                suppliers={suppliers}
                onTabChange={handleTabChange}
                isVisualEditMode={isVisualEditMode}
                activeSubTab={currentSubTab}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'inventory' && (
            <ErrorBoundary variant="section" sectionName="Inventory Module">
              <InventoryView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateStock={handleEditStock}
                onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
                activeSubTab={currentSubTab}
                onUpdateProducts={setProducts}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'sales' && (
            <ErrorBoundary variant="section" sectionName="Sales & Billing Module">
              <SalesView
                products={products}
                customers={customers}
                invoices={invoices}
                onAddInvoice={handleAddInvoice}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomers={setCustomers}
                onRecordCollection={handleRecordCollection}
                activeSubTab={currentSubTab}
                onSubTabChange={setCurrentSubTab}
                settings={settings}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'purchase' && (
            <ErrorBoundary variant="section" sectionName="Purchase & Inbound Module">
              <PurchaseView
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                products={products}
                onAddSupplier={handleAddSupplier}
                onUpdateSuppliers={setSuppliers}
                onAddPurchaseOrder={handleAddPurchaseOrder}
                onReceivePurchaseOrder={handleReceivePurchaseOrder}
                activeSubTab={currentSubTab}
                onTabChange={handleTabChange}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'employee' && (
            <ErrorBoundary variant="section" sectionName="HR & Employee Management Module">
              <EmployeeView
                employees={employees}
                attendances={attendances}
                onAddEmployee={handleAddEmployee}
                onUpdateAttendance={handleUpdateAttendance}
                activeSubTab={currentSubTab}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'accounting' && (
            <ErrorBoundary variant="section" sectionName="General Ledger & Accounting Module">
              {currentSubTab === 'assets' ? (
                <FixedAssetsView activeSubTab={currentSubTab} currentUser={currentUser} />
              ) : (
                <AccountingView
                  accountHeads={accountHeads}
                  transactions={transactions}
                  bankAccounts={bankAccounts}
                  onLogTransaction={handleLogTransaction}
                  activeSubTab={currentSubTab}
                />
              )}
            </ErrorBoundary>
          )}

          {(currentTab === 'banking' || currentTab === 'loan' || currentTab === 'settings') && (
            <ErrorBoundary variant="section" sectionName="Banking, Loans & Settings Module">
              <BankingAndLoanView
                bankAccounts={bankAccounts}
                loanAccounts={loanAccounts}
                transactions={transactions}
                currentTab={currentTab as 'banking' | 'loan' | 'settings'}
                activeSubTab={currentSubTab}
                onAddBankAccount={handleAddBankAccount}
                onAddLoan={handleAddLoan}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetData={handleResetData}
                onImportData={handleImportData}
                systemData={systemData}
                currentUser={currentUser}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'reports' && (
            <ErrorBoundary variant="section" sectionName="Standard PDF & Ledger Reports Module">
              <ReportsView
                products={products}
                customers={customers}
                suppliers={suppliers}
                invoices={invoices}
                purchaseOrders={purchaseOrders}
                bankAccounts={bankAccounts}
                transactions={transactions}
                accountHeads={accountHeads}
                employees={employees}
                activeSubTab={currentSubTab}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'gridReport' && (
            <ErrorBoundary variant="section" sectionName="Dynamic Custom Grid Reports Module">
              <GridReportView
                products={products}
                customers={customers}
                suppliers={suppliers}
                invoices={invoices}
                transactions={transactions}
                onUpdateProducts={setProducts}
                onUpdateInvoices={setInvoices}
                onUpdateCustomers={setCustomers}
                onUpdateSuppliers={setSuppliers}
                onUpdateTransactions={setTransactions}
                isVisualEditMode={isVisualEditMode}
                currentSubTab={currentSubTab}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'rdlReport' && (
            <ErrorBoundary variant="section" sectionName="RDL Template Report Builder Module">
              <RdlReportView
                products={products}
                customers={customers}
                suppliers={suppliers}
                invoices={invoices}
                transactions={transactions}
                isVisualEditMode={isVisualEditMode}
                currentSubTab={currentSubTab}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'crm' && (
            <ErrorBoundary variant="section" sectionName="CRM & Leads Module">
              <CRMView activeSubTab={currentSubTab} currentUser={currentUser} />
            </ErrorBoundary>
          )}

          {currentTab === 'projects' && (
            <ErrorBoundary variant="section" sectionName="Projects & Timesheets Module">
              <ProjectsView activeSubTab={currentSubTab} currentUser={currentUser} />
            </ErrorBoundary>
          )}

          {currentTab === 'manufacturing' && (
            <ErrorBoundary variant="section" sectionName="Manufacturing Production Module">
              <ManufacturingView activeSubTab={currentSubTab} currentUser={currentUser} />
            </ErrorBoundary>
          )}

          {currentTab === 'service' && (
            <ErrorBoundary variant="section" sectionName="Service Tickets & Helpdesk Module">
              <ServiceView activeSubTab={currentSubTab} currentUser={currentUser} />
            </ErrorBoundary>
          )}

          {currentTab === 'documents' && (
            <ErrorBoundary variant="section" sectionName="Document Repository & Contracts Module">
              <DocumentsView activeSubTab={currentSubTab} />
            </ErrorBoundary>
          )}

          {currentTab === 'workflow' && (
            <ErrorBoundary variant="section" sectionName="Business Workflow Approval Engine">
              <WorkflowView activeSubTab={currentSubTab} />
            </ErrorBoundary>
          )}

          {currentTab === 'ai' && (
            <ErrorBoundary variant="section" sectionName="Gemini AI Assistant Module">
              <AIView activeSubTab={currentSubTab} />
            </ErrorBoundary>
          )}

          {currentTab === 'integration' && (
            <ErrorBoundary variant="section" sectionName="Third-Party Integration Engine">
              <IntegrationView activeSubTab={currentSubTab} />
            </ErrorBoundary>
          )}

          {/* Quick empty fallback screen for other secondary/reports links to prevent app crashes */}
          {!['dashboard', 'inventory', 'sales', 'purchase', 'employee', 'accounting', 'banking', 'loan', 'settings', 'reports', 'gridReport', 'rdlReport', 'crm', 'projects', 'manufacturing', 'service', 'documents', 'workflow', 'ai', 'integration'].includes(
            currentTab
          ) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <span className="text-4xl">📊</span>
              <h3 className="font-bold text-slate-800 text-sm font-display uppercase tracking-wide">
                Interactive Analytical Module
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The requested sub-report is compiled dynamically on our cloud-ledger engine. Use the core operational screens in the sidebar to buy standard stock items, run checkouts, track staff check-ins, or check real-time P&L margins.
              </p>
              <button
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Return to Dashboard View
              </button>
            </div>
          )}
        </main>
      </div>
    </div>

    {/* Beautiful Global Neo-brutalist Alert Modal */}
    {globalAlert && (
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in"
        onClick={() => setGlobalAlert(null)}
      >
        <div 
          className="bg-white border-2 border-slate-800 rounded-xl w-full max-w-md shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header depending on type */}
          <div className={`p-4 flex items-center gap-3 border-b-2 border-slate-800 ${
            globalAlert.type === 'error' ? 'bg-rose-50 text-rose-800' :
            globalAlert.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
            'bg-indigo-50 text-indigo-800'
          }`}>
            <span className="text-xl">
              {globalAlert.type === 'error' ? '⚠️' :
               globalAlert.type === 'success' ? '✅' :
               'ℹ️'}
            </span>
            <h3 className="font-black text-xs uppercase tracking-wider font-display">
              {globalAlert.title}
            </h3>
          </div>

          {/* Message Body */}
          <div className="p-5">
            <p className="text-slate-700 font-bold text-xs leading-relaxed whitespace-pre-line text-left">
              {globalAlert.message}
            </p>
          </div>

          {/* Footer with action button */}
          <div className="bg-slate-50 px-4 py-3 border-t-2 border-slate-800 flex justify-end">
            <button
              onClick={() => setGlobalAlert(null)}
              className={`px-4 py-2 font-black text-[10px] uppercase tracking-wider rounded-lg border-2 border-slate-800 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(30,41,59,1)] transition-all cursor-pointer ${
                globalAlert.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 text-white' :
                globalAlert.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Okay, Understood
            </button>
          </div>
        </div>
      </div>
    )}

    </ErrorBoundary>
  );
}
