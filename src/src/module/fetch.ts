import { CapacitorHttp, Capacitor } from '@capacitor/core';

async function fetchWrapper(url: string, options: RequestInit = {}) {
    const method = options.method?.toUpperCase() || 'GET';

    const headers: Record<string, string> = {};
    if (options.headers instanceof Headers) {
        for (const [key, value] of options.headers.entries()) {
            headers[key.split('-').map((e) => `${e[0].toUpperCase()}${e.slice(1)}`).join('-')] = String(value);
        }
    }
    else {
        for (const [key, value] of Object.entries(options.headers || {})) {
            headers[key.split('-').map((e) => `${e[0].toUpperCase()}${e.slice(1)}`).join('-')] = String(value);
        }
    }
    const response = await CapacitorHttp.request({
        method,
        url,
        headers,
        data: options.body ? `${options.body}` : undefined,
        disableRedirects: options?.redirect === 'manual',
        //webFetchExtra: options,
    });

    const responseHeaders: Record<string, string> = {};
    Object.entries(response.headers).forEach(([key, string]) => {
        responseHeaders[key.toLowerCase()] = string;
    })

    // fetch와 비슷하게 응답 형식 정리
    return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => typeof (response.data) === "string" ? JSON.parse(response.data) : response.data,
        text: async () => typeof (response.data) === "string" ? response.data : JSON.stringify(response.data),
        headers: {
            ...responseHeaders,
            get: (name: string) => responseHeaders[name.toLowerCase()] ?? null,
            getSetCookie: () => (responseHeaders['set-cookie'] ?? '').split(';').map(e => e.trim())
        },
        url: response.url
    };
}

if (Capacitor.getPlatform() !== 'web') {
    //@ts-expect-error
    globalThis.fetch = fetchWrapper;
}