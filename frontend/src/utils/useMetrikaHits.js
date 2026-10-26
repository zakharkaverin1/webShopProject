// [SEO] весь файл новый: просмотры страниц в Яндекс.Метрике при переходах внутри SPA
import {useEffect, useRef} from "react";
import {useLocation, useNavigationType} from "react-router-dom";

// Яндекс.Метрика сама считает только первую загрузку страницы.
// Переходы внутри SPA отправляем вручную. Счётчик подключает сервер, если задан YANDEX_METRIKA_ID.
const useMetrikaHits = () => { // [ОПТ] хук больше не экспортируется: снаружи нужен только компонент ниже
    const {pathname, search} = useLocation();
    const navigationType = useNavigationType();
    const previousUrl = useRef(null);

    useEffect(() => {
        const url = window.location.href;
        const referer = previousUrl.current;
        previousUrl.current = url;
        // первый просмотр уже отправлен при init; замена /item/12 на /item/12-slug — не новый просмотр
        if (referer === null || referer === url || navigationType === "REPLACE") return;
        const counterId = window.YANDEX_METRIKA_ID;
        if (counterId && typeof window.ym === "function") {
            window.ym(counterId, "hit", url, {referer});
        }
    }, [pathname, search, navigationType]);
};

// [ОПТ] перенесено из app.jsx: в файле точки входа компонент мешал горячей перезагрузке (ошибка eslint react-refresh)
export const MetrikaHits = () => { // [SEO] ставится внутрь BrowserRouter
    useMetrikaHits(); // [SEO]
    return null; // [SEO]
}; // [SEO]
