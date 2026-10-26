// [SEO] обновление title, description, canonical, og:url и robots при переходах внутри сайта
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

const setMeta = (selector, attributes) => {
    let tag = document.head.querySelector(selector);
    if (!tag) {
        tag = document.createElement(attributes.rel ? 'link' : 'meta');
        document.head.appendChild(tag);
    }
    Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
};

// Обновляет заголовок вкладки, описание, canonical и robots при переходах внутри приложения.
// При первой загрузке те же теги уже подставляет сервер (backend/seo.py), тексты берутся из utils/seo.js.
export const useDocumentMeta = (title, description, {noindex = false} = {}) => {
    // canonical и og:url зависят от адреса: после замены /item/12 на /item/12-slug их нужно обновить
    const {pathname} = useLocation();
    useEffect(() => {
        if (!title) return;
        document.title = title;
        setMeta('meta[property="og:title"]', {property: 'og:title', content: title});
        if (description) {
            setMeta('meta[name="description"]', {name: 'description', content: description});
            setMeta('meta[property="og:description"]', {property: 'og:description', content: description});
        }
        const url = window.location.origin + pathname;
        setMeta('meta[property="og:url"]', {property: 'og:url', content: url});
        setMeta('meta[name="robots"]', {name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow'});
        // у служебных страниц и страниц ошибок canonical не ставим, как и сервер
        const canonical = document.head.querySelector('link[rel="canonical"]');
        if (noindex) {
            canonical?.remove();
        } else {
            setMeta('link[rel="canonical"]', {rel: 'canonical', href: url});
        }
    }, [title, description, noindex, pathname]);
};
