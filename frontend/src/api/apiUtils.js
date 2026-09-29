export const apiFetch = async (url, options = {}) => {
    const { body, headers, ...fetchOptions } = options;

    const request = { headers: { ...headers } };

    if (body instanceof FormData) {
        request.body = body;
    } else {
        request.body = JSON.stringify(body);
        request.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...fetchOptions,
        ...request,
        credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.error ||
            data?.message ||
            `Error: ${response.status}`
        );
    }

    return data;
};