import React, { useContext, useState, useEffect } from 'react';
import { CardsContext } from '../contexts/CardsContext';
import { api } from '../api/api';
import '../styles/Rewards.css';
import { FaPlus } from 'react-icons/fa';

const Rewards = () => {
  const { userInfo, fetchUserInfo } = useContext(CardsContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track used rewards by the current user
  const [usedRewards, setUsedRewards] = useState([]);

  // Admin add/edit form state
  const [editItem, setEditItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', points: '' });

  const isAdmin = userInfo?.role === 'admin';

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/rewards');
      setItems(data);
    } catch (e) {
      alert('Failed to fetch rewards!');
    }
    setLoading(false);
  };

  const fetchUsedRewards = async () => {
    try {
      const { data } = await api.get('/api/rewards/used');
      setUsedRewards(data.map(r => r.id));
    } catch (e) {
      setUsedRewards([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchUsedRewards();
  }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.points) return alert('Title and points required!');
    try {
      if (editItem) {
        await api.put(`/api/rewards/${editItem.id}`, form);
      } else {
        await api.post('/api/rewards', form);
      }
      setEditItem(null);
      setAdding(false);
      setForm({ title: '', description: '', points: '' });
      fetchItems();
    } catch (e) {
      alert('Failed to save reward.');
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description, points: item.points });
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reward?')) return;
    try {
      await api.delete(`/api/rewards/${id}`);
      fetchItems();
    } catch (e) {
      alert('Failed to delete.');
    }
  };

  const handleSelect = async (item) => {
    try {
      await api.post(`/api/rewards/${item.id}/select`);
      await fetchUsedRewards();
      await fetchUserInfo(); // This will update points in navbar/context!
    } catch (e) {
      alert(e?.response?.data?.message || 'Could not claim reward.');
    }
  };

  if (!userInfo) return null;

  return (
    <div className="rewards-container">
      <h1 className="rewards-title">Rewards</h1>

      {isAdmin && !adding && !editItem && (
        <div
          className="reward-plus-box"
          title="Add new reward"
          onClick={() => setAdding(true)}
        >
          <FaPlus size={32} />
        </div>
      )}

      {(isAdmin && (adding || editItem)) && (
        <form onSubmit={handleAddOrEdit} className="reward-form">
          <h3>{editItem ? 'Edit Reward' : 'Add New Reward'}</h3>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleFormChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleFormChange}
          />
          <input
            type="number"
            name="points"
            placeholder="Points"
            value={form.points}
            onChange={handleFormChange}
            min={1}
          />
          <button type="submit">{editItem ? 'Save' : 'Add'}</button>
          <button
            type="button"
            onClick={() => {
              setEditItem(null);
              setAdding(false);
              setForm({ title: '', description: '', points: '' });
            }}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? <div>Loading...</div> : (
        <>
          {/* Rewards list */}
          <div>
            {items.map(item => (
              <div className="reward-item" key={item.id}>
                <div>
                  <div className="reward-item-title">{item.title}</div>
                  <div className="reward-item-description">{item.description}</div>
                  <div className="reward-item-points">Worth: {item.points} points</div>
                </div>
                <div className="reward-actions">
                  {!isAdmin && (
                    <button
                      className="reward-select-btn"
                      disabled={
                        userInfo.points < item.points ||
                        usedRewards.includes(item.id)
                      }
                      onClick={() => handleSelect(item)}
                    >
                      {usedRewards.includes(item.id) ? "Used" : "Select"}
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Used Rewards section */}
          {!isAdmin && usedRewards.length > 0 && (
            <div className="used-rewards-section">
              <h2 style={{ color: "#888", marginTop: 40, fontSize: 22 }}>Used Rewards</h2>
              <div>
                {items.filter(i => usedRewards.includes(i.id)).map(item => (
                  <div key={item.id} className="reward-item">
                    <div>
                      <div className="reward-item-title">{item.title}</div>
                      <div className="reward-item-description">{item.description}</div>
                      <div className="reward-item-points">Worth: {item.points} points</div>
                    </div>
                    <div className="reward-used-label" style={{ color: '#43cea2', fontWeight: 700, fontSize: 17 }}>Claimed</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Rewards;
