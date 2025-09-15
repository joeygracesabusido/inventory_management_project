
const API_URL = 'http://127.0.0.1:8000/graphql';

async function fetchGraphQL(query, variables = {}) {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        // Handle non-2xx responses
        const errorBody = await response.text();
        console.error('GraphQL request failed:', response.status, response.statusText, errorBody);
        throw new Error(`Network error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
        // Handle GraphQL-level errors
        console.error('GraphQL Errors:', result.errors);
        // If it's an auth error, maybe redirect to login
        if (result.errors.some(e => e.extensions?.code === 'AUTH_ERROR')) {
            // This is a custom check, depends on backend error format
            console.log('Authentication error detected, logging out.');
            logout(); // Assumes a logout function exists
        }
        throw new Error(result.errors.map(e => e.message).join('\n'));
    }

    return result.data;
}

// Example of a logout function that might be called on auth error
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Show login view - assumes a function toggleViews exists
    toggleViews('login-view'); 
}
