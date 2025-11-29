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
export type Order = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  orderDate: string;
  customerName: string;
  productName?: string;
};

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
      
      // 4️⃣ Tạo bảng cart
      tx.executeSql(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )`);
      
      // 5️⃣ Tạo bảng orders
      tx.executeSql(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        totalPrice REAL,
        status TEXT DEFAULT 'pending',
        orderDate TEXT,
        customerName TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )`);
      
      // Thêm dữ liệu đơn hàng mẫu
      const sampleOrders = [
        [1, 1, 2, 500000, 'pending', '2024-01-15', 'Nguyễn Văn A'],
        [1, 2, 1, 1100000, 'processing', '2024-01-16', 'Trần Thị B'],
        [1, 3, 1, 490000, 'completed', '2024-01-17', 'Lê Văn C'],
        [1, 4, 3, 360000, 'pending', '2024-01-18', 'Phạm Thị D'],
        [1, 5, 1, 980000, 'processing', '2024-01-19', 'Hoàng Văn E']
      ];
      
      sampleOrders.forEach(order => {
        tx.executeSql(
          'INSERT OR IGNORE INTO orders (userId, productId, quantity, totalPrice, status, orderDate, customerName) VALUES (?, ?, ?, ?, ?, ?, ?)',
          order
        );
      });
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

export const updateUser = async (id: number, username: string, password: string, role: string): Promise<void> => {
  const db = await getDb();
  await db.executeSql('UPDATE users SET username=?, password=?, role=? WHERE id=?', [username, password, role, id]);
}

export const fetchUserById = async (id: number): Promise<User | null> => {
  const db = await getDb();
  const [res] = await db.executeSql('SELECT * FROM users WHERE id=?', [id]);
  const rows = res.rows;
  if (rows.length > 0) {
    return rows.item(0) as User;
  }
  return null;
}

// ====================== ORDER FUNCTIONS ======================
// export type Order = {
//   id: number;
//   userId: number;
//   productId: number;
//   quantity: number;
//   totalPrice: number;
//   status: string;
//   orderDate: string;
//   customerName: string;
//   productName: string;
// };

export const initOrdersTable = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        totalPrice REAL,
        status TEXT DEFAULT 'pending',
        orderDate TEXT,
        customerName TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      )
    `);
    
    // Thêm dữ liệu mẫu
    const sampleOrders = [
      { userId: 1, productId: 1, quantity: 2, totalPrice: 500000, status: 'pending', orderDate: '2024-01-15', customerName: 'Nguyễn Văn A' },
      { userId: 1, productId: 2, quantity: 1, totalPrice: 1100000, status: 'processing', orderDate: '2024-01-16', customerName: 'Trần Thị B' },
      { userId: 1, productId: 3, quantity: 1, totalPrice: 490000, status: 'completed', orderDate: '2024-01-17', customerName: 'Lê Văn C' },
    ];
    
    for (const order of sampleOrders) {
      await db.executeSql(
        'INSERT OR IGNORE INTO orders (userId, productId, quantity, totalPrice, status, orderDate, customerName) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [order.userId, order.productId, order.quantity, order.totalPrice, order.status, order.orderDate, order.customerName]
      );
    }
  } catch (error) {
    console.error('❌ Error initializing orders table:', error);
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const db = await getDb();
    const results = await db.executeSql(`
      SELECT 
        o.id, o.userId, o.productId, o.quantity, o.totalPrice, o.status, o.orderDate, o.customerName,
        p.name as productName
      FROM orders o
      LEFT JOIN products p ON o.productId = p.id
      ORDER BY o.orderDate DESC
    `);
    const rows = results[0].rows;
    const list: Order[] = [];
    for (let i = 0; i < rows.length; i++) list.push(rows.item(i));
    return list;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (id: number, status: string): Promise<void> => {
  const db = await getDb();
  await db.executeSql('UPDATE orders SET status=? WHERE id=?', [status, id]);
};

// ====================== CART FUNCTIONS ======================
export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productImg: string;
};

export const initCartTable = async (): Promise<void> => {
  const db = await getDb();
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      productId INTEGER,
      quantity INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )
  `);
};

export const addToCart = async (userId: number, productId: number, quantity: number = 1): Promise<void> => {
  const db = await getDb();
  const [result] = await db.executeSql('SELECT * FROM cart WHERE userId=? AND productId=?', [userId, productId]);
  
  if (result.rows.length > 0) {
    const existingItem = result.rows.item(0);
    await db.executeSql('UPDATE cart SET quantity=? WHERE id=?', [existingItem.quantity + quantity, existingItem.id]);
  } else {
    await db.executeSql('INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
  }
};

export const fetchCartItems = async (userId: number): Promise<CartItem[]> => {
  const db = await getDb();
  const [result] = await db.executeSql(`
    SELECT c.id, c.userId, c.productId, c.quantity, p.name as productName, p.price as productPrice, p.img as productImg
    FROM cart c
    JOIN products p ON c.productId = p.id
    WHERE c.userId = ?
  `, [userId]);
  
  const items: CartItem[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
};

export const updateCartQuantity = async (cartId: number, quantity: number): Promise<void> => {
  const db = await getDb();
  if (quantity <= 0) {
    await db.executeSql('DELETE FROM cart WHERE id=?', [cartId]);
  } else {
    await db.executeSql('UPDATE cart SET quantity=? WHERE id=?', [quantity, cartId]);
  }
};

export const removeFromCart = async (cartId: number): Promise<void> => {
  const db = await getDb();
  await db.executeSql('DELETE FROM cart WHERE id=?', [cartId]);
};

export const clearCart = async (userId: number): Promise<void> => {
  const db = await getDb();
  await db.executeSql('DELETE FROM cart WHERE userId=?', [userId]);
};

export const createOrder = async (userId: number, customerName: string, cartItems: CartItem[]): Promise<void> => {
  const db = await getDb();
  const orderDate = new Date().toISOString().split('T')[0];
  
  for (const item of cartItems) {
    await db.executeSql(
      'INSERT INTO orders (userId, productId, quantity, totalPrice, status, orderDate, customerName) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, item.productId, item.quantity, item.productPrice * item.quantity, 'pending', orderDate, customerName]
    );
  }
  
  await clearCart(userId);
};

export const fetchUserOrders = async (userId: number): Promise<Order[]> => {
  const db = await getDb();
  const [result] = await db.executeSql(`
    SELECT o.id, o.userId, o.productId, o.quantity, o.totalPrice, o.status, o.orderDate, o.customerName, p.name as productName
    FROM orders o
    LEFT JOIN products p ON o.productId = p.id
    WHERE o.userId = ?
    ORDER BY o.orderDate DESC
  `, [userId]);
  
  const orders: Order[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    orders.push(result.rows.item(i));
  }
  return orders;
};

export const updateUserProfile = async (userId: number, username: string, password: string): Promise<void> => {
  const db = await getDb();
  await db.executeSql('UPDATE users SET username=?, password=? WHERE id=?', [username, password, userId]);
};
