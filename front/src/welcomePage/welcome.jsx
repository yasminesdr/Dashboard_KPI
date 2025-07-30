import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./welcome.css";
import BiLogo from "../assets/Power-BI-Logo-2013.png";


const Welcome = () => {
  const [sharedCharts, setSharedCharts] = useState([]);

  useEffect(() => {
    const fetchSharedCharts = async () => {
      try {
        const response = await fetch("http://localhost:8000/charts/public");
        const data = await response.json();
        setSharedCharts(data);
      } catch (err) {
        console.error("Error loading shared charts", err);
      }
    };

    fetchSharedCharts();
  }, []);
  
  return (
    <>
    <div className="powerbi-container">
      <div className="powerbi-left">
        <h1>Prise en main de <br /> Power BI</h1>
        <p>
          Trouvez des insights dans vos données et partagez <br />
          des rapports analytiques enrichis.
        </p>
        <div className="cta-box">
          <img src={BiLogo} alt="Power BI Logo" className="logo" />
          <div className="cta-text">
            <p>
              Pour commencer à visualiser vos données, choisissez un type de base de données (MongoDB, PostgreSQL ou MySQL) et établissez une connexion en fournissant les informations nécessaires.
            </p> <Link to="/dashboard" className="link-clean">
            <button className="cta-button">
             Essayez gratuitement
            </button>
            </Link>
          </div>
        </div>
      </div>

   
    
   

    <div className="charts-grid">
      {sharedCharts.map((chart) => (
        <div key={chart.id} className="chart-card">
          <img
            src={`data:${chart.contentType};base64,${chart.base64}`}
            alt={chart.title}
            className="chart-thumbnail"
          />
          <h4>{chart.title}</h4>
          <p>{chart.description}</p>
        </div>
      ))}
  </div>
</div>
</>
  );
};

export default Welcome;
