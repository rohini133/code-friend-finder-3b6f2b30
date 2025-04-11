
/**
 * Utility for managing offline data storage
 * This serves as an alternative to Supabase when working in offline mode
 */

// Initialize localStorage if it doesn't exist
const initializeStore = (storeName: string) => {
  if (!localStorage.getItem(storeName)) {
    localStorage.setItem(storeName, JSON.stringify([]));
  }
};

// Generic get function
export const getItems = <T>(storeName: string): T[] => {
  initializeStore(storeName);
  const data = localStorage.getItem(storeName);
  return data ? JSON.parse(data) : [];
};

// Generic add function
export const addItem = <T>(storeName: string, item: T): T => {
  const items = getItems<T>(storeName);
  const newItem = {
    ...item,
    id: crypto.randomUUID(), // Generate a random UUID
    createdAt: new Date().toISOString(),
  };
  
  items.push(newItem);
  localStorage.setItem(storeName, JSON.stringify(items));
  return newItem;
};

// Generic update function
export const updateItem = <T extends { id: string }>(storeName: string, item: T): T => {
  const items = getItems<T>(storeName);
  const index = items.findIndex(i => (i as any).id === item.id);
  
  if (index !== -1) {
    items[index] = {
      ...item,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storeName, JSON.stringify(items));
  }
  
  return item;
};

// Generic delete function
export const deleteItem = <T extends { id: string }>(storeName: string, id: string): boolean => {
  const items = getItems<T>(storeName);
  const filteredItems = items.filter(item => (item as any).id !== id);
  
  if (filteredItems.length !== items.length) {
    localStorage.setItem(storeName, JSON.stringify(filteredItems));
    return true;
  }
  
  return false;
};

// Data backup function
export const backupData = (): string => {
  const backup: Record<string, any> = {};
  
  // Get all data from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = JSON.parse(value);
      }
    }
  }
  
  // Create downloadable JSON blob
  const dataStr = JSON.stringify(backup);
  const downloadJson = `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  return downloadJson;
};

// Data restore function
export const restoreData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    localStorage.clear();
    
    // Restore data
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
    
    return true;
  } catch (error) {
    console.error("Error restoring data:", error);
    return false;
  }
};

// Export store names to ensure consistency across the app
export const STORE_NAMES = {
  PRODUCTS: "demo_products",
  BILLS: "demo_bills",
  INVENTORY: "demo_inventory",
  USERS: "demo_users",
  SETTINGS: "demo_settings",
};

// Initialize default settings
export const initializeSettings = () => {
  const settings = localStorage.getItem(STORE_NAMES.SETTINGS);
  
  if (!settings) {
    const defaultSettings = {
      offlineMode: true,
      autoPrint: true,
      currency: "INR",
      currencySymbol: "₹ ",
      businessName: "Demo",
      businessAddress: "123 Main Street, Bangalore, India",
      businessPhone: "+91 9876543210",
      businessEmail: "contact@demolocalstore.com",
      taxRate: 18, // GST rate
    };
    
    localStorage.setItem(STORE_NAMES.SETTINGS, JSON.stringify(defaultSettings));
  }
};

// Get application settings
export const getSettings = (): Record<string, any> => {
  initializeSettings();
  const settings = localStorage.getItem(STORE_NAMES.SETTINGS);
  return settings ? JSON.parse(settings) : {};
};

// Update application settings
export const updateSettings = (newSettings: Record<string, any>): Record<string, any> => {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  localStorage.setItem(STORE_NAMES.SETTINGS, JSON.stringify(updatedSettings));
  return updatedSettings;
};
