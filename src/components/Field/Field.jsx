import styles from './Field.module.scss'

const Field = (props) => {
    const {
        className = '',
        placeholder,
        value = '',
        onChange
    } = props

    return (
        <div className={`${styles.field} ${className}`}>
            <input
                className={styles.input}
                placeholder={placeholder}
                autoComplete="off"
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

export default Field