interface UserRecord {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  isProfileCompleted: boolean;
  createdAt: Date;
}

interface SignupResponse {
  userId: string;
  fullName: string;
  email: string;
  isProfileCompleted: boolean;
  createdAt: string;
}

export class AuthenticationMapper {

  toSignupResponse = (user: UserRecord): SignupResponse => {
    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      isProfileCompleted: user.isProfileCompleted,
      createdAt: user.createdAt.toISOString(),
    };
  };
}