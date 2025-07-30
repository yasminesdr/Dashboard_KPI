// utils/exportCSV.js
export function generateCSVText(data) {
  if (!data || data.length === 0) return "";

  const header = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(",")
  );

  return [header, ...rows].join("\n");
}

export function downloadCSV(data, filename = "chart-data.csv") {
  const csvContent = generateCSVText(data);
  if (!csvContent) {
    alert("No data to export.");
    return;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
