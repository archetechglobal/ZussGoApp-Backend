import { z } from "zod";

export const signupSchema = z.object({
    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must be at most 50 characters"),

    email: z    
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be at most 100 characters"),
        
});

export type SignupInput = z.infer<typeof signupSchema>;