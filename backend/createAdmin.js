import axios from 'axios'

const createAdmin = async () => {
    try {
        const response = await axios.post('http://localhost:4000/api/admin/auth/setup', {
            name: 'Super Admin',
            email: 'admin@freshfeast.com',
            password: 'admin123'
        })
        
        console.log('Response:', response.data)
    } catch (error) {
        console.error('Error:', error.response?.data || error.message)
    }
}

createAdmin()