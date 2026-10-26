import React, {useEffect} from 'react';
import styles from './modal.module.scss';

const Modal = (props) => {
    const {isOpen, onClose, children} = props;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.classList.add('modal-open');

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div className={styles.overlay} onMouseDown={handleOverlayClick}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <button className={styles.close} onClick={onClose} aria-label="Закрыть">
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
