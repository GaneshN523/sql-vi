import React, { useState } from 'react';
import IndexManager from './IndexManager';
import ViewManager from './ViewManager';
import styles from './indexviewmanager.module.css';

function IndexViewManager() {
  const [activeTab, setActiveTab] = useState('indexes');

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1>Database Index &amp; View Manager</h1>
        <hr />
        {activeTab === 'indexes' ? <IndexManager /> : <ViewManager />}
      </div>
      <div className={styles.sidebar}>
        <button
          className={activeTab === 'indexes' ? styles.activeButton : ''}
          onClick={() => setActiveTab('indexes')}
        >
          Indexes
        </button>
        <button
          className={activeTab === 'views' ? styles.activeButton : ''}
          onClick={() => setActiveTab('views')}
        >
          Views
        </button>
      </div>
    </div>
  );
}

export default IndexViewManager;
