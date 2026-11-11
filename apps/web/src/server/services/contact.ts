/** Public contact form. Stores the message; nothing is emailed yet (no email provider configured). */
import { z } from 'zod';
import type { Ctx } from '../infra/db';
import { newId } from '../infra/crypto';
import { AppError, invalid } from '../domain/errors';
import { contacts, rateLimits } from '../data/repos';

export const ContactInput = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.').max(120),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(200),
  empresa: z.string().trim().min(1, 'Informe a empresa.').max(160),
  msg: z.string().trim().min(10, 'Escreva pelo menos 10 caracteres.').max(4000),
  /** Honeypot: humans leave it empty. */
  website: z.string().max(0).optional()
});

export async function submitContact(ctx: Ctx, input: unknown, ipHash: string | null) {
  const p = ContactInput.safeParse(input);
  if (!p.success) throw invalid(p.error.issues[0]?.message ?? 'Dados inválidos.');
  const hour = new Date(Math.floor(ctx.now().getTime() / 3_600_000) * 3_600_000).toISOString();
  if ((await rateLimits.hit(ctx.db, `contact:${ipHash ?? 'unknown'}`, hour)) > 10) throw new AppError(429, 'too_many_requests', 'Muitas mensagens nesta hora. Tente mais tarde.');
  const id = newId('msg');
  await contacts.insert(ctx.db, { id, name: p.data.nome, email: p.data.email, company: p.data.empresa, message: p.data.msg, ip_hash: ipHash, created_at: ctx.now().toISOString() });
  return { id, status: 'recebida — sem envio de e-mail nesta versão' };
}
