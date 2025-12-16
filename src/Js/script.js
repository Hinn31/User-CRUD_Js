
const API_URL = 'https://jsonplaceholder.typicode.com/users';

let users = [];

const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTable').querySelector('tbody');
const nameInput = document.getElementById('name');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const websiteInput = document.getElementById('website');
const nameError = document.getElementById('nameError');
const usernameError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const websiteError = document.getElementById('websiteError');
const submitBtn = document.getElementById('submitBtn');
const userIdInput = document.getElementById('userId');

function validateName(name) {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
}

function validateUsername(username) {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return '';
}

function validateEmail(email) {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
}

function validatePhone(phone) {
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) return 'Invalid phone number format';
    return '';
}

function validateWebsite(website) {
    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) return 'Invalid website URL';
    return '';
}

// Fetch users
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users');
        return [];
    }
}

// Load and display users
async function loadUsers() {
    users = await fetchUsers();
    displayUsers(users);
}

// Display users in table
function displayUsers(userList) {
    userTableBody.innerHTML = '';
    userList.forEach(user => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', user.id);
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.website}</td>
            <td>
                <button onclick="editUser(${user.id})">Edit</button>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Add new user
async function addUser(userData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const newUser = await response.json();
        users.push(newUser);
        displayUsers(users);
        alert('User added successfully');
    } catch (error) {
        console.error('Error adding user:', error);
        // Generate local ID and add
        const newId = Math.max(...users.map(u => u.id)) + 1;
        const newUser = { id: newId, ...userData };
        users.push(newUser);
        displayUsers(users);
        alert('User added locally (API failed)');
    }
}

// Update user
async function updateUser(id, userData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        console.log('Response status:', response.status);
        // For demo purposes, ignore API errors and update locally
        const index = users.findIndex(u => u.id == id);
        if (index !== -1) {
            users[index] = { id: parseInt(id), ...userData };
        }
        displayUsers(users);
        alert('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        // Still update locally even if API fails
        const index = users.findIndex(u => u.id == id);
        if (index !== -1) {
            users[index] = { id: parseInt(id), ...userData };
        }
        displayUsers(users);
        alert('User updated locally (API failed)');
    }
}

// Edit user
function editUser(id) {
    const user = users.find(u => u.id == id);
    if (!user) return;
    nameInput.value = user.name;
    usernameInput.value = user.username;
    emailInput.value = user.email;
    phoneInput.value = user.phone;
    websiteInput.value = user.website;
    userIdInput.value = id;
    submitBtn.textContent = 'Update User';
}

// Delete user
async function deleteUser(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        users = users.filter(u => u.id != id);
        displayUsers(users);
        alert('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        // Still delete locally
        users = users.filter(u => u.id != id);
        displayUsers(users);
        alert('User deleted locally (API failed)');
    }
}

// Form submit handler
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    nameError.textContent = '';
    usernameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    websiteError.textContent = '';
    
    const name = nameInput.value;
    const username = usernameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const website = websiteInput.value;
    
    // Validate
    const nameErr = validateName(name);
    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const websiteErr = validateWebsite(website);
    
    if (nameErr || usernameErr || emailErr || phoneErr || websiteErr) {
        nameError.textContent = nameErr;
        usernameError.textContent = usernameErr;
        emailError.textContent = emailErr;
        phoneError.textContent = phoneErr;
        websiteError.textContent = websiteErr;
        return;
    }
    
    const userData = { name, username, email, phone, website };
    const userId = userIdInput.value;
    
    if (userId) {
        await updateUser(userId, userData);
    } else {
        await addUser(userData);
    }
    
    // Clear form and reset
    userForm.reset();
    userIdInput.value = '';
    submitBtn.textContent = 'Add User';
});

// Load users on page load
loadUsers();