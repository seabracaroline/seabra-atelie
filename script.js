const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

function salvarClientes() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function salvarPedidos() {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function mostrarMensagem(id, texto, tipo = "sucesso") {
  const div = document.getElementById(id);
  div.textContent = texto;
  div.className = tipo === "sucesso" ? "mensagem-sucesso" : "mensagem-erro";
  div.style.display = "block";

  setTimeout(() => {
    div.style.display = "none";
  }, 3000);
}

function gerarClasseStatus(status) {
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function atualizarClientes() {
  const tabela = document.querySelector("#clientesTable tbody");
  tabela.innerHTML = "";

  clientes.forEach((c, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${c.nome}</td>
        <td>${c.telefone}</td>
        <td>${c.email}</td>
        <td>
          <button onclick="editarCliente(${index})">Editar</button>
          <button onclick="excluirCliente(${index})">Excluir</button>
        </td>
      </tr>`;
  });
}

function atualizarClientesSelect() {
  const select = document.getElementById("clientePedido");
  select.innerHTML = '<option value="">Selecione o cliente</option>';

  clientes.forEach((c, index) => {
    select.innerHTML += `<option value="${index}">${c.nome}</option>`;
  });
}

function limparFormulario() {
  const form = document.getElementById("clienteForm");
  form.reset();
  delete form.dataset.editIndex;
}

function editarCliente(index) {
  const cliente = clientes[index];

  document.getElementById("nomeCliente").value = cliente.nome;
  document.getElementById("telefoneCliente").value = cliente.telefone;
  document.getElementById("emailCliente").value = cliente.email;

  document.getElementById("clienteForm").dataset.editIndex = index;
}

function excluirCliente(index) {
  if (!confirm("Tem certeza que deseja excluir?")) {
    return;
  }

  const clienteRemovido = clientes[index].nome;

  clientes.splice(index, 1);
  salvarClientes();

  for (let i = pedidos.length - 1; i >= 0; i--) {
    if (pedidos[i].cliente === clienteRemovido) {
      pedidos.splice(i, 1);
    }
  }

  salvarPedidos();

  atualizarClientes();
  atualizarClientesSelect();
  atualizarPedidos();
  atualizarCalendario();

  mostrarMensagem("mensagemCliente", "Cliente e pedidos excluídos com sucesso!", "sucesso");
}

function atualizarPedidos() {
  const tabela = document.querySelector("#pedidosTable tbody");
  tabela.innerHTML = "";

  pedidos.forEach((p, index) => {
    const classeStatus = gerarClasseStatus(p.status);

    tabela.innerHTML += `
      <tr>
        <td>${p.cliente}</td>
        <td>${p.produto}</td>
        <td>${p.quantidade}</td>
        <td>${p.data}</td>
        <td><span class="status ${classeStatus}">${p.status}</span></td>
        <td>
          <button onclick="concluirPedido(${index})">Concluir</button>
          <button onclick="editarPedido(${index})">Editar</button>
          <button onclick="excluirPedido(${index})">Excluir</button>
        </td>
      </tr>`;
  });
}

function mostrarTabela(tipo) {
  if (tipo === "clientes") {
    document.getElementById("clientesTable").style.display = "block";
  }

  if (tipo === "pedidos") {
    document.getElementById("pedidosTable").style.display = "block";
  }
}

function ocultarTabela(tipo) {
  if (tipo === "clientes") {
    document.getElementById("clientesTable").style.display = "none";
  }

  if (tipo === "pedidos") {
    document.getElementById("pedidosTable").style.display = "none";
  }
}

function concluirPedido(index) {
  pedidos[index].status = "Concluído";

  salvarPedidos();
  atualizarPedidos();
  atualizarCalendario();

  mostrarMensagem("mensagemPedido", "Pedido concluído com sucesso!");
}

function editarPedido(index) {
  const pedido = pedidos[index];

  document.getElementById("clientePedido").value = clientes.findIndex(c => c.nome === pedido.cliente);
  document.getElementById("produto").value = pedido.produto;
  document.getElementById("quantidade").value = pedido.quantidade;
  document.getElementById("dataPedido").value = pedido.data;
  document.getElementById("status").value = pedido.status;

  document.getElementById("pedidoForm").dataset.editIndex = index;
}

function excluirPedido(index) {
  if (!confirm("Tem certeza que deseja excluir este pedido?")) {
    return;
  }

  pedidos.splice(index, 1);

  salvarPedidos();
  atualizarPedidos();
  atualizarCalendario();

  mostrarMensagem("mensagemPedido", "Pedido excluído com sucesso!", "erro");
}

function adicionarEventoCalendario(pedido) {
  let cor;

  switch (pedido.status) {
    case "Concluído":
      cor = "#c6a13a";
      break;
    case "Em andamento":
      cor = "#1e6b3a";
      break;
    case "Cancelado":
      cor = "#999999";
      break;
    default:
      cor = "#6b1e1e";
  }

  calendar.addEvent({
    title: `${pedido.cliente} - ${pedido.produto} (${pedido.status})`,
    start: pedido.data,
    allDay: true,
    color: cor
  });
}

function atualizarCalendario() {
  if (!window.calendar) return;

  calendar.removeAllEvents();
  pedidos.forEach(adicionarEventoCalendario);
}

document.getElementById("clienteForm").addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const email = document.getElementById("emailCliente").value.trim();
  const editIndex = e.target.dataset.editIndex;

  if (!nome) {
    mostrarMensagem("mensagemCliente", "Nome é obrigatório!", "erro");
    return;
  }

  const regexTelefone = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

  if (!regexTelefone.test(telefone)) {
    mostrarMensagem("mensagemCliente", "Telefone inválido! Use o formato (XX) XXXXX-XXXX", "erro");
    return;
  }

  if (!email.includes("@")) {
    mostrarMensagem("mensagemCliente", "E-mail inválido!", "erro");
    return;
  }

  const emailDuplicado = clientes.some((c, i) => c.email === email && i != editIndex);

  if (emailDuplicado) {
    mostrarMensagem("mensagemCliente", "E-mail já cadastrado!", "erro");
    return;
  }

  const telefoneDuplicado = clientes.some((c, i) => c.telefone === telefone && i != editIndex);

  if (telefoneDuplicado) {
    mostrarMensagem("mensagemCliente", "Telefone já cadastrado!", "erro");
    return;
  }

  const cliente = {
    nome,
    telefone,
    email
  };

  if (editIndex !== undefined) {
    clientes[editIndex] = cliente;
    delete e.target.dataset.editIndex;
    mostrarMensagem("mensagemCliente", "Cliente atualizado com sucesso!");
  } else {
    clientes.push(cliente);
    mostrarMensagem("mensagemCliente", "Cliente salvo com sucesso!");
  }

  salvarClientes();
  atualizarClientes();
  atualizarClientesSelect();
  e.target.reset();
});

document.getElementById("pedidoForm").addEventListener("submit", e => {
  e.preventDefault();

  const clienteIndex = document.getElementById("clientePedido").value;
  const produto = document.getElementById("produto").value.trim();
  const quantidade = parseInt(document.getElementById("quantidade").value, 10);
  const data = document.getElementById("dataPedido").value;
  const status = document.getElementById("status").value;

  if (clienteIndex === "") {
    mostrarMensagem("mensagemPedido", "Selecione um cliente!", "erro");
    return;
  }

  if (!produto) {
    mostrarMensagem("mensagemPedido", "Informe o produto!", "erro");
    return;
  }

  if (isNaN(quantidade) || quantidade <= 0) {
    mostrarMensagem("mensagemPedido", "Quantidade inválida! Deve ser maior que zero.", "erro");
    return;
  }

  if (!data) {
    mostrarMensagem("mensagemPedido", "Informe a data do pedido!", "erro");
    return;
  }

  const pedido = {
    cliente: clientes[clienteIndex].nome,
    produto,
    quantidade,
    data,
    status
  };

  const editIndex = e.target.dataset.editIndex;

  if (editIndex !== undefined) {
    pedidos[editIndex] = pedido;
    delete e.target.dataset.editIndex;
    mostrarMensagem("mensagemPedido", "Pedido atualizado com sucesso!");
  } else {
    pedidos.push(pedido);
    mostrarMensagem("mensagemPedido", "Pedido salvo com sucesso!");
  }

  salvarPedidos();
  atualizarPedidos();
  atualizarCalendario();
  e.target.reset();
});

document.addEventListener("DOMContentLoaded", function () {
  atualizarClientes();
  atualizarClientesSelect();
  atualizarPedidos();

  const calendarEl = document.getElementById("calendar");

  window.calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek"
    }
  });

  calendar.render();
  atualizarCalendario();

  document.querySelectorAll(".aba").forEach(botao => {
    botao.addEventListener("click", () => {
      document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
      botao.classList.add("ativa");

      document.querySelectorAll(".conteudo-aba").forEach(secao => {
        secao.classList.remove("ativo");
      });

      const idAba = botao.dataset.aba;
      document.getElementById(idAba).classList.add("ativo");

      if (idAba === "agenda") {
        setTimeout(() => {
          calendar.updateSize();
        }, 100);
      }
    });
  });

  document.getElementById("btnMostrarClientes").addEventListener("click", () => {
    mostrarTabela("clientes");
  });

  document.getElementById("btnOcultarClientes").addEventListener("click", () => {
    ocultarTabela("clientes");
  });

  document.getElementById("btnMostrarPedidos").addEventListener("click", () => {
    mostrarTabela("pedidos");
  });

  document.getElementById("btnOcultarPedidos").addEventListener("click", () => {
    ocultarTabela("pedidos");
  });

  document.getElementById("telefoneCliente").addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    if (valor.length > 6) {
      e.target.value = `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      e.target.value = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    } else {
      e.target.value = valor;
    }
  });
});
