export function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' },
        status,
    });
}

export function errorResponse(message: string, status = 400): Response {
    const errorBody = { error: message };
    return new Response(JSON.stringify(errorBody, null, 2), {
        headers: { 'Content-Type': 'application/json' },
        status,
    });
} 