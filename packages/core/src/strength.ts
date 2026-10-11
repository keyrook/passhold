/**
 * How strong a password looks, as a score and the reasons it falls short.
 *
 * A deliberately simple structural check — enough to steer people away from
 * the obvious mistakes without shipping a 400 KB dictionary into the popup.
 * It returns codes, never sentences: the pages say them in the reader's
 * language.
 */
export type StrengthWarning = 'short' | 'digitsOnly' | 'repeats';

export interface PasswordStrength {
  /** 0–4, mirroring the familiar zxcvbn scale. */
  score: 0 | 1 | 2 | 3 | 4;
  warnings: StrengthWarning[];
}

export function scorePassword(password: string): PasswordStrength {
  const warnings: StrengthWarning[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score++;

  if (password.length < 10) warnings.push('short');
  if (/^\d+$/.test(password)) {
    warnings.push('digitsOnly');
    score = Math.min(score, 1);
  }
  if (/(.)\1{2,}/.test(password)) warnings.push('repeats');

  return { score: Math.max(0, Math.min(4, score - 1)) as PasswordStrength['score'], warnings };
}
