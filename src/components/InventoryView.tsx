import React, { useState, useEffect } from 'react';
import { Product, formatBoxQty } from '../types';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Edit3,
  Trash2,
  Database,
  Layers,
  Warehouse as WhIcon,
  QrCode,
  ArrowRightLeft,
  Percent,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Boxes,
  Compass,
  Settings,
  Eye,
  Sliders,
  FileSpreadsheet,
  FileUp,
  Printer,
  ChevronDown,
  Download,
  Upload
} from 'lucide-react';
import {
  CustomField,
  DEFAULT_FIELDS,
  ManageCustomFieldsModal,
  ProductEnterpriseTabs,
  BulkEditBar,
} from './ProductEnterpriseEngine';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  activeSubTab?: string;
  onUpdateProducts?: (products: Product[]) => void;
}

export default function InventoryView({
  products,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  activeSubTab = 'products',
  onUpdateProducts,
}: InventoryViewProps) {
  // Navigation mapping if activeSubTab is parsed
  const currentTab = ['products', 'categories', 'units', 'warehouses', 'stock', 'stock_transfer', 'barcodes', 'offer_info'].includes(activeSubTab)
    ? activeSubTab
    : 'products';

  // --- ENTERPRISE PRODUCT MASTER STATES & HELPERS ---
  const [customFields, setCustomFields] = useState<CustomField[]>(() => {
    const saved = localStorage.getItem('nexova_custom_fields');
    return saved ? JSON.parse(saved) : DEFAULT_FIELDS;
  });

  useEffect(() => {
    localStorage.setItem('nexova_custom_fields', JSON.stringify(customFields));
  }, [customFields]);

  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [extraFields, setExtraFields] = useState<Record<string, any>>({});
  const [editingExtraFields, setEditingExtraFields] = useState<Record<string, any>>({});

  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    sku_name: true,
    category: true,
    price: true,
    cost: true,
    stock: true,
    warehouse: true,
    brand: false,
    productCode: false,
    barcode: false,
    actions: true,
  });

  // Log changes helper
  const logFieldChanges = (oldProd: Product, newProd: Product, reason: string) => {
    try {
      const currentRole = 'Administrator';
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString();
      const logs: any[] = JSON.parse(localStorage.getItem('nexova_product_audit_logs') || '[]');

      const keysToTrack = Object.keys({ ...oldProd, ...newProd }).filter(k => k !== 'id');
      keysToTrack.forEach(k => {
        const oldVal = (oldProd as any)[k];
        const newVal = (newProd as any)[k];
        if (oldVal !== newVal) {
          const fieldDef = customFields.find(f => f.internalName === k);
          const dName = fieldDef ? fieldDef.displayName : k.toUpperCase();

          const entry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            productId: oldProd.id,
            productName: oldProd.name,
            productSku: oldProd.sku,
            fieldChanged: k,
            displayName: dName,
            oldValue: oldVal !== undefined ? String(oldVal) : '',
            newValue: newVal !== undefined ? String(newVal) : '',
            user: 'Administrator',
            role: currentRole,
            date: dateStr,
            time: timeStr,
            ip: '192.168.1.1',
            browser: 'Chrome ERP Client',
            reason: reason || 'Specifications updated',
            approvalStatus: 'Auto-Approved'
          };
          logs.unshift(entry);
        }
      });

      localStorage.setItem('nexova_product_audit_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Audit logging failure:', err);
    }
  };

  // --- PERSISTENT SUB-DATA STATE IN INVENTORY ---
  const [categories, setCategories] = useState<string[]>([
    'Construction Materials',
    'Steel Items',
    'Bricks & Sand',
    'Chemicals & Paint',
  ]);

  const [units, setUnits] = useState([
    { name: 'Bags', abbrev: 'bag', base: 'Yes', productsCount: 2 },
    { name: 'Tons', abbrev: 'ton', base: 'Yes', productsCount: 2 },
    { name: 'Pcs', abbrev: 'pc', base: 'Yes', productsCount: 1 },
    { name: 'Drums', abbrev: 'drm', base: 'No', productsCount: 1 },
  ]);

  const [warehouses, setWarehouses] = useState([
    { name: 'Main Warehouse', location: 'Dhaka Sadar', manager: 'Rashedul Islam', capacity: '1000 Tons' },
    { name: 'Yard A', location: 'Tongiganj', manager: 'Asaduzzaman Khan', capacity: '5000 Tons' },
    { name: 'Yard B', location: 'Narayanganj', manager: 'Farhana Yasmin', capacity: '3000 Tons' },
  ]);

  const [transfers, setTransfers] = useState([
    { id: 'tr1', date: '2026-07-02', refNo: 'TR-2601', productName: 'Standard Premium cement', qty: 25, unit: 'Bags', from: 'Main Warehouse', to: 'Yard A', status: 'Completed' },
    { id: 'tr2', date: '2026-07-05', refNo: 'TR-2602', productName: 'Deformed Steel Bar 60G (16mm)', qty: 2, unit: 'Tons', from: 'Yard B', to: 'Main Warehouse', status: 'Completed' },
  ]);

  const [offers, setOffers] = useState([
    { id: 'of1', name: 'Monsoon Special 5% Steel Discount', type: 'Discount Code', productName: 'Deformed Steel Bar 60G (12mm)', criteria: 'Sales > 5 Tons', reward: '5% Off invoice value', status: 'Active' },
    { id: 'of2', name: 'Cement Bundle Bonus', type: 'Bundle Bonus', productName: 'Standard Premium cement', criteria: 'Buy 100 Bags', reward: 'Get 2 Bags Free', status: 'Active' },
  ]);

  // --- GENERAL TAB STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  // --- MODAL / FORM STATES ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showWhModal, setShowWhModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // --- INPUT FIELD STATES ---
  // Product Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [pCategory, setPCategory] = useState('Construction Materials');
  const [pUnit, setPUnit] = useState('Bags');
  const [pWarehouse, setPWarehouse] = useState('Main Warehouse');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [alertQty, setAlertQty] = useState('');
  const [pcsPerBox, setPcsPerBox] = useState('1');

  // --- EDIT PRODUCT MODAL STATE ---
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editingProdName, setEditingProdName] = useState('');
  const [editingProdSku, setEditingProdSku] = useState('');
  const [editingProdCategory, setEditingProdCategory] = useState('');
  const [editingProdUnit, setEditingProdUnit] = useState('');
  const [editingProdWarehouse, setEditingProdWarehouse] = useState('');
  const [editingProdPrice, setEditingProdPrice] = useState('');
  const [editingProdCost, setEditingProdCost] = useState('');
  const [editingProdStock, setEditingProdStock] = useState('');
  const [editingProdAlertQty, setEditingProdAlertQty] = useState('');
  const [editingProdPcsPerBox, setEditingProdPcsPerBox] = useState('1');

  // Category Form
  const [newCatName, setNewCatName] = useState('');

  // Unit Form
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitAbbrev, setNewUnitAbbrev] = useState('');
  const [newUnitBase, setNewUnitBase] = useState('Yes');

  // Warehouse Form
  const [newWhName, setNewWhName] = useState('');
  const [newWhLoc, setNewWhLoc] = useState('');
  const [newWhMgr, setNewWhMgr] = useState('');
  const [newWhCap, setNewWhCap] = useState('');

  // Transfer Form
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState('');
  const [transferFrom, setTransferFrom] = useState('Main Warehouse');
  const [transferTo, setTransferTo] = useState('Yard A');

  // Offer Form
  const [offerName, setOfferName] = useState('');
  const [offerType, setOfferType] = useState('Bundle Bonus');
  const [offerProduct, setOfferProduct] = useState(products[0]?.name || '');
  const [offerCriteria, setOfferCriteria] = useState('');
  const [offerReward, setOfferReward] = useState('');

  // Barcode Form
  const [barcodeProduct, setBarcodeProduct] = useState(products[0]?.id || '');
  const [barcodeQty, setBarcodeQty] = useState('4');
  const [generatedBarcodes, setGeneratedBarcodes] = useState<Product[]>([]);

  // Stock editor modal
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState('');

  // --- EDIT MODAL STATES ---
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState('');

  const [editingUnitName, setEditingUnitName] = useState<string | null>(null);
  const [editingUnitNewName, setEditingUnitNewName] = useState('');
  const [editingUnitAbbrev, setEditingUnitAbbrev] = useState('');
  const [editingUnitBase, setEditingUnitBase] = useState('Yes');

  const [editingWhName, setEditingWhName] = useState<string | null>(null);
  const [editingWhNewName, setEditingWhNewName] = useState('');
  const [editingWhLoc, setEditingWhLoc] = useState('');
  const [editingWhMgr, setEditingWhMgr] = useState('');
  const [editingWhCap, setEditingWhCap] = useState('');

  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editingOfferName, setEditingOfferName] = useState('');
  const [editingOfferType, setEditingOfferType] = useState('Bundle Bonus');
  const [editingOfferProduct, setEditingOfferProduct] = useState('');
  const [editingOfferCriteria, setEditingOfferCriteria] = useState('');
  const [editingOfferReward, setEditingOfferReward] = useState('');

  // --- ENTERPRISE UTILITY ACTIONS ---
  const handleExportCSV = () => {
    // Collect columns that are visible
    const cols = Object.keys(visibleColumns).filter(k => visibleColumns[k]);
    // Create headers
    const headers = cols.map(c => {
      if (c === 'sku_name') return 'SKU,Product Name';
      const f = customFields.find(fDef => fDef.internalName === c);
      return f ? f.displayName : c.toUpperCase();
    }).join(',');
    
    // Create rows
    const rows = filteredProducts.map(p => {
      return cols.map(c => {
        if (c === 'sku_name') {
          return `"${p.sku}","${p.name.replace(/"/g, '""')}"`;
        }
        const val = (p as any)[c] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexova_product_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          alert('CSV contains no data entries.');
          return;
        }
        
        const parseCSVLine = (line: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const importedProducts: Partial<Product>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]).map(c => c.trim());
          const item: Record<string, any> = {
            id: `prod_imported_${Date.now()}_${i}`,
            alertQty: 5,
            pcsPerBox: 1,
            warehouse: 'Main Warehouse',
            unit: 'Bags',
            category: 'Construction Materials'
          };
          
          headers.forEach((header, colIdx) => {
            const val = cells[colIdx] ?? '';
            if (header === 'sku' || header === 'code') item.sku = val;
            else if (header === 'product name' || header === 'name') item.name = val;
            else if (header === 'category') item.category = val;
            else if (header === 'selling price' || header === 'price') item.price = parseFloat(val) || 0;
            else if (header === 'cost price' || header === 'cost') item.cost = parseFloat(val) || 0;
            else if (header === 'stock' || header === 'initial stock') item.stock = parseInt(val) || 0;
            else if (header === 'warehouse') item.warehouse = val;
            else {
              const cField = customFields.find(f => f.displayName.toLowerCase() === header || f.internalName.toLowerCase() === header);
              if (cField) {
                item[cField.internalName] = val;
              } else {
                item[header] = val;
              }
            }
          });
          
          if (item.name && item.sku) {
            importedProducts.push(item as Product);
          }
        }
        
        if (importedProducts.length === 0) {
          alert('No valid products found to import. Verify that columns "sku" and "name" exist.');
          return;
        }
        
        importedProducts.forEach(p => onAddProduct(p as Product));
        alert(`Successfully imported ${importedProducts.length} products into the ERP catalog!`);
      } catch (err) {
        alert('Failed parsing CSV file. Please make sure the structure is correct.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintPDFCatalog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to print the product catalog.');
      return;
    }
    
    const tableHeaderMarkup = `
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase;">
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">SKU</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Product Name</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Category</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Selling Price</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Cost Price</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">Stock</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Warehouse</th>
        </tr>
      </thead>
    `;
    
    const tableRowsMarkup = filteredProducts.map(p => `
      <tr style="font-size: 12px; border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #4f46e5;">${p.sku}</td>
        <td style="padding: 10px; font-weight: 600;">${p.name}</td>
        <td style="padding: 10px; color: #64748b;">${p.category}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">৳${p.price.toLocaleString()}</td>
        <td style="padding: 10px; text-align: right; color: #64748b;">৳${p.cost.toLocaleString()}</td>
        <td style="padding: 10px; text-align: center; font-weight: bold; color: ${p.stock <= p.alertQty ? '#b91c1c' : '#1e1b4b'}">${p.stock} ${p.unit}</td>
        <td style="padding: 10px; color: #64748b;">${p.warehouse}</td>
      </tr>
    `).join('');
    
    const htmlContent = `
      <html>
        <head>
          <title>Nexova ERP - Master Product Catalog</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 5px; }
            .meta { text-align: right; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Nexova ERP Solution</div>
              <div class="subtitle">Enterprise Master Product Catalog</div>
            </div>
            <div class="meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Total Items:</strong> ${filteredProducts.length} Products</div>
            </div>
          </div>
          <table style="width:100%; border-collapse: collapse;">
            ${tableHeaderMarkup}
            <tbody>
              ${tableRowsMarkup}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- EDIT & DELETE HANDLERS ---
  const handleDeleteCategory = (catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"? This will reset the category for associated products.`)) {
      setCategories(categories.filter((c) => c !== catName));
      if (onUpdateProducts) {
        onUpdateProducts(
          products.map((p) => (p.category === catName ? { ...p, category: categories.find((c) => c !== catName) || '' } : p))
        );
      }
    }
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatName || !editingCatNewName) return;
    setCategories(categories.map((c) => (c === editingCatName ? editingCatNewName : c)));
    if (onUpdateProducts) {
      onUpdateProducts(
        products.map((p) => (p.category === editingCatName ? { ...p, category: editingCatNewName } : p))
      );
    }
    setEditingCatName(null);
    setEditingCatNewName('');
  };

  const handleDeleteUnit = (unitName: string) => {
    if (confirm(`Are you sure you want to delete unit "${unitName}"?`)) {
      setUnits(units.filter((u) => u.name !== unitName));
    }
  };

  const handleEditUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnitName || !editingUnitNewName) return;
    setUnits(
      units.map((u) =>
        u.name === editingUnitName
          ? { ...u, name: editingUnitNewName, abbrev: editingUnitAbbrev, base: editingUnitBase }
          : u
      )
    );
    if (onUpdateProducts) {
      onUpdateProducts(
        products.map((p) => (p.unit === editingUnitName ? { ...p, unit: editingUnitNewName } : p))
      );
    }
    setEditingUnitName(null);
    setEditingUnitNewName('');
    setEditingUnitAbbrev('');
  };

  const handleDeleteWarehouse = (whName: string) => {
    if (confirm(`Are you sure you want to delete warehouse "${whName}"?`)) {
      setWarehouses(warehouses.filter((w) => w.name !== whName));
    }
  };

  const handleEditWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWhName || !editingWhNewName) return;
    setWarehouses(
      warehouses.map((w) =>
        w.name === editingWhName
          ? { ...w, name: editingWhNewName, location: editingWhLoc, manager: editingWhMgr, capacity: editingWhCap }
          : w
      )
    );
    if (onUpdateProducts) {
      onUpdateProducts(
        products.map((p) => (p.warehouse === editingWhName ? { ...p, warehouse: editingWhNewName } : p))
      );
    }
    setEditingWhName(null);
    setEditingWhNewName('');
    setEditingWhLoc('');
    setEditingWhMgr('');
    setEditingWhCap('');
  };

  const handleDeleteOffer = (offerId: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setOffers(offers.filter((o) => o.id !== offerId));
    }
  };

  const handleEditOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfferId || !editingOfferName) return;
    setOffers(
      offers.map((o) =>
        o.id === editingOfferId
          ? {
              ...o,
              name: editingOfferName,
              type: editingOfferType,
              productName: editingOfferProduct,
              criteria: editingOfferCriteria,
              reward: editingOfferReward,
            }
          : o
      )
    );
    setEditingOfferId(null);
  };

  // --- MUTATION HANDLERS ---
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price || !cost || !stock) return;

    onAddProduct({
      name,
      sku,
      category: pCategory,
      unit: pUnit,
      warehouse: pWarehouse,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      alertQty: parseInt(alertQty) || 5,
      pcsPerBox: parseInt(pcsPerBox) || 1,
      ...extraFields,
    });

    setName('');
    setSku('');
    setPrice('');
    setCost('');
    setStock('');
    setAlertQty('');
    setPcsPerBox('1');
    setExtraFields({});
    setShowAddModal(false);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProdId || !editingProdName || !editingProdSku) return;

    const oldProduct = products.find(p => p.id === editingProdId);
    const newProduct = {
      id: editingProdId,
      name: editingProdName,
      sku: editingProdSku,
      category: editingProdCategory,
      unit: editingProdUnit,
      warehouse: editingProdWarehouse,
      price: parseFloat(editingProdPrice) || 0,
      cost: parseFloat(editingProdCost) || 0,
      stock: parseInt(editingProdStock) || 0,
      alertQty: parseInt(editingProdAlertQty) || 0,
      pcsPerBox: parseInt(editingProdPcsPerBox) || 1,
      ...editingExtraFields,
    };

    if (oldProduct) {
      logFieldChanges(oldProduct, newProduct, 'Product master information update');
    }

    if (onUpdateProducts) {
      onUpdateProducts(
        products.map((p) => p.id === editingProdId ? newProduct : p)
      );
    }
    setEditingProdId(null);
  };

  const handleStockSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStockId && editingStockVal !== '') {
      onUpdateStock(editingStockId, parseInt(editingStockVal));
      setEditingStockId(null);
      setEditingStockVal('');
    }
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setCategories([...categories, newCatName]);
    setNewCatName('');
    setShowCatModal(false);
  };

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newUnitAbbrev) return;
    setUnits([...units, { name: newUnitName, abbrev: newUnitAbbrev, base: newUnitBase, productsCount: 0 }]);
    setNewUnitName('');
    setNewUnitAbbrev('');
    setShowUnitModal(false);
  };

  const handleWhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName) return;
    setWarehouses([...warehouses, { name: newWhName, location: newWhLoc || 'TBD', manager: newWhMgr || 'Staff', capacity: newWhCap || 'General' }]);
    setNewWhName('');
    setNewWhLoc('');
    setNewWhMgr('');
    setNewWhCap('');
    setShowWhModal(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !transferQty) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const qtyVal = parseInt(transferQty);
    if (qtyVal > prod.stock) {
      alert(`Insufficient stock! Product only has ${prod.stock} ${prod.unit} in stock.`);
      return;
    }

    // Deduct stock from source (which we handle by reducing it)
    onUpdateStock(prod.id, prod.stock - qtyVal);

    // Record transfer log
    const newTr = {
      id: `tr_dynamic_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      refNo: `TR-260${3 + transfers.length}`,
      productName: prod.name,
      qty: qtyVal,
      unit: prod.unit,
      from: transferFrom,
      to: transferTo,
      status: 'Completed',
    };
    setTransfers([newTr, ...transfers]);

    setTransferQty('');
    setShowTransferModal(false);
    alert(`Successfully transferred ${qtyVal} ${prod.unit} of "${prod.name}" from ${transferFrom} to ${transferTo}`);
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerName || !offerCriteria || !offerReward) return;
    const newOffer = {
      id: `of_dynamic_${Date.now()}`,
      name: offerName,
      type: offerType,
      productName: offerProduct,
      criteria: offerCriteria,
      reward: offerReward,
      status: 'Active',
    };
    setOffers([newOffer, ...offers]);
    setOfferName('');
    setOfferCriteria('');
    setOfferReward('');
    setShowOfferModal(false);
  };

  const handleGenerateBarcodes = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === barcodeProduct);
    if (!prod) return;
    const qty = parseInt(barcodeQty) || 4;
    const list: Product[] = [];
    for (let i = 0; i < qty; i++) {
      list.push(prod);
    }
    setGeneratedBarcodes(list);
  };

  // --- FILTERS LOGIC ---
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      ((p as any).brand && String((p as any).brand).toLowerCase().includes(query)) ||
      ((p as any).productCode && String((p as any).productCode).toLowerCase().includes(query)) ||
      customFields.some(fDef => {
        const val = (p as any)[fDef.internalName];
        return val && String(val).toLowerCase().includes(query);
      });
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    let matchStock = true;
    if (stockFilter === 'Low') {
      matchStock = p.stock <= p.alertQty && p.stock > 0;
    } else if (stockFilter === 'Out') {
      matchStock = p.stock === 0;
    }
    return matchSearch && matchCat && matchStock;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* =========================================
          TAB 1: PRODUCTS (MAIN DIRECTORY)
          ========================================= */}
      {currentTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Products Directory</h2>
              <p className="text-xs text-slate-400 mt-1">Manage global inventory catalog, enterprise properties, custom categories, and stock alert levels.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCustomFieldsModal(true)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
                title="Manage dynamic specification forms and attributes for products"
              >
                <Settings className="h-3.5 w-3.5 text-indigo-600" />
                <span>Manage Custom Fields</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md shadow-indigo-600/10 cursor-pointer transition-all self-start sm:self-center"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, SKU, brand, code, or custom attributes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none font-medium cursor-pointer text-xs"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="bg-transparent border-none focus:outline-none font-medium cursor-pointer text-xs"
                    >
                      <option value="All">All Stocks</option>
                      <option value="Low">Low Stock Only</option>
                      <option value="Out">Out of Stock</option>
                    </select>
                  </div>

                  {/* Column Chooser popover button */}
                  <div className="relative">
                    <button
                      onClick={() => setColumnChooserOpen(!columnChooserOpen)}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                      title="Choose which columns are visible in catalog table"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Columns</span>
                    </button>
                    {columnChooserOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 space-y-2 text-slate-700 animate-in fade-in duration-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 mb-1.5">Visible Columns</div>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {[
                            { key: 'sku_name', label: 'SKU / Name' },
                            { key: 'category', label: 'Category' },
                            { key: 'price', label: 'Selling Price' },
                            { key: 'cost', label: 'Cost Price' },
                            { key: 'stock', label: 'Stock level' },
                            { key: 'warehouse', label: 'Warehouse' },
                          ].map(col => (
                            <label key={col.key} className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:text-indigo-600">
                              <input
                                type="checkbox"
                                checked={visibleColumns[col.key]}
                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                                className="rounded text-indigo-600"
                              />
                              <span>{col.label}</span>
                            </label>
                          ))}
                          {customFields.map(f => (
                            <label key={f.internalName} className="flex items-center gap-2 text-xs font-medium cursor-pointer hover:text-indigo-600">
                              <input
                                type="checkbox"
                                checked={!!visibleColumns[f.internalName]}
                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [f.internalName]: e.target.checked })}
                                className="rounded text-indigo-600"
                              />
                              <span className="truncate">{f.displayName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print / Export catalog actions */}
                  <button
                    onClick={handleExportCSV}
                    className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="Export visible catalog rows to standard CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <label className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer block relative">
                    <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                    <Upload className="h-4 w-4" />
                  </label>
                  <button
                    onClick={handlePrintPDFCatalog}
                    className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="Generate and print master PDF catalog sheet"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Bulk operations bar */}
              <BulkEditBar
                selectedProductIds={selectedProductIds}
                products={products}
                onUpdateProducts={onUpdateProducts || (() => {})}
                categories={categories}
                warehouses={warehouses}
                onClearSelection={() => setSelectedProductIds([])}
              />

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/40">
                      <th className="py-3 px-4 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(filteredProducts.map(p => p.id));
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                          className="rounded text-indigo-600 cursor-pointer"
                        />
                      </th>
                      {visibleColumns.sku_name && <th className="py-3 px-4">SKU / Name</th>}
                      {visibleColumns.category && <th className="py-3 px-4">Category</th>}
                      {visibleColumns.price && <th className="py-3 px-4 text-right">Selling Price</th>}
                      {visibleColumns.cost && <th className="py-3 px-4 text-right">Cost Price</th>}
                      {visibleColumns.stock && <th className="py-3 px-4 text-center">Stock</th>}
                      {visibleColumns.warehouse && <th className="py-3 px-4">Warehouse</th>}
                      
                      {/* Dynamic visible custom column headers */}
                      {Object.keys(visibleColumns).map((key) => {
                        if (['sku_name', 'category', 'price', 'cost', 'stock', 'warehouse', 'actions'].includes(key)) return null;
                        if (!visibleColumns[key]) return null;
                        const fDef = customFields.find(f => f.internalName === key);
                        return (
                          <th key={key} className="py-3 px-4 font-semibold uppercase tracking-wider text-slate-400">{fDef ? fDef.displayName : key}</th>
                        );
                      })}
                      
                      {visibleColumns.actions !== false && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= p.alertQty;
                      return (
                         <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${selectedProductIds.includes(p.id) ? 'bg-indigo-50/30' : ''}`}>
                          <td className="py-4 px-4 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds([...selectedProductIds, p.id]);
                                } else {
                                  setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded text-indigo-600 cursor-pointer"
                            />
                          </td>
                          {visibleColumns.sku_name && (
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-[10px] text-indigo-600 font-bold">{p.sku}</span>
                                <span className="font-bold text-slate-800 mt-0.5">{p.name}</span>
                                {p.pcsPerBox && p.pcsPerBox > 1 && (
                                  <span className="text-[10px] font-semibold text-amber-600 mt-0.5 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded w-max">
                                    1 Box = {p.pcsPerBox} pcs
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          {visibleColumns.category && <td className="py-4 px-4 text-slate-500 font-medium">{p.category}</td>}
                          {visibleColumns.price && <td className="py-4 px-4 text-right font-bold text-slate-800">৳{p.price.toLocaleString()}</td>}
                          {visibleColumns.cost && <td className="py-4 px-4 text-right text-slate-500 font-semibold">৳{p.cost.toLocaleString()}</td>}
                          {visibleColumns.stock && (
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                      p.stock === 0
                                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                        : isLow
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                    }`}
                                  >
                                    {p.stock} {p.unit}
                                  </span>
                                  {p.pcsPerBox && p.pcsPerBox > 1 && p.stock > 0 && (
                                    <span className="text-[9px] font-semibold text-indigo-600 mt-1 block">
                                      {formatBoxQty(p.stock, p.pcsPerBox)}
                                    </span>
                                  )}
                                </div>
                                {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" title="Low stock alert" />}
                              </div>
                            </td>
                          )}
                          {visibleColumns.warehouse && <td className="py-4 px-4 text-slate-500 font-medium">{p.warehouse}</td>}
                          
                          {/* Dynamic column cell values */}
                          {Object.keys(visibleColumns).map((key) => {
                            if (['sku_name', 'category', 'price', 'cost', 'stock', 'warehouse', 'actions'].includes(key)) return null;
                            if (!visibleColumns[key]) return null;
                            const cellValue = (p as any)[key] !== undefined ? String((p as any)[key]) : '';
                            return (
                              <td key={key} className="py-4 px-4 text-slate-600 font-semibold font-mono text-[10px] truncate max-w-[120px]" title={cellValue}>{cellValue || '—'}</td>
                            );
                          })}
                          
                          {visibleColumns.actions !== false && (
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProdId(p.id);
                                    setEditingProdName(p.name);
                                    setEditingProdSku(p.sku);
                                    setEditingProdCategory(p.category);
                                    setEditingProdUnit(p.unit);
                                    setEditingProdWarehouse(p.warehouse);
                                    setEditingProdPrice(p.price.toString());
                                    setEditingProdCost(p.cost.toString());
                                    setEditingProdStock(p.stock.toString());
                                    setEditingProdAlertQty(p.alertQty.toString());
                                    setEditingProdPcsPerBox((p.pcsPerBox || 1).toString());
                                    
                                    // Load extra properties
                                    const extra: Record<string, any> = {};
                                    customFields.forEach(f => {
                                      if ((p as any)[f.internalName] !== undefined) {
                                        extra[f.internalName] = (p as any)[f.internalName];
                                      }
                                    });
                                    setEditingExtraFields(extra);
                                  }}
                                  className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded transition-colors cursor-pointer"
                                  title="Edit Product Info"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this product from catalog?')) {
                                      onDeleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-slate-400 font-semibold">
                          No matching catalog items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <WhIcon className="h-4.5 w-4.5 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Warehouses</h3>
                </div>
                <div className="space-y-3">
                  {warehouses.map((wh) => {
                    const totalQty = products.filter((p) => p.warehouse === wh.name).reduce((sum, p) => sum + p.stock, 0);
                    return (
                      <div key={wh.name} className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{wh.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{wh.location}</span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {totalQty.toLocaleString()} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg shadow-indigo-600/10">
                <h3 className="text-sm font-bold font-display">Replenishment Status</h3>
                <p className="text-[10px] text-indigo-200 mt-1">Daily analysis of stock thresholds.</p>
                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                    <span className="text-indigo-200">Total Unique Items</span>
                    <span className="font-bold">{products.length} Products</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                    <span className="text-indigo-200">Low Stock Alert Items</span>
                    <span className="font-bold text-amber-300">{products.filter(p => p.stock <= p.alertQty).length} Alerting</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-200">System Status</span>
                    <span className="font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-400" /> Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: CATEGORIES
          ========================================= */}
      {currentTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Product Categories</h2>
              <p className="text-xs text-slate-400 mt-1">Organize products into logical groups for POS menus and catalog segregation.</p>
            </div>
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3 px-6">Category Name</th>
                  <th className="py-3 px-6">Code Prefix</th>
                  <th className="py-3 px-6 text-center">Product Types</th>
                  <th className="py-3 px-6 text-right">Total Stock Qty</th>
                  <th className="py-3 px-6 text-right">Total Valuation</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, idx) => {
                  const catProducts = products.filter((p) => p.category === cat);
                  const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
                  const valuation = catProducts.reduce((sum, p) => sum + p.stock * p.cost, 0);
                  return (
                    <tr key={cat} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{cat}</td>
                      <td className="py-4 px-6 font-mono text-indigo-600 uppercase font-semibold">CAT-00{idx + 1}</td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-700">{catProducts.length} Items</td>
                      <td className="py-4 px-6 text-right font-medium">{totalStock.toLocaleString()} units</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">৳{valuation.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatName(cat);
                              setEditingCatNewName(cat);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 3: UNITS
          ========================================= */}
      {currentTab === 'units' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Unit Configuration</h2>
              <p className="text-xs text-slate-400 mt-1">Manage global packaging configurations and fractional decimal measurement units.</p>
            </div>
            <button
              onClick={() => setShowUnitModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Unit</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3 px-6">Unit Name</th>
                  <th className="py-3 px-6">Abbreviation</th>
                  <th className="py-3 px-6 text-center">Allow Fraction</th>
                  <th className="py-3 px-6 text-center">Assigned Products</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((un) => {
                  const assignedCount = products.filter((p) => p.unit === un.name).length;
                  return (
                    <tr key={un.name} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{un.name}</td>
                      <td className="py-4 px-6 font-mono text-indigo-600 uppercase font-bold">{un.abbrev}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${un.base === 'Yes' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          {un.base === 'Yes' ? 'Allowed' : 'Integers Only'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-medium">{assignedCount} items</td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUnitName(un.name);
                              setEditingUnitNewName(un.name);
                              setEditingUnitAbbrev(un.abbrev);
                              setEditingUnitBase(un.base);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(un.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: WAREHOUSES
          ========================================= */}
      {currentTab === 'warehouses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Warehouses & Depots</h2>
              <p className="text-xs text-slate-400 mt-1">Track physical stock distribution, location maps, capacity, and supervisors.</p>
            </div>
            <button
              onClick={() => setShowWhModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Depot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouses.map((wh) => {
              const whProducts = products.filter((p) => p.warehouse === wh.name);
              const totalItems = whProducts.reduce((sum, p) => sum + p.stock, 0);
              const totalVal = whProducts.reduce((sum, p) => sum + p.stock * p.cost, 0);

              return (
                <div key={wh.name} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <WhIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{wh.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{wh.location}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-50 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Depot Manager</span>
                      <span className="font-semibold text-slate-700">{wh.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Stocks</span>
                      <span className="font-bold text-indigo-600">{totalItems.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Depot Valuation</span>
                      <span className="font-bold text-slate-800">৳{totalVal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacity Limit</span>
                      <span className="font-semibold text-slate-500">{wh.capacity}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWhName(wh.name);
                        setEditingWhNewName(wh.name);
                        setEditingWhLoc(wh.location);
                        setEditingWhMgr(wh.manager);
                        setEditingWhCap(wh.capacity);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Depot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWarehouse(wh.name)}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 5: STOCK METRICS & VALUATION
          ========================================= */}
      {currentTab === 'stock' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Stock Ledger Valuation</h2>
            <p className="text-xs text-slate-400 mt-1">Deep analysis of asset costs, revenue yields, margin targets, and inventory health indexes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Cost Valuation</span>
                <span className="text-xl font-bold text-slate-800 block mt-0.5">
                  ৳{products.reduce((sum, p) => sum + p.stock * p.cost, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Revenue Yield</span>
                <span className="text-xl font-bold text-slate-800 block mt-0.5">
                  ৳{products.reduce((sum, p) => sum + p.stock * p.price, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block">Est. Potential Markup</span>
                <span className="text-xl font-bold block mt-0.5">
                  ৳{(products.reduce((sum, p) => sum + p.stock * p.price, 0) - products.reduce((sum, p) => sum + p.stock * p.cost, 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Asset Catalog Health Matrix</h3>
              <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-100">Updated Real-Time</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3 px-6">Product / SKU</th>
                  <th className="py-3 px-6 text-right">Available Stock</th>
                  <th className="py-3 px-6 text-right">Total Cost Value</th>
                  <th className="py-3 px-6 text-right">Total Selling Value</th>
                  <th className="py-3 px-6 text-right">Target Markup</th>
                  <th className="py-3 px-6 text-center">Status Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const costVal = p.stock * p.cost;
                  const saleVal = p.stock * p.price;
                  const markup = saleVal - costVal;
                  const isLow = p.stock <= p.alertQty;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-700">
                        {p.stock} {p.unit}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-500">৳{costVal.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">৳{saleVal.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-600">৳{markup.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.stock === 0 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : isLow 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock' : isLow ? 'Low Threshold' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 6: STOCK TRANSFER
          ========================================= */}
      {currentTab === 'stock_transfer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Inter-Warehouse Transfers</h2>
              <p className="text-xs text-slate-400 mt-1">Disburse and record movement of product quantities across regional yards and depots.</p>
            </div>
            <button
              onClick={() => {
                if (products.length === 0) {
                  alert('No products available to transfer.');
                  return;
                }
                setSelectedProductId(products[0].id);
                setShowTransferModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Initiate New Transfer</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50/40">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Transfer Ledger</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Reference No</th>
                  <th className="py-3 px-6">Product Description</th>
                  <th className="py-3 px-6 text-center">Transferred Qty</th>
                  <th className="py-3 px-6">Source (From)</th>
                  <th className="py-3 px-6">Destination (To)</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-semibold">{tr.date}</td>
                    <td className="py-4 px-6 font-mono text-indigo-600 font-bold">{tr.refNo}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{tr.productName}</td>
                    <td className="py-4 px-6 text-center font-bold text-indigo-600">
                      {tr.qty} {tr.unit}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{tr.from}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{tr.to}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 7: BARCODES LABEL GENERATOR
          ========================================= */}
      {currentTab === 'barcodes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Barcode Label Studio</h2>
            <p className="text-xs text-slate-400 mt-1">Configure layout, pair metrics, and generate printable barcode stickers for your inventory packages.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Configure Sticker sheet</h3>
              <form onSubmit={handleGenerateBarcodes} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Product</label>
                  <select
                    value={barcodeProduct}
                    onChange={(e) => setBarcodeProduct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity of Labels</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={barcodeQty}
                    onChange={(e) => setBarcodeQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Generate Label Previews</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Sheet Print Preview</h3>
                {generatedBarcodes.length > 0 && (
                  <button
                    onClick={() => {
                      alert('Sticker labels sent to thermal printer. Status: OK');
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Print thermal label sheet
                  </button>
                )}
              </div>

              {generatedBarcodes.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <QrCode className="h-10 w-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
                  <p className="text-xs font-semibold">Select a catalog product and click generate to populate printing stickers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {generatedBarcodes.map((p, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 text-center space-y-2.5 bg-slate-50/50 shadow-xs relative group hover:border-indigo-500/50 transition-colors">
                      <div className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-display">NEXOVA ERP</div>
                      <div className="text-[10px] font-bold text-slate-800 truncate" title={p.name}>{p.name}</div>
                      <div className="flex justify-between text-[9px] px-2 font-semibold">
                        <span className="text-indigo-600">{p.sku}</span>
                        <span className="text-slate-800">৳{p.price}</span>
                      </div>
                      
                      {/* Realistic Visual Mock Barcode generated with vertical line divs */}
                      <div className="h-10 w-full bg-white border border-slate-200/60 rounded flex items-center justify-center p-1.5 gap-0.5">
                        <div className="w-[1.5px] h-full bg-slate-800" />
                        <div className="w-[3px] h-full bg-slate-800" />
                        <div className="w-[1px] h-full bg-slate-800" />
                        <div className="w-[0.5px] h-full bg-slate-800" />
                        <div className="w-[2.5px] h-full bg-slate-800" />
                        <div className="w-[1.5px] h-full bg-slate-800" />
                        <div className="w-[0.5px] h-full bg-slate-800" />
                        <div className="w-[3px] h-full bg-slate-800" />
                        <div className="w-[1px] h-full bg-slate-800" />
                        <div className="w-[2px] h-full bg-slate-800" />
                        <div className="w-[1px] h-full bg-slate-800" />
                        <div className="w-[1.5px] h-full bg-slate-800" />
                        <div className="w-[2.5px] h-full bg-slate-800" />
                        <div className="w-[0.5px] h-full bg-slate-800" />
                        <div className="w-[2px] h-full bg-slate-800" />
                      </div>
                      
                      <div className="text-[9px] font-mono tracking-wider font-bold text-slate-500">*{p.sku.replace(/-/g, '')}*</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 8: OFFER INFO
          ========================================= */}
      {currentTab === 'offer_info' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Special Offers & Bundles</h2>
              <p className="text-xs text-slate-400 mt-1">Configure automated seasonal discount campaigns, free gift vouchers, and volume-based bundle rules.</p>
            </div>
            <button
              onClick={() => {
                if (products.length === 0) {
                  alert('No products available to assign offers.');
                  return;
                }
                setOfferProduct(products[0].name);
                setShowOfferModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Percent className="h-4 w-4" />
              <span>Configure Promo Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((of) => (
              <div key={of.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-6 -mt-6" />
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {of.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Active Campaign</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{of.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Applied on: <span className="text-slate-600 font-bold">{of.productName}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Trigger Rule</span>
                      <span className="font-bold text-slate-700 mt-0.5 block">{of.criteria}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Reward / Payback</span>
                      <span className="font-bold text-indigo-600 mt-0.5 block">{of.reward}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOfferId(of.id);
                        setEditingOfferName(of.name);
                        setEditingOfferType(of.type);
                        setEditingOfferProduct(of.productName);
                        setEditingOfferCriteria(of.criteria);
                        setEditingOfferReward(of.reward);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Offer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(of.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================
          MODALS SECTION (Products, Categories, etc)
          ========================================= */}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Add New Product Master</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text" required placeholder="e.g. Standard Premium cement" value={name}
                    onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SKU / Code *</label>
                  <input
                    type="text" required placeholder="e.g. PRM-CEM-01" value={sku}
                    onChange={(e) => setSku(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={pCategory} onChange={(e) => setPCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price (৳) *</label>
                  <input
                    type="number" required min="0" step="0.01" placeholder="480" value={price}
                    onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cost Price (৳) *</label>
                  <input
                    type="number" required min="0" step="0.01" placeholder="410" value={cost}
                    onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Initial Stock *</label>
                  <input
                    type="number" required min="0" placeholder="100" value={stock}
                    onChange={(e) => setStock(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alert Qty</label>
                  <input
                    type="number" min="0" placeholder="20" value={alertQty}
                    onChange={(e) => setAlertQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pcs per Box</label>
                  <input
                    type="number" min="1" placeholder="e.g. 25" value={pcsPerBox}
                    onChange={(e) => setPcsPerBox(e.target.value)} className="w-full bg-[#ffffe2] border border-[#d9cc8c] rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                  <select
                    value={pUnit} onChange={(e) => setPUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse</label>
                  <select
                    value={pWarehouse} onChange={(e) => setPWarehouse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Enterprise Specifications Tab section */}
                <div className="col-span-2 mt-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1.5">Enterprise Specifications & Custom Fields</h4>
                  <ProductEnterpriseTabs
                    productData={extraFields}
                    setProductData={setExtraFields}
                    customFields={customFields}
                    currentUserRole="Administrator"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-md shadow-indigo-600/10">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Category</h4>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Name *</label>
                <input
                  type="text" required placeholder="e.g. Electrical Fittings" value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Unit</h4>
              <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUnitSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Name *</label>
                <input
                  type="text" required placeholder="e.g. Meters" value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Abbreviation *</label>
                <input
                  type="text" required placeholder="e.g. mtr" value={newUnitAbbrev}
                  onChange={(e) => setNewUnitAbbrev(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allow Fraction</label>
                <select value={newUnitBase} onChange={(e) => setNewUnitBase(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer">
                  <option value="Yes">Allowed (Decimals allowed)</option>
                  <option value="No">Integers Only</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowUnitModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Depot/Warehouse Modal */}
      {showWhModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Depot</h4>
              <button onClick={() => setShowWhModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleWhSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Depot Name *</label>
                <input
                  type="text" required placeholder="e.g. Yard C" value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location Address</label>
                <input
                  type="text" placeholder="e.g. Gazipur Crossroads" value={newWhLoc}
                  onChange={(e) => setNewWhLoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">depot Supervisor</label>
                <input
                  type="text" placeholder="e.g. M. Rahman" value={newWhMgr}
                  onChange={(e) => setNewWhMgr(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Storage Capacity Limit</label>
                <input
                  type="text" placeholder="e.g. 2000 Tons" value={newWhCap}
                  onChange={(e) => setNewWhCap(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowWhModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Depot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Stock Transfer</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Product</label>
                <select
                  value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold text-slate-700"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit} remaining)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer Quantity *</label>
                <input
                  type="number" required min="1" placeholder="e.g. 10" value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From (Source)</label>
                  <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer">
                    {warehouses.map((w) => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To (Destination)</label>
                  <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold text-indigo-600">
                    {warehouses.map((w) => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-md">Complete Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Offer Rule</h4>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Name *</label>
                <input
                  type="text" required placeholder="e.g. End of Season Paint Discount" value={offerName}
                  onChange={(e) => setOfferName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Type</label>
                <select value={offerType} onChange={(e) => setOfferType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer">
                  <option value="Bundle Bonus">Bundle Bonus (Buy X Get Y)</option>
                  <option value="Discount Code">Percentage/Fixed Discount</option>
                  <option value="Cashback Offer">Cashback Payback</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Affected Product</label>
                <select value={offerProduct} onChange={(e) => setOfferProduct(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer">
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Criteria *</label>
                <input
                  type="text" required placeholder="e.g. Purchase order exceeding 50 Bags" value={offerCriteria}
                  onChange={(e) => setOfferCriteria(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reward Value *</label>
                <input
                  type="text" required placeholder="e.g. 5% cash-back or 2 Free Bags" value={offerReward}
                  onChange={(e) => setOfferReward(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Activate Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Quick Editor Modal */}
      {editingStockId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Adjust Stock</h4>
              <button onClick={() => setEditingStockId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleStockSave} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-3 font-display">
                  Product: <span className="font-bold text-slate-800">{products.find(p => p.id === editingStockId)?.name}</span>
                </p>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Stock Level</label>
                <input
                  type="number" required min="0" value={editingStockVal}
                  onChange={(e) => setEditingStockVal(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingStockId(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCatName !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Category</h4>
              <button onClick={() => setEditingCatName(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditCategorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Name *</label>
                <input
                  type="text" required value={editingCatNewName}
                  onChange={(e) => setEditingCatNewName(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCatName(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Update Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editingUnitName !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Unit</h4>
              <button onClick={() => setEditingUnitName(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditUnitSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Name *</label>
                <input
                  type="text" required value={editingUnitNewName}
                  onChange={(e) => setEditingUnitNewName(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Abbreviation *</label>
                <input
                  type="text" required value={editingUnitAbbrev}
                  onChange={(e) => setEditingUnitAbbrev(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allow Fraction</label>
                <select value={editingUnitBase} onChange={(e) => setEditingUnitBase(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold">
                  <option value="Yes">Allowed (Decimals allowed)</option>
                  <option value="No">Integers Only</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingUnitName(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Update Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Depot/Warehouse Modal */}
      {editingWhName !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Depot</h4>
              <button onClick={() => setEditingWhName(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditWarehouseSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Depot Name *</label>
                <input
                  type="text" required value={editingWhNewName}
                  onChange={(e) => setEditingWhNewName(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location Address</label>
                <input
                  type="text" value={editingWhLoc}
                  onChange={(e) => setEditingWhLoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Depot Supervisor</label>
                <input
                  type="text" value={editingWhMgr}
                  onChange={(e) => setEditingWhMgr(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Storage Capacity Limit</label>
                <input
                  type="text" value={editingWhCap}
                  onChange={(e) => setEditingWhCap(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingWhName(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Update Depot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      {editingOfferId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Offer Rule</h4>
              <button onClick={() => setEditingOfferId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditOfferSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Name *</label>
                <input
                  type="text" required value={editingOfferName}
                  onChange={(e) => setEditingOfferName(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Offer Type</label>
                <select value={editingOfferType} onChange={(e) => setEditingOfferType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold">
                  <option value="Bundle Bonus">Bundle Bonus (Buy X Get Y)</option>
                  <option value="Discount Code">Percentage/Fixed Discount</option>
                  <option value="Cashback Offer">Cashback Payback</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Affected Product</label>
                <select value={editingOfferProduct} onChange={(e) => setEditingOfferProduct(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold">
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Criteria *</label>
                <input
                  type="text" required value={editingOfferCriteria}
                  onChange={(e) => setEditingOfferCriteria(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reward Value *</label>
                <input
                  type="text" required value={editingOfferReward}
                  onChange={(e) => setEditingOfferReward(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingOfferId(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Update Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProdId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Edit Product Catalog</h3>
              <button onClick={() => setEditingProdId(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleEditProductSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text" required value={editingProdName}
                    onChange={(e) => setEditingProdName(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SKU / Code *</label>
                  <input
                    type="text" required value={editingProdSku}
                    onChange={(e) => setEditingProdSku(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editingProdCategory} onChange={(e) => setEditingProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price (৳) *</label>
                  <input
                    type="number" required min="0" step="0.01" value={editingProdPrice}
                    onChange={(e) => setEditingProdPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cost Price (৳) *</label>
                  <input
                    type="number" required min="0" step="0.01" value={editingProdCost}
                    onChange={(e) => setEditingProdCost(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock *</label>
                  <input
                    type="number" required min="0" value={editingProdStock}
                    onChange={(e) => setEditingProdStock(e.target.value)} className="w-full bg-[#ffffe2] border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alert Qty</label>
                  <input
                    type="number" min="0" value={editingProdAlertQty}
                    onChange={(e) => setEditingProdAlertQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pcs per Box</label>
                  <input
                    type="number" min="1" value={editingProdPcsPerBox}
                    onChange={(e) => setEditingProdPcsPerBox(e.target.value)} className="w-full bg-[#ffffe2] border border-[#d9cc8c] rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                  <select
                    value={editingProdUnit} onChange={(e) => setEditingProdUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold"
                  >
                    {units.map((u) => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse</label>
                  <select
                    value={editingProdWarehouse} onChange={(e) => setEditingProdWarehouse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer font-bold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.name} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {/* Enterprise Specifications Tab section */}
                <div className="col-span-2 mt-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1.5">Enterprise Specifications & Custom Fields</h4>
                  <ProductEnterpriseTabs
                    productData={editingExtraFields}
                    setProductData={setEditingExtraFields}
                    customFields={customFields}
                    currentUserRole="Administrator"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setEditingProdId(null)} className="px-4 py-2 border border-slate-200 text-slate-500 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-md shadow-indigo-600/10">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Custom Fields Modal */}
      {showCustomFieldsModal && (
        <ManageCustomFieldsModal
          onClose={() => setShowCustomFieldsModal(false)}
          customFields={customFields}
          setCustomFields={(newFields) => {
            if (typeof newFields === 'function') {
              const resolved = (newFields as Function)(customFields);
              setCustomFields(resolved);
              const updatedCols = { ...visibleColumns };
              resolved.forEach((f: any) => {
                if (updatedCols[f.internalName] === undefined) {
                  updatedCols[f.internalName] = true;
                }
              });
              setVisibleColumns(updatedCols);
            } else {
              setCustomFields(newFields);
              const updatedCols = { ...visibleColumns };
              newFields.forEach((f: any) => {
                if (updatedCols[f.internalName] === undefined) {
                  updatedCols[f.internalName] = true;
                }
              });
              setVisibleColumns(updatedCols);
            }
          }}
        />
      )}

    </div>
  );
}
