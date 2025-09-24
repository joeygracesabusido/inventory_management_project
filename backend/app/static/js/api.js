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
        const errorBody = await response.text();
        console.error('GraphQL request failed:', response.status, response.statusText, errorBody);
        throw new Error(`Network error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        if (result.errors.some(e => e.extensions?.code === 'AUTH_ERROR')) {
            console.log('Authentication error detected, logging out.');
            logout();
        }
        throw new Error(result.errors.map(e => e.message).join('\n'));
    }

    return result.data;
}

async function login(email, password) {
    const query = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                accessToken
            }
        }
    `;
    const variables = { email, password };

    try {
        const data = await fetchGraphQL(query, variables);
        const token = data.login.accessToken;

        console.log("Received token:", token); 

        if (token) {
            localStorage.setItem('accessToken', token);
            console.log('Login successful! Token stored in localStorage.');
        } else {
            console.error('Login failed: No token received.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    console.log('Logged out and token removed from localStorage.');
}

async function addCategory(categoryName) {
    const query = `
        mutation AddCategory($name: String!) {
            addCategory(name: $name) {
                id
                name
                userId
            }
        }
    `;
    const variables = { name: categoryName };

    try {
        const data = await fetchGraphQL(query, variables);
        console.log('Category added:', data.addCategory);
    } catch (error) {
        console.error('Error adding category:', error);
    }
}
