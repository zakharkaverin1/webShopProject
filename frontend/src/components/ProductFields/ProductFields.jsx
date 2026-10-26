import {PRODUCT_STATUSES} from "../../utils/functions.js";

const twoColumns = {display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12};

// Поля товара для форм добавления и редактирования.
// values — {title, description, price, category_id, materials, dimensions, status}, onChange(name, value)
const ProductFields = (props) => {
    const {values, onChange, categories = []} = props;
    const handleChange = (e) => onChange(e.target.name, e.target.value);

    return (
        <>
            <label className="label">
                Название
                <input
                    className="input"
                    type="text"
                    name="title"
                    maxLength={200}
                    placeholder="Название товара"
                    value={values.title}
                    onChange={handleChange}
                />
            </label>

            <label className="label">
                Описание
                <textarea
                    className="textarea"
                    name="description"
                    maxLength={5000}
                    placeholder="Описание товара"
                    value={values.description}
                    onChange={handleChange}
                />
            </label>

            <div style={twoColumns}>
                <label className="label">
                    Цена, ₽
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        name="price"
                        placeholder="0"
                        value={values.price}
                        onChange={handleChange}
                    />
                </label>
                <label className="label">
                    Категория
                    <select
                        className="select"
                        name="category_id"
                        value={values.category_id}
                        onChange={handleChange}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div style={twoColumns}>
                <label className="label">
                    Материалы
                    <input
                        className="input"
                        type="text"
                        name="materials"
                        maxLength={300}
                        placeholder="Керамика, глазурь"
                        value={values.materials}
                        onChange={handleChange}
                    />
                </label>
                <label className="label">
                    Размеры
                    <input
                        className="input"
                        type="text"
                        name="dimensions"
                        maxLength={300}
                        placeholder="Ø 60 см / 40 × 60 см"
                        value={values.dimensions}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <label className="label">
                Наличие
                <select
                    className="select"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                >
                    {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </label>
        </>
    );
};

export default ProductFields;
