const Modal = {
  modal: document.querySelector(".modal-overlay"),
  open() {
    this.modal.classList.add("active");
  },
  close() {
    this.modal.classList.remove("active");
  },
};

const StorageTransactions = {
  get() {
    return JSON.parse(localStorage.getItem("@devFinances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "@devFinances:transactions",
      JSON.stringify(transactions),
    );
  },
};

const Transaction = {
  transactions: StorageTransactions.get(),
  add(transaction) {
    this.transactions.push(transaction);

    App.reload();
  },
  remove(index) {
    this.transactions.splice(index, 1);

    App.reload();
  },
  incomes() {
    const income = this.transactions.reduce((accumulator, transaction) => {
      if (transaction.amount > 0) {
        accumulator += transaction.amount;
      }

      return accumulator;
    }, 0);

    return income;
  },
  expenses() {
    const expense = this.transactions.reduce((accumulator, transaction) => {
      if (transaction.amount < 0) {
        accumulator += transaction.amount;
      }

      return accumulator;
    }, 0);

    return expense;
  },
  total() {
    return this.incomes() + this.expenses();
  },
};

const Utils = {
  formatDate(date) {
    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  },
  formatAmount(value) {
    return Number(value.replace(/\,\./g, "")) * 100;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, ""); // Achar apenas números

    value = Number(value) / 100;

    value = Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return `${signal} ${value}`;
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  innerHTMLTransaction(transaction, index) {
    const CSSClassValue = transaction.amount > 0 ? "income" : "expense";

    const amountFormatted = Utils.formatCurrency(transaction.amount);
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="value ${CSSClassValue}">${amountFormatted}</td>
      <td>${transaction.date}</td>
      <td>
        <img src="./assets/minus.svg" alt="Remover transação" onclick="Transaction.remove(${index})"/>
      </td>
    `;

    return html;
  },

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");

    tr.innerHTML = this.innerHTMLTransaction(transaction, index);

    this.transactionsContainer.appendChild(tr);
  },

  updateBalance() {
    const incomeDisplay = document.getElementById("incomeDisplay");
    incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes());

    const expenseDisplay = document.getElementById("expenseDisplay");
    expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses());

    const totalDisplay = document.getElementById("totalDisplay");
    totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total());
  },
  clearTransactions() {
    this.transactionsContainer.innerHTML = "";
  },
};

const Form = {
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  date: document.querySelector("#date"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },
  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },

  validateFields() {
    const { description, amount, date } = this.getValues();

    if (!description.trim() || !amount.trim() || !date.trim()) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  formatValues() {
    let { description, amount, date } = this.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  submit(event) {
    event.preventDefault();

    try {
      this.validateFields();

      const transaction = this.formatValues();

      this.saveTransaction(transaction);

      this.clearFields();

      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.transactions.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    StorageTransactions.set(Transaction.transactions);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
