import {getAllItems} from "../api/api.js";


export const getItemById = (id) => {
    return getAllItems().then(items => {
        return items.filter(item => item.id === id); // Вернет массив
    });
}

export const getImagesById = (id) => {
    return getItemById(id).then(items => {
        if (items && items.length > 0) {
            const images = items[0].images;
            return typeof images === 'string' ? [images] : (images || []);
        }
        return [];
    });
}

export const filterItemsByTitle = (items, searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
        return items;
    }
    return items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

