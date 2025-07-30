import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import LineChartBuilder from "../../utils/LineChartBuilder";
import BarChartBuilder from "../../utils/BarChartBuilder";
import PieChartBuilder from "../../utils/PieChartBuilder";
import DoughnutChartBuilder from "../../utils/DoughnutChartBuilder";
import BubbleChartBuilder from "../../utils/BubbleChartBuilder";
import ScatterPlotBuilder from "../../utils/ScatterPlotBuilder";
import { generateCSVText } from "../../utils/exportCSV";
import ChartShareModal from "../../ChartShareModal";

const ChartRenderer = ({
  data,
  fields,
  xAxis,
  yAxis,
  groupBy,
  sizeField,
  selectedCharts,
  user,
}) => {
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const chartRefs = useRef({});
const [shareModalOpen, setShareModalOpen] = useState(false);
const [shareTitle, setShareTitle] = useState("");
const [shareDescription, setShareDescription] = useState("");
const [shareChartType, setShareChartType] = useState(null);

 const openShareModal = (chartType) => {
    console.log("Opening modal for", chartType);

    setShareChartType(chartType);
    setShareTitle("");
    setShareDescription("");
    setShareModalOpen(true);
  };

  const handleExportPDF = async () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const spacing = 10;
  let y = margin;

  // Title
  if (pdfTitle) {
    doc.setFontSize(18);
    doc.text(pdfTitle, margin, y);
    y += 10;
  }

  // Description
  if (pdfDescription) {
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(pdfDescription, 180);
    doc.text(lines, margin, y);
    y += lines.length * 7 + spacing;
  }

  // Charts
  for (const chartType of selectedCharts) {
    const chartRef = chartRefs.current[chartType];
    if (!chartRef?.chartInstance?.canvas) continue;

    const canvas = chartRef.chartInstance.canvas;
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (y + imgHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(14);
    doc.text(`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`, margin, y);
    y += 10;

    doc.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
    y += imgHeight + spacing;
  }

  // --- Append CSV data ---
  const csvText = generateCSVText(data);
  if (csvText) {
    doc.addPage();
    y = margin;

    doc.setFontSize(16);
    doc.text("CSV Data Used in Charts", margin, y);
    y += 10;

    doc.setFontSize(10);
    const csvLines = doc.splitTextToSize(csvText, 180);

    for (let i = 0; i < csvLines.length; i++) {
      if (y + 7 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(csvLines[i], margin, y);
      y += 7;
    }
  }

  doc.save("charts_report.pdf");
};


  const handleSubmitShare = async () => {
  const chartRef = chartRefs.current[shareChartType];
  console.log("firsttttttt")
  if (!chartRef?.toBase64Image) return;

  try {
    const imageDataUrl = chartRef.toBase64Image();
    const blob = await (await fetch(imageDataUrl)).blob();

    const formData = new FormData();
    formData.append("chartImage", blob, `${shareChartType}.png`);
    formData.append("title", shareTitle);
    formData.append("description", shareDescription);

    const response = await fetch("http://localhost:8000/charts/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (response.ok) {
      alert("Chart shared successfully!");
      setShareModalOpen(false);
    } else {
      alert("Failed to share chart.");
    }
  } catch (error) {
    console.error("Share error:", error);
    alert("An error occurred while sharing the chart.");
  }
};


  return (
    <div style={{ marginTop: "30px", display: "grid", gap: "40px" }}>
          {/* PDF export form */}
          <div style={{ marginBottom: "30px" }}>
            <input
              type="text"
              placeholder="Enter PDF Title"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              style={{ padding: "8px", marginRight: "10px", width: "300px" }}
            />
            <input
              type="text"
              placeholder="Enter PDF Description"
              value={pdfDescription}
              onChange={(e) => setPdfDescription(e.target.value)}
              style={{ padding: "8px", marginRight: "10px", width: "300px" }}
            />
            <button onClick={handleExportPDF} style={{ padding: "8px 16px" }}>
              Export Charts to PDF
            </button>
          </div>

      {selectedCharts.has("line") && (
        <div>
          <LineChartBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["line"] = ref;
            }}
            data={data}
            fields={fields}
            xAxis={xAxis}
            yAxis={yAxis}
            groupBy={groupBy}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("line")}>Share line Chart</button>
          )}
        </div>
      )}

      {selectedCharts.has("bar") && (
        <div>
          <BarChartBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["bar"] = ref;
            }}
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
            groupBy={groupBy}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("bar")}>Share Bar Chart</button>
          )}
        </div>
      )}

      {selectedCharts.has("bubble") && (
        <div>
          <BubbleChartBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["bubble"] = ref;
            }}
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
            sizeField={sizeField}
            groupBy={groupBy}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("bubble")}>Share Bubble Chart</button>
          )}
        </div>
      )}

      {selectedCharts.has("pie") && (
        <div>
          <PieChartBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["pie"] = ref;
            }}
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("pie")}>Share Pie Chart</button>
          )}
        </div>
      )}

      {selectedCharts.has("doughnut") && (
        <div>
          <DoughnutChartBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["doughnut"] = ref;
            }}
            data={data}
            fields={fields}
            xAxis={xAxis}
            yAxis={yAxis}
            groupBy={groupBy}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("doughnut")}>Share Doughnut Chart</button>
          )}
        </div>
      )}

      {selectedCharts.has("scatter") && (
        <div>
          <ScatterPlotBuilder
            ref={(ref) => {
              if (ref) chartRefs.current["scatter"] = ref;
            }}
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
            groupBy={groupBy}
          />
          {user?.isAdmin && (
            <button onClick={() => openShareModal("scatter")}>Share Scatter Chart</button>
          )}
        </div>
      )}
      <ChartShareModal
  isOpen={shareModalOpen}
  onClose={() => setShareModalOpen(false)}
  title={shareTitle}
  setTitle={setShareTitle}
  description={shareDescription}
  setDescription={setShareDescription}
  onSubmit={handleSubmitShare}
/>

    </div>
  );
};

export default ChartRenderer;
