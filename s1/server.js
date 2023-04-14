const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

const authRoutes = require('./routes/auth');
// const containersRouter = require('./routes/containers');
// const boxesRouter = require('./routes/boxes');


// app.use('/containers', containersRouter);
// app.use('/boxes', boxesRouter);
app.use('/auth', authRoutes);

app.listen(3001, () => {
  console.log('Server started on port 3001');
});

const createDatabaseAndTables = async () => {
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS container_management';
  const createContainersTableQuery = `
    CREATE TABLE IF NOT EXISTS containers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL,
      size ENUM('S', 'M', 'L') NOT NULL,
      capacity INT NOT NULL
    );
  `;
  const createBoxesTableQuery = `
    CREATE TABLE IF NOT EXISTS boxes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      weight FLOAT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_image VARCHAR(255),
      is_flammable BOOLEAN NOT NULL,
      is_perishable BOOLEAN NOT NULL,
      container_id INT,
      FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
    );
  `;

  await db.promise().query(createDatabaseQuery);
  await db.changeUser({ database: 'container_management' });
  await db.promise().query(createContainersTableQuery);
  await db.promise().query(createBoxesTableQuery);
};

createDatabaseAndTables();
