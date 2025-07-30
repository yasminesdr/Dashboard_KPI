import React from "react";
import "./ChartShareModal.css";
const ChartShareModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  setTitle,
  description,
  setDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Share Chart</h2>
        <input
          type="text"
          placeholder="Enter chart title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Enter chart description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={onSubmit} disabled={!title.trim()}>
            Share
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ChartShareModal;
