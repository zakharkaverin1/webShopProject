import React from 'react';
import styles from './modal.module.scss';

const Modal = (props) => {
    const {isOpen, onClose, children} = props;
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.close} onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;