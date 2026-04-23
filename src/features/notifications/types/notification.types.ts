export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export type NotificationOptions = {
  id?: string;
  duration?: number;
  closeable?: boolean;
  dismissible?: boolean;
  unimportant?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type NotificationPayload = {
  message: string;
  type?: NotificationType;
  title?: string;
  data?: Record<string, unknown>;
}

export const NOTIFICATION_MESSAGES = {
  auth: {
    signInSuccess: 'Login realizado com sucesso',
    signUpSuccess: 'Conta criada com sucesso',
    signOutSuccess: 'Logout realizado com sucesso',
    signInError: 'Erro ao fazer login',
    signUpError: 'Erro ao criar conta',
    signOutError: 'Erro ao fazer logout',
  },
  favorites: {
    addSuccess: 'Livro adicionado aos favoritos',
    removeSuccess: 'Livro removido dos favoritos',
    addError: 'Erro ao adicionar aos favoritos',
    removeError: 'Erro ao remover dos favoritos',
  },
  books: {
    createSuccess: 'Livro criado com sucesso',
    updateSuccess: 'Livro atualizado com sucesso',
    deleteSuccess: 'Livro excluído com sucesso',
    publishSuccess: 'Livro publicado com sucesso',
    createError: 'Erro ao criar livro',
    updateError: 'Erro ao atualizar livro',
    deleteError: 'Erro ao excluir livro',
    publishError: 'Erro ao publicar livro',
  },
  reading: {
    saveProgressSuccess: 'Progresso salvo',
    saveProgressError: 'Erro ao salvar progresso',
  },
  profile: {
    updateSuccess: 'Perfil atualizado com sucesso',
    uploadAvatarSuccess: 'Foto de perfil atualizada',
    uploadAvatarError: 'Erro ao atualizar foto de perfil',
    uploadError: 'Erro ao fazer upload',
  },
  upload: {
    success: 'Upload realizado com sucesso',
    error: 'Erro ao fazer upload',
    coverSuccess: 'Capa atualizada com sucesso',
    coverError: 'Erro ao atualizar capa',
  },
  search: {
    noResults: 'Nenhum resultado encontrado',
    error: 'Erro na busca',
  },
  generic: {
    error: 'Ocorreu um erro',
    success: 'Operação realizada com sucesso',
    saveError: 'Erro ao salvar',
    loadError: 'Erro ao carregar',
    deleteError: 'Erro ao excluir',
  },
} as const;