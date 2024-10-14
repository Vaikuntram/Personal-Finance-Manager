document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId'); // Get the userId

    // Fetch and display budgets
    fetch(`http://localhost:5001/api/budgets?userId=${userId}`) // Include userId in the request
        .then(response => response.json())
        .then(budgets => {
            const budgetData = {
                labels: budgets.map(b => b.category),
                datasets: [{
                    label: 'Remaining Budget',
                    data: budgets.map(b => b.limit),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light Blue
                    borderColor: 'rgba(54, 162, 235, 1)', // Dark Blue
                    borderWidth: 1
                }]
            };

            const budgetChart = new Chart(
                document.getElementById('budgetChart'),
                { type: 'bar', data: budgetData }
            );
        })
        .catch(error => console.error('Error fetching budgets:', error));

    // Fetch and display transactions
    fetch(`http://localhost:5001/api/transactions?userId=${userId}`) // Include userId in the request
        .then(response => response.json())
        .then(transactions => {
            if (transactions.length > 0) {
                // Aggregate transaction amounts by category
                const aggregatedData = transactions.reduce((acc, transaction) => {
                    const category = transaction.category;
                    const amount = transaction.amount;

                    // Initialize the category if it doesn't exist
                    if (!acc[category]) {
                        acc[category] = 0;
                    }

                    // Add the amount to the corresponding category
                    acc[category] += amount;

                    return acc;
                }, {});

                // Prepare data for Chart.js
                const transactionLabels = Object.keys(aggregatedData);
                const transactionAmounts = Object.values(aggregatedData);

                // Define a color for each category
                const colors = [
                    'rgba(255, 99, 132, 0.6)', // Red
                    'rgba(54, 162, 235, 0.6)', // Blue
                    'rgba(255, 206, 86, 0.6)', // Yellow
                    'rgba(75, 192, 192, 0.6)', // Cyan
                    'rgba(153, 102, 255, 0.6)', // Purple
                    'rgba(255, 159, 64, 0.6)', // Orange
                    'rgba(0, 255, 0, 0.6)', // Green
                    'rgba(255, 0, 255, 0.6)', // Magenta
                ];

                // Create an array of colors for the pie chart based on the number of categories
                const transactionColors = transactionLabels.map((_, index) => colors[index % colors.length]);

                const transactionData = {
                    labels: transactionLabels,
                    datasets: [{
                        label: 'Transaction Amount',
                        data: transactionAmounts,
                        backgroundColor: transactionColors, // Use the unique colors for each category
                        borderColor: transactionColors.map(color => color.replace('0.6', '1')), // Darker border
                        borderWidth: 1
                    }]
                };

                // Render transaction chart
                const transactionChart = new Chart(
                    document.getElementById('transactionChart'),
                    { type: 'pie', data: transactionData }
                );
            } else {
                console.error('No transaction data available for user');
            }
        })
        .catch(error => console.error('Error fetching transactions:', error));
});
