/**
 * Quem pode registrar a jogada do jogador da vez.
 *
 * - o próprio jogador;
 * - jogador gerido: o criador da sessão ou itspx;
 * - jogador adicionado manualmente: o criador ou quem o adicionou;
 * - quem entrou pelo convite: só ele mesmo.
 *
 * Módulo puro e sem dependências: é usado tanto pela tela (para decidir se
 * mostra o botão) quanto pela Server Action (para autorizar de verdade).
 */
export interface RollPermissionPlayer {
  profile_id: string;
  is_managed: boolean;
  added_by: string | null;
}

export interface RollPermissionOptions {
  isHost: boolean;
  isScoreboardAdmin: boolean;
}

export function canActForPlayer(player: RollPermissionPlayer, userId: string, options: RollPermissionOptions): boolean {
  if (player.profile_id === userId) return true;

  if (player.is_managed) return options.isHost || options.isScoreboardAdmin;

  if (player.added_by !== null) return options.isHost || player.added_by === userId;

  return false;
}
