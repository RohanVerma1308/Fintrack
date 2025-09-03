let totalIncome = 0;
let totalExpense = 0;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function updateSummary() {
  totalIncome = 0;
  totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === "income") {
      totalIncome += parseFloat(t.amount);
    } else {
      totalExpense += parseFloat(t.amount);
    }
  });

  const netBalance = totalIncome - totalExpense;
  const netBalanceElement = document.getElementById('net-balance');
  const netBalanceBox = document.getElementById('net-balance-box');

  netBalanceElement.textContent = netBalance.toFixed(2);

  // Update class for color
  if (netBalance > 0) {
    netBalanceBox.classList.add('positive');
    netBalanceBox.classList.remove('negative');
  } 
  else if (netBalance === 0) {
    netBalanceBox.classList.remove('positive');
    netBalanceBox.classList.remove('negative');
  }
  else {
    netBalanceBox.classList.add('negative');
    netBalanceBox.classList.remove('positive');
  }

  document.getElementById('total-income').textContent = totalIncome.toFixed(2);
  document.getElementById('total-expense').textContent = totalExpense.toFixed(2);
}


function renderTransactions() {
  const table = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  transactions.forEach(t => {
    const row = table.insertRow();
    row.insertCell(0).textContent = t.description;
    row.insertCell(1).textContent = t.amount;
    row.insertCell(2).textContent = t.type.charAt(0).toUpperCase() + t.type.slice(1);
    row.insertCell(3).textContent = t.type === 'expense' ? t.category : '-';
    row.insertCell(4).textContent = t.date;
  });
}

function addTransaction() {
  const type = document.getElementById('transaction-type').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;
  const date = document.getElementById('month').value;
  const category = type === 'expense' ? document.getElementById('category').value : '-';

  if (!type || isNaN(amount) || amount <= 0 || description === "" || !date) {
    alert("Please enter valid information.");
    return;
  }

  const newTransaction = {
    date,
    type,
    amount: amount.toFixed(2),
    description,
    category
  };

  transactions.push(newTransaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  renderTransactions();
  updateSummary();

  document.getElementById('transaction-type').value = "";
  document.getElementById('amount').value = "";
  document.getElementById('description').value = "";
  document.getElementById('category').value = "food";
  document.getElementById('category-container').style.display = 'none';
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Tracker Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 14, 30);
  doc.text(`Total Expense: ₹${totalExpense.toFixed(2)}`, 14, 40);
  doc.text(`Net Balance: ₹${(totalIncome - totalExpense).toFixed(2)}`, 14, 50);

  const tableColumn = ["Date", "Description", "Amount", "Type", "Category"];
  const tableRows = transactions.map(t => [
    t.date,
    t.description,
    `₹${t.amount}`,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    t.type === 'expense' ? t.category : '-'
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    theme: 'grid',
  });

  doc.save("expense_tracker_report.pdf");
}

function resetTracker() {
  if (confirm("Are you sure you want to reset all data?")) {
    transactions = [];
    localStorage.removeItem('transactions');
    renderTransactions();
    updateSummary();
  }
}

window.addEventListener("scroll", function () {
  const html = document.documentElement;
  const body = document.body;

  if (html.scrollTop + window.innerHeight >= html.scrollHeight) {
    body.classList.add('scrolled');
  } else {
    body.classList.remove('scrolled');
  }
});

document.addEventListener("DOMContentLoaded", function () {
  renderTransactions();
  updateSummary();
  document.getElementById('category-container').style.display = 'none';

  document.getElementById('transaction-type').addEventListener('change', function () {
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.style.display = this.value === 'expense' ? 'block' : 'none';
  });
});
