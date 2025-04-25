document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
      carregarProdutos();
    }
  
    if (window.location.pathname.endsWith('cadastro.html')) {
      const form = document.getElementById('product-form');
      
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('id');
      
      if (productId) {
        buscarProdutoPorId(productId);
      }
  
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nome', document.getElementById('name').value);
        formData.append('descricao', document.getElementById('description').value);
        formData.append('preco', document.getElementById('price').value);
        formData.append('quantidade_estoque', document.getElementById('stock').value);
        formData.append('categoria', document.getElementById('category').value);
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
          formData.append('imagem', imageFile);
        }
  
        let url = 'http://localhost:3000/produtos';
        let method = 'POST';
        if (productId) {
          url += `/${productId}`;
          method = 'PUT';
        }
  
        fetch(url, {
          method: method,
          body: formData
        })
        .then(response => response.json())
        .then(() => {
          alert('Produto salvo com sucesso!');
          window.location.href = 'index.html'; 
        })
        .catch(err => console.log('Erro ao salvar produto:', err));
      });
    }
  
    if (window.location.pathname.endsWith('detalhes.html')) {
      const id = new URLSearchParams(window.location.search).get('id');
      if (id) {
        buscarDetalhesProduto(id);
      }
    }
  });
  
  function carregarProdutos() {
    fetch('http://localhost:3000/produtos')
      .then(response => response.json())
      .then(produtos => {
        const lista = document.getElementById('product-list-ul');
        lista.innerHTML = '';
        produtos.forEach(prod => {
          const li = document.createElement('li');
          li.setAttribute('data-id', prod.id);
          
          const precoFormatado = Number(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
          li.innerHTML = `
            <img src="http://localhost:3000/uploads/${prod.imagem}" alt="${prod.nome}" style="width: 100px; vertical-align: middle;" />
            <strong>${prod.nome}</strong> - ${precoFormatado}
            <a href="detalhes.html?id=${prod.id}">Ver Detalhes</a>
            <button class="editar-btn" data-id="${prod.id}">Atualizar</button>
            <button class="excluir-btn" data-id="${prod.id}">Excluir</button>
          `;
          lista.appendChild(li);
        });
  
        document.querySelectorAll('.editar-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            window.location.href = `cadastro.html?id=${id}`;
          });
        });
  
        document.querySelectorAll('.excluir-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            excluirProduto(id);
          });
        });
      })
      .catch(err => console.log('Erro ao carregar produtos:', err));
  }
  
  function excluirProduto(id) {
    const confirmDelete = confirm('Tem certeza que deseja excluir este produto?');
    if (confirmDelete) {
      fetch(`http://localhost:3000/produtos/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(() => {
          alert('Produto excluído com sucesso!');
          carregarProdutos();
        })
        .catch(err => console.log('Erro ao excluir produto:', err));
    }
  }
  

  function buscarProdutoPorId(id) {
    fetch(`http://localhost:3000/produtos/${id}`)
      .then(response => response.json())
      .then(produto => {
        document.getElementById('name').value = produto.nome;
        document.getElementById('description').value = produto.descricao;
        document.getElementById('price').value = produto.preco;
        document.getElementById('stock').value = produto.quantidade_estoque;
        document.getElementById('category').value = produto.categoria;
      })
      .catch(err => console.log('Erro ao buscar produto para edição:', err));
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('detalhes.html')) {
      const id = new URLSearchParams(window.location.search).get('id');
      if (id) {
        buscarDetalhesProduto(id);
      }
    }
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
});

function buscarDetalhesProduto(id) {
  fetch(`http://localhost:3000/produtos/${id}`)
    .then(response => response.json())
    .then(produto => {
      document.getElementById('detail-name').textContent = produto.nome;
      document.getElementById('detail-description').textContent = produto.descricao;
      document.getElementById('detail-price').textContent = Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('detail-stock').textContent = produto.quantidade_estoque;
      document.getElementById('detail-category').textContent = produto.categoria;
      
      document.getElementById('detail-image').src = `http://localhost:3000/uploads/${produto.imagem}`;

      document.getElementById('product-detail').style.display = 'block';
    })
    .catch(err => console.log('Erro ao buscar detalhes do produto:', err));
}
