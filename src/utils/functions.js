import allItems from "../data/data.js";

export function getItemById (id)  {
    return allItems.find(item => item.id === id);
}
