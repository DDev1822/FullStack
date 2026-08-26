document.getElementById('testForm2').addEventListener('submit', event => {
  event.preventDefault();
  const stock = event.target[0].value;
  const checkbox = event.target[1].checked;

  fetch(`/api/stock-prices?stock=${encodeURIComponent(stock)}&like=${checkbox}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('jsonResult').innerText = JSON.stringify(data);
    });
});

document.getElementById('testForm').addEventListener('submit', event => {
  event.preventDefault();
  const stock1 = event.target[0].value;
  const stock2 = event.target[1].value;
  const checkbox = event.target[2].checked;

  fetch(
    `/api/stock-prices?stock=${encodeURIComponent(stock1)}&stock=${encodeURIComponent(stock2)}&like=${checkbox}`
  )
    .then(response => response.json())
    .then(data => {
      document.getElementById('jsonResult').innerText = JSON.stringify(data);
    });
});
