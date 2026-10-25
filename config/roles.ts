export type Role = 'admin' | 'ess';

export const authFile = (role: Role): string => `.auth/${role}.json`;