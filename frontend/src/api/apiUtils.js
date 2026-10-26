// CSRF-защита: токен администратора добавляется в каждый изменяющий запрос
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// CSRF-токен администратора: сервер отдаёт его при входе и в /api/check-admin
let csrfToken = null;

const rememberCsrfToken = (data) => {
    if (data && 'isAdmin' +
        '' in data) csrfToken = data.csrfToken || null;
    else if (data?.csrfToken) csrfToken = data.csrfToken;
};

const loadCsrfToken = async () => {
    const response = await fetch('/api/check-admin', {credentials: 'include'});
    rememberCsrfToken(await response.json().catch(() => null));
};

export const apiFetch = async (url, options = {}) => {
    const { body, headers, ...fetchOptions } = options;
    const method = (fetchOptions.method || 'GET').toUpperCase();

    const request = { headers: { ...headers } };

    if (body instanceof FormData) {
        request.body = body;
    } else if (body !== undefined) {
        request.body = JSON.stringify(body);
        request.headers['Content-Type'] = 'application/json';
    }

    if (UNSAFE_METHODS.includes(method)) {
        // после перезагрузки страницы токена ещё нет — берём его до изменяющего запроса
        if (!csrfToken && url !== '/api/verify-admin') await loadCsrfToken().catch(() => {});
        if (csrfToken) request.headers['X-CSRF-Token'] = csrfToken; //
    }

    const response = await fetch(url, {
        ...fetchOptions,
        ...request,
        credentials: 'include', // cookie сессии HttpOnly, JS её не читает
    });

    const data = await response.json().catch(() => null);
    rememberCsrfToken(data);

    if (!response.ok) {
        throw new Error(
            data?.error ||
            data?.message ||
            `Error: ${response.status}`
        );
    }

    if (url === '/api/logout') csrfToken = null;

    return data;
};
