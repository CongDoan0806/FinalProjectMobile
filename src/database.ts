// file myDatabase.db nằm ở /data/data/com.libraryappsqlite/databases/myDatabase.db
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

// Mở (hoặc tạo mới) database
const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'myDatabase.db', location: 'default' });
  return db;
};

// Kiểu dữ liệu
export type Category = { id: number; name: string; };
export type Product = { id: number; name: string; price: number; img: string; categoryId: number; };
export type User = { id: number; username: string; password: string; role: string; };

// Dữ liệu mẫu
const initialCategories: Category[] = [
  { id: 1, name: 'Áo' }, { id: 2, name: 'Giày' }, { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' }, { id: 5, name: 'Túi' },
];
const initialProducts: Product[] = [
  { id: 1, name: 'Áo sơ mi', price: 250000, img: 'hinh1.jpg', categoryId: 1 },
  { id: 2, name: 'Giày sneaker', price: 1100000, img: 'hinh1.jpg', categoryId: 2 },
  { id: 3, name: 'Balo thời trang', price: 490000, img: 'hinh1.jpg', categoryId: 3 },
  { id: 4, name: 'Mũ lưỡi trai', price: 120000, img: 'hinh1.jpg', categoryId: 4 },
  { id: 5, name: 'Túi xách nữ', price: 980000, img: 'hinh1.jpg', categoryId: 5 },
];

// ========================== KHỞI TẠO DATABASE ==========================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    database.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS products');
      // tx.executeSql('DROP TABLE IF EXISTS categories');

      // 1️⃣ Tạo bảng categories
      tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
      initialCategories.forEach((c) =>
        tx.executeSql('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [c.id, c.name])
      );

      // 2️⃣ Tạo bảng products
      tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        img TEXT,
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )`);

      initialProducts.forEach((p) =>
        tx.executeSql('INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
          [p.id, p.name, p.price, p.img, p.categoryId])
      );

      // 3️⃣ Tạo bảng users
      tx.executeSql(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      // Tạo user admin mặc định
      tx.executeSql(`
        INSERT INTO users (username, password, role)
        SELECT 'admin', '123456', 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
      `);
    },
      (error) => console.error('❌ Transaction error:', error),
      () => {
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();
      }
    );
  } catch (error) {
    console.error('❌ initDatabase outer error:', error);
  }
};

// ========================== HÀM TRUY VẤN DỮ LIỆU ==========================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM categories');
    const rows = results[0].rows;
    const list: Category[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (p: Omit<Product, 'id'>) => {
  const db = await getDb();
  await db.executeSql('INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
    [p.name, p.price, p.img, p.categoryId]);
};

export const addCategory = async (name: string): Promise<void> => {
  const db = await getDb();
  await db.executeSql('INSERT INTO categories (name) VALUES (?)', [name]);
}

export const deleteCategory = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.executeSql('DELETE FROM categories WHERE id=?', [id]);
}

export const fetchCategoryById = async (id: number): Promise<Category | null> => {
  const db = await getDb();
  const [res] = await db.executeSql('SELECT * FROM categories WHERE id=?', [id]);
  const rows = res.rows;
  if (rows.length > 0) {
    return rows.item(0) as Category;
  }
  return null;
}

export const updateCategory = async (id: number, name: string): Promise<void> => {
  const db = await getDb();
  await db.executeSql('UPDATE categories SET name=? WHERE id=?', [name, id]);
}

export const updateProduct = async (p: Product) => {
  const db = await getDb();
  await db.executeSql('UPDATE products SET name=?, price=?, img=?, categoryId=? WHERE id=?',
    [p.name, p.price, p.img, p.categoryId, p.id]);
};

export const deleteProduct = async (id: number) => {
  const db = await getDb();
  await db.executeSql('DELETE FROM products WHERE id=?', [id]);
};

export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  const db = await getDb();
  const [res] = await db.executeSql(`
    SELECT products.* FROM products
    JOIN categories ON products.categoryId = categories.id
    WHERE products.name LIKE ? OR categories.name LIKE ?
  `, [`%${keyword}%`, `%${keyword}%`]);
  const rows = res.rows;
  const list: Product[] = [];
  for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
  return list;
};

// ====================== FILTER PRODUCTS ======================
export const filterProducts = async (
  nameKeyword?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> => {
  try {
    const db = await getDb();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (nameKeyword && nameKeyword.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${nameKeyword.trim()}%`);
    }

    if (minPrice !== undefined && minPrice !== null) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    const results = await db.executeSql(query, params);
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error filtering products:', error);
    return [];
  }
};

// ====================== FETCH PRODUCTS BY CATEGORY ======================
export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const results = await db.executeSql('SELECT * FROM products WHERE categoryId = ?', [categoryId]);
    const rows = results[0].rows;
    const list: Product[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// ====================== USER FUNCTIONS ======================
export const addUser = async (username: string, password: string, role: string = 'user'): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
  } catch (error: any) {
    console.error('❌ Error adding user:', error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await getDb();
    const results = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    const rows = results[0].rows;
    if (rows.length > 0) {
      return rows.item(0) as User;
    }
    return null;
  } catch (error) {
    console.error('❌ Error logging in user:', error);
    return null;
  }
};

export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const db = await getDb();
    const results = await db.executeSql('SELECT * FROM products WHERE id = ?', [id]); 
    const rows = results[0].rows;
    if (rows.length > 0) {
      return rows.item(0) as Product;
    } 
    return null;
  } catch (error) {
    console.error('❌ Error fetching product by id:', error);
    return null;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM users');
    const rows = results[0].rows;
    const list: User[] = [];  
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  } 
};

export const deleteUser = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.executeSql('DELETE FROM users WHERE id=?', [id]);
}
