import React from "react";

// Dito tayo mag-fofocus ng development next!
export const Dashboard = () => (
  <div>
    <h2 className="fw-bold mb-4" style={{ color: "var(--primary-color)" }}>
      Admin Dashboard
    </h2>
    <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
      <h4 className="text-muted">📊 Analytics and Charts (Coming Soon)</h4>
      <p>
        Ito ang magiging landing page. Gagawa tayo ng stats cards at charts
        dito.
      </p>
    </div>
  </div>
);

// Placeholders para sa iba pang links sa sidebar
export const FormsAdmin = () => (
  <div className="p-5 text-center">
    <h4 className="text-muted">Forms Builder & Oversight (Coming Soon)</h4>
  </div>
);
export const FilesAdmin = () => (
  <div className="p-5 text-center">
    <h4 className="text-muted">Files Management (Coming Soon)</h4>
  </div>
);
export const RecycleBin = () => (
  <div className="p-5 text-center">
    <h4 className="text-muted">Recycle Bin (Coming Soon)</h4>
  </div>
);

export const AdminNotifications = () => (
  <div className="p-5 text-center">
    <h4 className="text-muted">🔔 All Notifications (Coming Soon)</h4>
  </div>
);
