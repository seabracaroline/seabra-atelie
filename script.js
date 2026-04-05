// =========================
// VARIÁVEIS E LOCALSTORAGE
// =========================
const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

// Funções utilitárias
function salvarClientes() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function salvarPedidos() {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// =========================
// FEEDBACK VISUAL
// =========================
function mostrarMensagem(id, texto, tipo = "sucesso") {
  const div = document.getElementById(id);
  div.textContent = texto;
  div.className = tipo === "sucesso" ? "mensagem-sucesso" : "mensagem-erro";
  div.style.display = "block";
  setTimeout(() => div.style.display = "none", 3000);
}

// =========================
// CLIENTES
// =========================
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

function editarCliente(index) {
  const cliente = clientes[index];
  document.getElementById("nomeCliente").value = cliente.nome;
  document.getElementById("telefoneCliente").value = cliente.telefone;
  document.getElementById("emailCliente").value = cliente.email;

  document.getElementById("clienteForm").dataset.editIndex = index;
}

function excluirCliente(index) {
  const clienteRemovido = clientes[index].nome;

  // Remove o cliente
  clientes.splice(index, 1);
  salvarClientes();

  // Remove todos os pedidos desse cliente
  for (let i = pedidos.length - 1; i >= 0; i--) {
    if (pedidos[i].cliente === clienteRemovido) {
      pedidos.splice(i, 1);
    }
  }
  salvarPedidos();

  // Atualiza tabelas e calendário
  atualizarClientes();
  atualizarClientesSelect();
  atualizarPedidos();
  atualizarCalendario();

  mostrarMensagem("mensagemCliente", "Cliente e pedidos excluídos com sucesso!", "erro");
}

// =========================
// PEDIDOS
// =========================
function atualizarPedidos() {
  const tabela = document.querySelector("#pedidosTable tbody");
  tabela.innerHTML = "";
  pedidos.forEach((p, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${p.cliente}</td>
        <td>${p.produto}</td>
        <td>${p.quantidade}</td>
        <td>${p.data}</td>
        <td><span class="status ${p.status.toLowerCase()}">${p.status}</span></td>
        <td>
          <button onclick="concluirPedido(${index})">Concluir</button>
          <button onclick="editarPedido(${index})">Editar</button>
          <button onclick="excluirPedido(${index})">Excluir</button>
        </td>
      </tr>`;
  });
}

function mostrarTabela(tipo) {
  document.getElementById("clientesTable").style.display = tipo === "clientes" ? "block" : "none";
  document.getElementById("pedidosTable").style.display = tipo === "pedidos" ? "block" : "none";
}

function ocultarTabelas() {
  document.getElementById("clientesTable").style.display = "none";
  document.getElementById("pedidosTable").style.display = "none";
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
  pedidos.splice(index, 1);
  salvarPedidos();
  atualizarPedidos();
  atualizarCalendario();
  mostrarMensagem("mensagemPedido", "Pedido excluído com sucesso!", "erro");
}

// =========================
// CALENDÁRIO
// =========================
function adicionarEventoCalendario(pedido) {
  let cor;
  switch (pedido.status) {
    case "Concluído": cor = "#c6a13a"; break; // dourado
    case "Em andamento": cor = "#1e6b3a"; break; // verde
    case "Cancelado": cor = "#999999"; break; // cinza
    default: cor = "#6b1e1e"; // vinho para pendente
  }
  calendar.addEvent({
    title: `${pedido.cliente} - ${pedido.produto} (${pedido.status})`,
    start: pedido.data,
    allDay: true,
    color: cor
  });
}

function atualizarCalendario() {
  calendar.removeAllEvents();
  pedidos.forEach(adicionarEventoCalendario);
}

// =========================
// EVENTOS DE FORMULÁRIOS
// =========================
document.getElementById("clienteForm").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const email = document.getElementById("emailCliente").value.trim();

  // Validação do nome
  if (!nome) {
    mostrarMensagem("mensagemCliente", "Nome é obrigatório!", "erro");
    return;
  }

  // Validação do telefone
  const regexTelefone = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!regexTelefone.test(telefone)) {
    mostrarMensagem("mensagemCliente", "Telefone inválido! Use o formato (XX) XXXXX-XXXX", "erro");
    return;
  }

  // Validação do e-mail
  if (!email.includes("@")) {
    mostrarMensagem("mensagemCliente", "E-mail inválido!", "erro");
    return;
  }

  // 🚨 Verificação de duplicidade de e-mail
  const emailDuplicado = clientes.some(c => c.email === email);
  if (emailDuplicado && e.target.dataset.editIndex === undefined) {
    mostrarMensagem("mensagemCliente", "E-mail já cadastrado!", "erro");
    return;
  }

  const cliente = { nome, telefone, email };

  const editIndex = e.target.dataset.editIndex;
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
  const pedido = {
    cliente: clientes[clienteIndex]?.nome || "Não informado",
    produto: document.getElementById("produto").value,
    quantidade: document.getElementById("quantidade").value,
    data: document.getElementById("dataPedido").value,
    status: document.getElementById("status").value
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

// =========================
// INICIALIZAÇÃO
// =========================
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
  pedidos.forEach(adicionarEventoCalendario);

  // Eventos dos botões de mostrar/ocultar tabelas
  document.getElementById("btnMostrarClientes").addEventListener("click", () => {
    mostrarTabela("clientes");
  });

  document.getElementById("btnOcultarClientes").addEventListener("click", () => {
    ocultarTabelas();
  });

  document.getElementById("btnMostrarPedidos").addEventListener("click", () => {
    mostrarTabela("pedidos");
  });

  document.getElementById("btnOcultarPedidos").addEventListener("click", () => {
    ocultarTabelas();
  });

  // Máscara para telefone (DDD) 99999-9999
  document.getElementById("telefoneCliente").addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não for número
    if (valor.length > 11) valor = valor.slice(0, 11); // limita a 11 dígitos

    if (valor.length > 6) {
      e.target.value = `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      e.target.value = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    } else {
      e.target.value = valor;
    }
  });
});
