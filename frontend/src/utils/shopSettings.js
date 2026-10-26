import {useEffect, useSyncExternalStore} from "react";
import {getShopSettings} from "../api/api.js";

export const DEFAULT_SETTINGS = {
    shopName: "Магазин",
    titleColor: "#0F8A87",
    font: "'Cormorant Garamond', serif",
};

// Общие настройки магазина: грузятся один раз и доступны любому компоненту
let settings = null;
let request = null;
const listeners = new Set();

const notify = () => listeners.forEach(listener => listener());

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => settings;

export const loadShopSettings = () => {
    if (!request) {
        request = getShopSettings()
            .then(data => {
                settings = {...DEFAULT_SETTINGS, ...data};
            })
            .catch(() => {
                settings = DEFAULT_SETTINGS;
            })
            .finally(notify);
    }
    return request;
};

export const setShopSettingsCache = (data) => {
    settings = {...DEFAULT_SETTINGS, ...data};
    notify();
};

// Возвращает null, пока настройки не загрузились
export const useShopSettings = () => {
    const current = useSyncExternalStore(subscribe, getSnapshot);
    useEffect(() => {
        loadShopSettings();
    }, []);
    return current;
};
