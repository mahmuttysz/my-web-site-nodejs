export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include',
        ...options
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}