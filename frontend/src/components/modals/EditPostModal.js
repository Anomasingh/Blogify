import { useState, useRef, useEffect } from 'react';
import API from '../../utils/axios';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { isAuthenticated, debugAuthStatus } from '../../utils/auth';

export default function EditPostModal({ open, onClose, onPostUpdated, postId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const titleInputRef = useRef(null);

  // Fetch post data when modal opens
  useEffect(() => {
    if (open && postId) {
      setFetchingPost(true);
      setError('');
      API.get(`/posts/${postId}`)
        .then(({ data }) => {
          setTitle(data.title || '');
          setContent(data.content || '');
          setTags(data.tags?.join(', ') || '');
          setImageUrl(data.imageUrl || '');
          setTimeout(() => titleInputRef.current?.focus(), 100);
        })
        .catch(() => setError('Failed to load post data. Please try again.'))
        .finally(() => setFetchingPost(false));
    }
    if (open) debugAuthStatus();
  }, [open, postId]);


  // Clear form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setTags('');
      setImageUrl('');
      setError('');
      setFocusedField(null);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleBackdropClick = (e) => e.target === e.currentTarget && onClose();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      setError('You must be logged in to edit a post.');
      return;
    }
    if (content.trim().length < 20) {
      setError('Please add at least 20 characters of content.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await API.put(`/posts/${postId}`, {
        title,
        content,
        tags: [...new Set(tags.split(',').map(t => t.trim()).filter(Boolean))],
        imageUrl
      });
      onPostUpdated();
      onClose();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Authentication failed. Redirecting...');
        setTimeout(() => (window.location.href = '/login'), 2000);
      } else if (status === 404) {
        setError('Post not found.');
      } else {
        setError(err.response?.data?.msg || 'Update failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Dynamic styling variables for consistency
  const theme = {
    colors: {
      primary: '#3B82F6',
      primaryLight: '#EFF6FF',
      secondary: '#6B7280',
      border: '#D1D5DB',
      borderLight: '#E5E7EB',
      background: '#F9FAFB',
      white: '#FFFFFF',
      error: '#DC2626',
      success: '#10B981',
      text: '#1F2937',
      textLight: '#6B7280'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px'
    },
    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px'
    },
    shadows: {
      modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      light: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  };

  const iconStyle = {
    width: '16px',
    height: '16px',
    minWidth: '16px',
    minHeight: '16px',
    flexShrink: 0
  };

  // Dynamic input style based on focus state
  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: `1px solid ${focusedField === fieldName ? theme.colors.primary : theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focusedField === fieldName ? `0 0 0 3px ${theme.colors.primary}20` : 'none'
  });

  const getTextareaStyle = (fieldName) => ({
    ...getInputStyle(fieldName),
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  });

  return (
    <div
      className="blog-modal-overlay edit-post-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-modal-title"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg
      }}
    >
      <div
        className="blog-modal-container edit-post-modal-container"
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: 0,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: theme.shadows.modal
        }}
      >


        <header className="blog-modal-header edit-post-modal-header" style={{
          padding: `${theme.spacing.xl} ${theme.spacing.xl} 0 ${theme.spacing.xl}`,
          position: 'relative',
          borderBottom: `1px solid ${theme.colors.borderLight}`
        }}>
          <div className="blog-modal-title-section edit-post-modal-title-section" style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.lg
          }}>
            <div className="blog-modal-icon-wrapper edit-post-modal-icon" style={{
              width: '32px',
              height: '32px',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.primary
            }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <Typography
              id="edit-post-modal-title"
              variant="title"
              weight="bold"
              className="blog-modal-title edit-post-modal-title dashboard-heading-text"
              style={{ color: theme.colors.text }}
            >
              Edit Story
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="blog-modal-close-button edit-post-modal-close"
            aria-label="Close edit post modal"
            style={{
              position: 'absolute',
              top: theme.spacing.lg,
              right: theme.spacing.lg,
              background: 'none',
              border: 'none',
              padding: theme.spacing.sm,
              cursor: 'pointer',
              borderRadius: theme.borderRadius.sm,
              color: theme.colors.secondary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease, background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.background;
              e.target.style.color = theme.colors.text;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = theme.colors.secondary;
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="blog-modal-body edit-post-modal-body" style={{
          padding: theme.spacing.xl,
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {fetchingPost && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              gap: theme.spacing.md
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTop: '2px solid ' + theme.colors.primary,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <Typography variant="body1" style={{ color: theme.colors.secondary }}>
                Loading post data...
              </Typography>
            </div>
          )}

          {error && (
            <div className="blog-form-error-message edit-post-error-display" role="alert" aria-live="polite">
              <div className="blog-form-error-content" style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                color: theme.colors.error,
                marginBottom: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: `${theme.colors.error}10`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.error}30`
              }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span>
              </div>
            </div>
          )}

          {!fetchingPost && (
            <form onSubmit={handleSubmit} className="blog-post-edit-form edit-post-form" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0'
            }}>

              {/* Post Title */}
              <div style={{ marginBottom: '20px' }}>
                <Typography
                  variant="body1"
                  style={{
                    marginBottom: theme.spacing.sm,
                    display: 'block',
                    fontWeight: '500',
                    color: theme.colors.text
                  }}
                >
                  Post Title *
                </Typography>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: theme.spacing.md,
                    color: focusedField === 'title' ? theme.colors.primary : theme.colors.secondary,
                    transition: 'color 0.2s ease'
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="Enter an engaging title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={getInputStyle('title')}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: '20px' }}>
                <Typography
                  variant="body1"
                  style={{
                    marginBottom: theme.spacing.sm,
                    display: 'block',
                    fontWeight: '500',
                    color: theme.colors.text
                  }}
                >
                  Featured Image URL (Optional)
                </Typography>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: theme.spacing.md,
                    color: focusedField === 'imageUrl' ? theme.colors.primary : theme.colors.secondary,
                    transition: 'color 0.2s ease'
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onFocus={() => setFocusedField('imageUrl')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle('imageUrl')}
                  />
                </div>
              </div>

              {/* Content */}
              <div style={{ marginBottom: '20px' }}>
                <Typography
                  variant="body1"
                  style={{
                    marginBottom: theme.spacing.sm,
                    display: 'block',
                    fontWeight: '500',
                    color: theme.colors.text
                  }}
                >
                  Content *
                </Typography>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    position: 'absolute',
                    top: theme.spacing.md,
                    left: theme.spacing.md,
                    color: focusedField === 'content' ? theme.colors.primary : theme.colors.secondary,
                    transition: 'color 0.2s ease'
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <textarea
                    placeholder="Write your story here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setFocusedField('content')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={8}
                    style={getTextareaStyle('content')}
                  />
                </div>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <Typography
                  variant="body1"
                  style={{
                    marginBottom: theme.spacing.sm,
                    display: 'block',
                    fontWeight: '500',
                    color: theme.colors.text
                  }}
                >
                  Tags (Optional)
                </Typography>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: theme.spacing.md,
                    color: focusedField === 'tags' ? theme.colors.primary : theme.colors.secondary,
                    transition: 'color 0.2s ease'
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="technology, design, programming"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    onFocus={() => setFocusedField('tags')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle('tags')}
                  />
                </div>
                <Typography
                  variant="caption"
                  style={{
                    marginTop: theme.spacing.xs,
                    fontSize: '12px',
                    color: theme.colors.textLight,
                    display: 'block'
                  }}
                >
                  Separate tags with commas
                </Typography>
              </div>
            </form>
          )}
        </main>

        <footer style={{
          padding: `${theme.spacing.md} ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xl}`,
          borderTop: `1px solid ${theme.colors.borderLight}`,
          backgroundColor: theme.colors.background
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.md
          }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading || fetchingPost}
              style={{
                minWidth: '100px',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || fetchingPost}
              onClick={handleSubmit}
              className="blog-button-primary-action edit-post-submit-btn"
              style={{
                minWidth: '140px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                fontSize: '14px',
                borderRadius: theme.borderRadius.md,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexWrap: 'nowrap'
              }}
            >
              {loading ? (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    flexShrink: 0
                  }}></div>
                  Updating...
                </span>
              ) : (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  whiteSpace: 'nowrap'
                }}>
                  Update Post
                  <svg
                    className="edit-post-submit-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      ...iconStyle,
                      flexShrink: 0
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
