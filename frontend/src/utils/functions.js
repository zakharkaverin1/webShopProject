import { getAllItems } from "../api/api.js";

export const getItemById = (id) => {
    return getAllItems().then(items => {
        return items.filter(item => item.id === id); // Вернет массив
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