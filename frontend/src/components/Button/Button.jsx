import styles from './Button.module.scss'

const Button = (props) => {
    const {
        className = '',
        type = 'button',
        variant = 'primary',
        children,
        onClick,
        disabled = false,
        ...rest
    } = props

    return (
        <button
            className={`${styles.button} ${styles[variant] || ''} ${className}`}
            type={type}
            onClick={onClick}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button
