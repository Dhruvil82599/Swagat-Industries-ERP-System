import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiKey, FiPrinter, FiPlus, FiX, FiDownload } from 'react-icons/fi';

/**
 * Single Action Button Component
 * @param {string} variant - 'primary' | 'edit' | 'warning' | 'key' | 'danger' | 'delete' | 'info' | 'success'
 * @param {React.ReactNode} icon - Custom icon element
 * @param {string} iconName - Preset icon name: 'view' | 'edit' | 'delete' | 'key' | 'reset-password' | 'print' | 'add' | 'remove' | 'download'
 * @param {string} title - Tooltip/Title text
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Extra CSS classes
 */
export const ActionButton = ({
  variant = 'primary',
  icon,
  iconName,
  title,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // Resolve preset icon if icon is not explicitly passed
  const getIcon = () => {
    if (icon) return icon;
    switch (iconName) {
      case 'view':
        return <FiEye />;
      case 'edit':
        return <FiEdit />;
      case 'delete':
      case 'danger':
        return <FiTrash2 />;
      case 'key':
      case 'reset-password':
        return <FiKey />;
      case 'print':
        return <FiPrinter />;
      case 'add':
        return <FiPlus />;
      case 'remove':
      case 'close':
        return <FiX />;
      case 'download':
        return <FiDownload />;
      default:
        return null;
    }
  };

  // Map variant to CSS class
  const getVariantClass = () => {
    switch (variant) {
      case 'edit':
      case 'primary':
        return 'primary';
      case 'key':
      case 'warning':
        return 'warning';
      case 'delete':
      case 'danger':
        return 'danger';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <button
      type={type}
      className={`btn-icon-action ${getVariantClass()} ${className}`.trim()}
      title={title}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {getIcon()}
    </button>
  );
};

/**
 * Flex Container for Table Cell Action Buttons
 */
export const ActionButtonsGroup = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`table-actions-container ${className}`.trim()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}
    >
      {children}
    </div>
  );
};

/**
 * Standard Row Actions Toolbar for Tables
 * Provides pre-configured View, Edit, Print, Key (Reset Password), and Delete buttons.
 */
export const ActionButtons = ({
  onView,
  viewTitle = 'View Details',
  onEdit,
  editTitle = 'Edit',
  onPrint,
  printTitle = 'Print',
  onKey,
  keyTitle = 'Reset Password',
  onDelete,
  deleteTitle = 'Delete',
  disabled = false,
  className = '',
  children,
}) => {
  return (
    <ActionButtonsGroup className={className}>
      {onView && (
        <ActionButton
          variant="primary"
          iconName="view"
          title={viewTitle}
          onClick={onView}
          disabled={disabled}
        />
      )}
      {onPrint && (
        <ActionButton
          variant="info"
          iconName="print"
          title={printTitle}
          onClick={onPrint}
          disabled={disabled}
        />
      )}
      {onEdit && (
        <ActionButton
          variant="edit"
          iconName="edit"
          title={editTitle}
          onClick={onEdit}
          disabled={disabled}
        />
      )}
      {onKey && (
        <ActionButton
          variant="key"
          iconName="key"
          title={keyTitle}
          onClick={onKey}
          disabled={disabled}
        />
      )}
      {onDelete && (
        <ActionButton
          variant="danger"
          iconName="delete"
          title={deleteTitle}
          onClick={onDelete}
          disabled={disabled}
        />
      )}
      {children}
    </ActionButtonsGroup>
  );
};

export default ActionButtons;
