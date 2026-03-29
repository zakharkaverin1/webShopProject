import allItems from "../data/data.js";

export const getItemById = (id)  => {
    return allItems.find(item => item.id === id);
}

export const filterItemsByTitle = (items, searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
        return items;
    }
    return items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
};