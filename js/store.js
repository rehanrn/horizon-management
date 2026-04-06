const Store = {
    keys: ['students', 'teachers', 'courses', 'fees', 'attendance'],

    init() {
        // One-time forced wipe of the old database to clean out all dummy records
        if (!localStorage.getItem('app_production_reset_engaged')) {
            localStorage.clear();
            localStorage.setItem('app_production_reset_engaged', 'true');
        }

        // Initialize pristine empty tables
        this.keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        // NOTE: All hardcoded placeholder dummy data has been permanently deleted from here!
    },

    getAll(entity) {
        try {
            const data = localStorage.getItem(entity);
            return data ? JSON.parse(data) : [];
        } catch (err) {
            console.error(`Store: Failed to parse ${entity}. Data may be corrupt. Reseting to empty.`, err);
            return [];
        }
    },

    getById(entity, id) {
        return this.getAll(entity).find(item => item.id == id);
    },

    // Standardize & Sanitize all data entries
    sanitize(data) {
        const clean = { ...data };
        for (let key in clean) {
            if (typeof clean[key] === 'string') {
                clean[key] = clean[key].trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        }
        return clean;
    },

    add(entity, data) {
        const items = this.getAll(entity);
        const cleanData = this.sanitize(data);
        
        if(!cleanData.id) cleanData.id = Date.now().toString() + Math.floor(Math.random()*1000);
        if(!cleanData.createdAt) cleanData.createdAt = new Date().toISOString();
        
        items.push(cleanData);
        localStorage.setItem(entity, JSON.stringify(items));
        return cleanData;
    },

    update(entity, id, updatedData) {
        let items = this.getAll(entity);
        const cleanData = this.sanitize(updatedData);
        
        items = items.map(item => {
            if (item.id === id) {
                return { ...item, ...cleanData, id: id };
            }
            return item;
        });
        localStorage.setItem(entity, JSON.stringify(items));
    },

    delete(entity, id) {
        let items = this.getAll(entity);
        items = items.filter(item => item.id !== id);
        localStorage.setItem(entity, JSON.stringify(items));
    },

    // --- Enterprise Data Management ---
    exportData() {
        const data = {};
        ['students', 'teachers', 'courses', 'attendance', 'fees'].forEach(key => {
            data[key] = this.getAll(key);
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Horizon_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
            });
            return true;
        } catch (e) {
            console.error("Store: Import failed", e);
            return false;
        }
    },

    clearAll() {
        ['students', 'teachers', 'courses', 'attendance', 'fees'].forEach(key => {
            localStorage.setItem(key, JSON.stringify([]));
        });
    }
};

Store.init();
