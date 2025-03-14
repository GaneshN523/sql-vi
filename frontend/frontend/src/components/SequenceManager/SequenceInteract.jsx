import React, { useState, useEffect } from 'react';
import {
  fetchSequences,
  getNextValue,
  getCurrentValue,
  setSequenceValue,
  restartSequence,
  viewSequenceDetails,
  associateSequence,
} from '../../api';
import styles from './sequenceinteract.module.css';

const SequenceInteract = () => {
  const [sequences, setSequences] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState('');
  const [response, setResponse] = useState(null);
  const [setValueForm, setSetValueForm] = useState({ value: '' });
  const [restartForm, setRestartForm] = useState({ start_with: '' });
  const [associateForm, setAssociateForm] = useState({ table: '', column: '' });

  const loadSequences = async () => {
    try {
      const data = await fetchSequences();
      setSequences(data.sequences);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  const handleGetNext = async () => {
    if (!selectedSequence) return;
    try {
      const data = await getNextValue(selectedSequence);
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetCurrent = async () => {
    if (!selectedSequence) return;
    try {
      const data = await getCurrentValue(selectedSequence);
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetValue = async (e) => {
    e.preventDefault();
    if (!selectedSequence) return;
    try {
      const value = parseInt(setValueForm.value);
      const data = await setSequenceValue(selectedSequence, value);
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestart = async (e) => {
    e.preventDefault();
    if (!selectedSequence) return;
    try {
      const start_with = parseInt(restartForm.start_with);
      const data = await restartSequence(selectedSequence, start_with);
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async () => {
    if (!selectedSequence) return;
    try {
      const data = await viewSequenceDetails(selectedSequence);
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssociate = async (e) => {
    e.preventDefault();
    if (!selectedSequence) return;
    try {
      const data = await associateSequence(
        selectedSequence,
        associateForm.table,
        associateForm.column
      );
      setResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Sequence Interaction</h2>
      <div className={styles.panels}>
        {/* Left Panel: List of Available Sequences */}
        <div className={styles.panelLeft}>
          <h3 className={styles.title}>Available Sequences</h3>
          <button className={styles.button} onClick={loadSequences}>
            Refresh List
          </button>
          <ul className={styles.list}>
            {sequences.map((seq) => (
              <li key={seq}>
                <button
                  onClick={() => setSelectedSequence(seq)}
                  className={`${styles.listButton} ${
                    selectedSequence === seq ? styles.selected : ''
                  }`}
                >
                  {seq}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Panel: Operations on Selected Sequence */}
        <div className={styles.panelRight}>
          <h3 className={styles.title}>
            Operations {selectedSequence && <span>for: {selectedSequence}</span>}
          </h3>
          <div className={styles.operationSection}>
            <button className={styles.button} onClick={handleGetNext}>
              Get Next Value
            </button>
          </div>
          <div className={styles.operationSection}>
            <button className={styles.button} onClick={handleGetCurrent}>
              Get Current Value
            </button>
          </div>
          <div className={styles.operationSection}>
            <form onSubmit={handleSetValue} className={styles.form}>
              <input
                type="number"
                placeholder="Set Value"
                value={setValueForm.value}
                onChange={(e) => setSetValueForm({ value: e.target.value })}
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Set Value
              </button>
            </form>
          </div>
          <div className={styles.operationSection}>
            <form onSubmit={handleRestart} className={styles.form}>
              <input
                type="number"
                placeholder="Restart with value"
                value={restartForm.start_with}
                onChange={(e) =>
                  setRestartForm({ start_with: e.target.value })
                }
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Restart Sequence
              </button>
            </form>
          </div>
          <div className={styles.operationSection}>
            <button className={styles.button} onClick={handleViewDetails}>
              View Sequence Details
            </button>
          </div>
          <div className={styles.operationSection}>
            <form onSubmit={handleAssociate} className={styles.form}>
              <input
                type="text"
                placeholder="Table"
                value={associateForm.table}
                onChange={(e) =>
                  setAssociateForm({ ...associateForm, table: e.target.value })
                }
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Column"
                value={associateForm.column}
                onChange={(e) =>
                  setAssociateForm({
                    ...associateForm,
                    column: e.target.value,
                  })
                }
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Associate Sequence
              </button>
            </form>
          </div>
          <div className={styles.responseSection}>
            <h4>Response</h4>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceInteract;
