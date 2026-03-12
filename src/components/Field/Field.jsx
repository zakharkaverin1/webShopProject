import styles from './Field.module.scss'

const Field = (props) => {
    const { className = '', placeholder } = props

    return (
        <div className={`${styles.field} ${className}`}>
            <input
                className={styles.input}
                placeholder={placeholder}
                autoComplete="off"
            />
        </div>
    )
}

export default Field

