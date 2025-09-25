
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-contact-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const contactName = document.getElementById('contact-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phone-number').value;

        const mutation = `
            mutation AddContact($contactData: ContactCreateInput!) {
                addContact(contactData: $contactData) {
                    id
                    contactName
                    accountNumber
                    firstName
                    lastName
                    email
                    phoneNumber
                    user
                }
            }
        `;

        const variables = {
            contactData: {
                contactName: contactName,
                accountNumber: accountNumber,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber
            }
        };

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: variables
                })
            });

            const result = await response.json();
            console.log(result)
            if (result.errors) {
                console.error('Error adding contact:', result.errors);
                alert('Error adding contact: ' + result.errors[0].message);
            } else {
                console.log('Contact added successfully:', result.data.addContact);
                alert('Contact added successfully!');
                form.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
});
