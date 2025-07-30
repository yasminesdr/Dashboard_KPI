import React from "react";

const CollectionSelector = ({ collections, selectedCollections, setSelectedCollections, fetchDocuments }) => {
  const handleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCollections(selected);
  };

   return (
   <div className="mongo-viewer container mt-4">
  <div className="mb-4">
    <label htmlFor="collectionSelect" className="form-label fw-bold">
      Select Collections
    </label>
    <select
      id="collectionSelect"
      multiple
      className="form-select"
      value={selectedCollections}
      onChange={handleChange}
      size={Math.min(collections.length, 8)}
    >
      {collections.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
    <div className="form-text mt-1">
      Hold <kbd>Ctrl</kbd> (or <kbd>Cmd</kbd> on Mac) to select multiple.
    </div>
  </div>

  <button className="btn btn-primary px-4 py-2" onClick={fetchDocuments}>
    Load Data
  </button>
</div>

  );
};

export default CollectionSelector;
