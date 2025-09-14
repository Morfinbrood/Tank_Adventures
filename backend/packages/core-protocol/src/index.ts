import { z } from 'zod';

export const ProtocolVersion = "1.0.0";

export const RegisterSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1) });
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export const LobbyCreateSchema = z.object({ name: z.string().min(1) });

export const ChatMessageSchema = z.object({
  room: z.string(),
  text: z.string().min(1).max(500),
});

export const GameInputSchema = z.object({
  type: z.literal('input'),
  key: z.enum(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']),
  pressed: z.boolean(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type LobbyCreateDto = z.infer<typeof LobbyCreateSchema>;
export type GameInput = z.infer<typeof GameInputSchema>;
