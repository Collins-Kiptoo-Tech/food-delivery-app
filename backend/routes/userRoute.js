/*import express from 'express'
import { loginUser, registerUser } from '../controller/userController.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

export default userRouter;*/
import express from 'express'
import { loginUser, registerUser } from '../controller/userController.js'
import authMiddleware from '../middleware/auth.js'
import userModel from '../models/userModel.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('\n========== PROFILE REQUEST ==========');
    console.log('User ID from middleware:', req.userId);
    
    if (!req.userId) {
      console.log('❌ No user ID found');
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found" 
      });
    }
    
    const user = await userModel.findById(req.userId).select("-password");
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    console.log('✅ User found:', user.name, user.email);
    console.log('========== PROFILE REQUEST END ==========\n');
    
    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        cartData: user.cartData
      }
    });
  } catch (error) {
    console.error('\n========== PROFILE ERROR ==========');
    console.error('Error:', error);
    console.error('========== PROFILE ERROR END ==========\n');
    
    res.status(500).json({ 
      success: false, 
      message: "Error fetching profile",
      error: error.message 
    });
  }
})

export default userRouter;