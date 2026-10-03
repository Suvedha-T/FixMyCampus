import React, { useState } from 'react';
import { createIssue } from '../../services/api';

/**
 * ReportIssue Page
 * Allows students to submit a new campus problem with title, category,
 * location, description, and an optional photo.
 */
function ReportIssue({ onNavigate }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Electrical',
    'Furniture',
    'Plumbing',
    'IT & Network',
    'Cleanliness',
    'Laboratory',
    'Other'
  ];

  // Handle local file selection and convert to Base64 preview
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g., max 3MB for beginner simplicity)
    if (file.size > 3 * 1024 * 1024) {
      setError('Please select an image smaller than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImage('');
    setImagePreview('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!title.trim() || !category || !location.trim() || !description.trim()) {
      setError('Please fill in all required fields (Title, Category, Location, and Description).');
      return;
    }

    try {
      setLoading(true);
      const res = await createIssue({
        title,
        category,
        location,
        description,
        image: image || null
      });

      setSuccess('Issue reported successfully! Redirecting to My Reports...');
      // Clear form
      setTitle('');
      setCategory('');
      setLocation('');
      setDescription('');
      setImage('');
      setImagePreview('');

      // Redirect after a brief moment
      setTimeout(() => {
        onNavigate('my-reports');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit the issue. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h2>Report a Campus Problem</h2>
        <p className="subtitle">
          Submit details about maintenance, equipment, or facility issues so administrators can address them.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="issueTitle">Issue Title *</label>
            <input
              id="issueTitle"
              type="text"
              placeholder="e.g. Broken projector in Room 302"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="issueCategory">Category *</label>
            <select
              id="issueCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Select a Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="issueLocation">Location on Campus *</label>
            <input
              id="issueLocation"
              type="text"
              placeholder="e.g. Science Block, 3rd Floor, Lab 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <span className="form-help">Be as specific as possible so staff can locate it quickly.</span>
          </div>

          <div className="form-group">
            <label htmlFor="issueDescription">Detailed Description *</label>
            <textarea
              id="issueDescription"
              rows="4"
              placeholder="Explain the problem, when you noticed it, and any safety hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="issueImage">Attach Photo (Optional)</label>
            <input
              id="issueImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="form-help">Upload a photo showing the damaged equipment or issue.</span>

            {imagePreview && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Selected Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Issue Preview"
                  className="preview-image"
                />
                <div style={{ marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting Report...' : 'Submit Report'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('student-dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;
