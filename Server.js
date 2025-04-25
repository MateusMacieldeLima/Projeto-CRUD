const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir imagens

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'produtos_db'
});

db.connect((err) => {
  if (err) return console.error('Erro ao conectar:', err);
  console.log('Conectado ao MySQL');
});

// Função de validação
const validateProduct = ({ nome, descricao, preco, quantidade_estoque, categoria }) =>
  nome && descricao && preco && quantidade_estoque && categoria;

// [GET] Listar todos os produtos
app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// [GET] Produto por ID
app.get('/produtos/:id', (req, res) => {
  db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// [POST] Cadastrar produto com imagem
app.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, quantidade_estoque, categoria } = req.body;
  const imagem = req.file ? req.file.filename : null;

  if (!validateProduct(req.body)) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  const query = 'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, categoria, imagem, data_criacao) VALUES (?, ?, ?, ?, ?, ?, NOW())';
  db.query(query, [nome, descricao, preco, quantidade_estoque, categoria, imagem], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId });
  });
});

// [PUT] Atualizar produto
app.put('/produtos/:id', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, quantidade_estoque, categoria } = req.body;
  const imagem = req.file ? req.file.filename : null;
  const id = req.params.id;

  if (!validateProduct(req.body)) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  const fields = imagem
    ? [nome, descricao, preco, quantidade_estoque, categoria, imagem, id]
    : [nome, descricao, preco, quantidade_estoque, categoria, id];

  const query = imagem
    ? 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ?, categoria = ?, imagem = ? WHERE id = ?'
    : 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ?, categoria = ? WHERE id = ?';

  db.query(query, fields, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Produto atualizado com sucesso' });
  });
});

// [DELETE] Produto
app.delete('/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Produto removido' });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
