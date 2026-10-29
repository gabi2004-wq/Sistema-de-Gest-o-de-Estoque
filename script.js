let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let historico = JSON.parse(localStorage.getItem("historicoEstoque")) || [];

const formProduto = document.getElementById("formProduto");
const formMovimentacao = document.getElementById("formMovimentacao");
const listaProdutos = document.getElementById("listaProdutos");
const listaHistorico = document.getElementById("listaHistorico");
const pesquisa = document.getElementById("pesquisa");

// Salvar dados no navegador
function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("historicoEstoque", JSON.stringify(historico));
}

// Formatar valores em reais
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Atualizar indicadores
function atualizarIndicadores() {
    const totalUnidades = produtos.reduce(
        (total, produto) => total + produto.quantidade, 0
    );

    const estoqueBaixo = produtos.filter(
        produto => produto.quantidade <= 5
    ).length;

    document.getElementById("totalProdutos").textContent = produtos.length;
    document.getElementById("totalUnidades").textContent = totalUnidades;
    document.getElementById("estoqueBaixo").textContent = estoqueBaixo;
}

// Atualizar lista de produtos para movimentação
function atualizarSelecaoProdutos() {
    const selecao = document.getElementById("produtoMovimentacao");

    selecao.innerHTML = '<option value="">Selecione um produto</option>';

    produtos.forEach(produto => {
        const opcao = document.createElement("option");
        opcao.value = produto.id;
        opcao.textContent = produto.nome;
        selecao.appendChild(opcao);
    });
}

// Mostrar produtos cadastrados
function mostrarProdutos(filtro = "") {
    listaProdutos.innerHTML = "";

    const encontrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(filtro.toLowerCase())
    );

    if (encontrados.length === 0) {
        listaProdutos.textContent = "Nenhum produto encontrado.";
        return;
    }

    encontrados.forEach(produto => {
        const card = document.createElement("div");
        card.className = "produto";

        const informacoes = document.createElement("div");

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const codigo = document.createElement("p");
        codigo.textContent = "Código: " + produto.codigo;

        const categoria = document.createElement("p");
        categoria.textContent = "Categoria: " + produto.categoria;

        const preco = document.createElement("p");
        preco.textContent = "Preço: " + formatarMoeda(produto.preco);

        const quantidade = document.createElement("p");
        quantidade.textContent = "Quantidade: " + produto.quantidade;

        if (produto.quantidade <= 5) {
            quantidade.classList.add("alerta");
            quantidade.textContent += " - ESTOQUE BAIXO";
        }

        informacoes.append(
            nome, codigo, categoria, preco, quantidade
        );

        const botao = document.createElement("button");
        botao.textContent = "Excluir";

        botao.addEventListener("click", () => {
            const confirmar = confirm(
                "Deseja realmente excluir este produto?"
            );

            if (!confirmar) return;

            produtos = produtos.filter(
                item => item.id !== produto.id
            );

            salvarDados();
            atualizarTudo();
        });

        card.append(informacoes, botao);
        listaProdutos.appendChild(card);
    });
}

// Mostrar histórico de movimentações
function mostrarHistorico() {
    listaHistorico.innerHTML = "";

    if (historico.length === 0) {
        listaHistorico.textContent =
            "Nenhuma movimentação registrada.";
        return;
    }

    historico.slice().reverse().forEach(item => {
        const registro = document.createElement("div");
        registro.className = "historico-item";

        const texto = document.createElement("p");

        texto.textContent =
            `${item.tipo === "entrada" ? "Entrada" : "Saída"} de ` +
            `${item.quantidade} unidade(s) de ${item.produto}`;

        const data = document.createElement("small");
        data.textContent = item.data;

        registro.append(texto, data);
        listaHistorico.appendChild(registro);
    });
}
// Atualizar todo o sistema
function atualizarTudo() {
    atualizarIndicadores();
    atualizarSelecaoProdutos();
    mostrarProdutos(pesquisa.value);
    mostrarHistorico();
}

// Cadastrar produto
formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const codigo = document.getElementById("codigo").value.trim();
    const categoria = document.getElementById("categoria").value;
    const preco = Number(document.getElementById("preco").value);
    const quantidade = Number(
        document.getElementById("quantidade").value
    );

    if (
        !nome || !codigo || !categoria ||
        !Number.isFinite(preco) || preco <= 0 ||
        !Number.isInteger(quantidade) || quantidade < 0
    ) {
        alert("Preencha todos os campos com valores válidos.");
        return;
    }

    const codigoExistente = produtos.some(
        produto => produto.codigo.toLowerCase() === codigo.toLowerCase()
    );

    if (codigoExistente) {
        alert("Já existe um produto com esse código.");
        return;
    }

    const novoProduto = {
        id: Date.now(),
        nome,
        codigo,
        categoria,
        preco,
        quantidade
    };

    produtos.push(novoProduto);

    salvarDados();
    formProduto.reset();
    atualizarTudo();

    alert("Produto cadastrado com sucesso!");
});

// Registrar entrada ou saída
formMovimentacao.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(
        document.getElementById("produtoMovimentacao").value
    );

    const tipo = document.getElementById("tipoMovimentacao").value;

    const quantidade = Number(
        document.getElementById("quantidadeMovimentacao").value
    );

    const produto = produtos.find(item => item.id === id);

    if (!produto || !Number.isInteger(quantidade) || quantidade <= 0) {
        alert("Selecione um produto e informe uma quantidade válida.");
        return;
    }

    if (tipo === "saida" && quantidade > produto.quantidade) {
        alert("Estoque insuficiente para essa saída.");
        return;
    }

    if (tipo === "entrada") {
        produto.quantidade += quantidade;
    } else {
        produto.quantidade -= quantidade;
    }

    historico.push({
        produto: produto.nome,
        tipo,
        quantidade,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarDados();
    formMovimentacao.reset();
    atualizarTudo();

    alert("Movimentação registrada com sucesso!");
});

// Pesquisa de produtos
pesquisa.addEventListener("input", function() {
    mostrarProdutos(pesquisa.value);
});

// Inicializar sistema
atualizarTudo();