import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
    console.log('\n========== AUTH MIDDLEWARE ==========');
    console.log('Headers received:', req.headers);
    
    // Get token from headers
    const { token } = req.headers;
    console.log('Token present:', token ? 'Yes' : 'No');
    
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ 
            success: false, 
            message: "Not Authorized Login Again" 
        });
    }
    
    try { 
        console.log('Verifying token...');
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', token_decode);
        
        // Your createToken uses { id } so we need to use token_decode.id
        req.userId = token_decode.id;
        console.log('✅ Set req.userId to:', req.userId);
        console.log('========== AUTH MIDDLEWARE END ==========\n');
        
        next();
    } catch(error) {
        console.error('❌ Token verification failed:', error.message);
        console.log('========== AUTH MIDDLEWARE ERROR ==========\n');
        
        return res.status(401).json({ 
            success: false, 
            message: "Invalid token",
            error: error.message 
        });
    }
}

export default authMiddleware;