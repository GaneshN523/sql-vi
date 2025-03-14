import React, { useState, useEffect } from 'react';
import { fetchSequences, createSequence, dropSequence } from '../../api';
import styles from './sequencecreatedrop.module.css';

const SequenceCreateDrop = () => {
  const [sequences, setSequences] = useState([]);
  const [response, setResponse] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    start: 1,
    increment: 1,
    min_value: '',
    max_value: '',
    cache: '',
    cycle: false,
  });
  const [dropSequenceName, setDropSequenceName] = useState('');

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

  const handleCreateSequence = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: createForm.name,
        start: parseInt(createForm.start) || 1,
        increment: parseInt(createForm.increment) || 1,
        min_value: createForm.min_value ? parseInt(createForm.min_value) : null,
        max_value: createForm.max_value ? parseInt(createForm.max_value) : null,
        cache: createForm.cache ? parseInt(createForm.cache) : null,
        cycle: createForm.cycle,
      };
      const data = await createSequence(payload);
      setResponse(data);
      loadSequences();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDropSequence = async () => {
    if (!dropSequenceName) return;
    try {
      const data = await dropSequence(dropSequenceName);
      setResponse(data);
      loadSequences();
      setDropSequenceName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Create and Drop Sequences</h2>

        {/* Create Sequence Form */}
        <section className={styles.section}>
          <h3>Create New Sequence</h3>
          <form onSubmit={handleCreateSequence} className={styles.form}>
            <input
              type="text"
              placeholder="Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              required
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Start"
              value={createForm.start}
              onChange={(e) =>
                setCreateForm({ ...createForm, start: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Increment"
              value={createForm.increment}
              onChange={(e) =>
                setCreateForm({ ...createForm, increment: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Min Value"
              value={createForm.min_value}
              onChange={(e) =>
                setCreateForm({ ...createForm, min_value: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Max Value"
              value={createForm.max_value}
              onChange={(e) =>
                setCreateForm({ ...createForm, max_value: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Cache"
              value={createForm.cache}
              onChange={(e) =>
                setCreateForm({ ...createForm, cache: e.target.value })
              }
              className={styles.input}
            />
            <div className={styles.checkboxWrapper}>
              <label>
                Cycle:
                <input
                  type="checkbox"
                  checked={createForm.cycle}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, cycle: e.target.checked })
                  }
                  style={{ marginLeft: '5px' }}
                />
              </label>
            </div>
            <button type="submit" className={styles.button}>
              Create Sequence
            </button>
          </form>
        </section>

        {/* Drop Sequence Section */}
        <section className={styles.section}>
          <h3>Drop Sequence</h3>
          <div className={styles.form}>
            <select
              value={dropSequenceName}
              onChange={(e) => setDropSequenceName(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Sequence</option>
              {sequences.map((seq) => (
                <option key={seq} value={seq}>
                  {seq}
                </option>
              ))}
            </select>
            <button onClick={handleDropSequence} className={styles.button}>
              Drop Sequence
            </button>
          </div>
        </section>

        {/* Display the JSON response */}
        <section className={styles.responseSection}>
          <h4>Response</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
};

export default SequenceCreateDrop;
