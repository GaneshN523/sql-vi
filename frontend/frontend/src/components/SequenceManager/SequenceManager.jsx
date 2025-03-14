import React, { useState } from 'react';
import SequenceInteract from './SequenceInteract';
import SequenceCreateDrop from './SequenceCreateDrop';
import styles from './sequencemanager.module.css';

const SequenceManager = () => {
  const [activeTab, setActiveTab] = useState('interact');

  return (
    <>
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Sequence Manager</h1>
        {/* Main content area */}
      </div>
      <div className={styles.sidebar}>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => setActiveTab('interact')}
            className={activeTab === 'interact' ? styles.active : ''}
          >
            Interact with Sequences
          </button>
          <button
            onClick={() => setActiveTab('createDrop')}
            className={activeTab === 'createDrop' ? styles.active : ''}
          >
            Create/Drop Sequences
          </button>
        </div>
        
      </div>
      
    </div>
    <div>
    {activeTab === 'interact' ? <SequenceInteract /> : <SequenceCreateDrop />}
  </div>
  </>
  );
};

export default SequenceManager;
