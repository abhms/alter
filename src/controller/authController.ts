import { Request, Response, NextFunction } from 'express';
import { verifyGoogleToken } from '../config/googleOAuth';
import User from '../modal/User';
import jwt from 'jsonwebtoken';

export const googleSignIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);

    let user = await User.findOne({ googleId: payload?.sub });

    if (!user) {
      user = new User({
        googleId: payload?.sub,
        name: payload?.name,
        email: payload?.email,
        avatar: payload?.picture,
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
const userresponse={
  _id:user._id,
  name:user.name,
  email:user.email,
  avatar:user.avatar
}
    res.status(200).json({
      message: 'Google Sign-In successful',
      data: {
        user:userresponse,
        token: jwtToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
