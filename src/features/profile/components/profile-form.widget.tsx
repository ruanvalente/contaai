"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuthStore } from "@/shared/storage/use-auth-store";
import { getUserProfile, updateUserProfile } from "@/features/profile/actions/profile.actions";
import { uploadAvatar } from "@/features/profile/actions/upload.actions";
import { AvatarUpload } from "@/features/profile/components/avatar-upload.widget";
import { Check, AlertCircle } from "lucide-react";

export function ProfileFormWidget() {
  const { user, setUser } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setName(profile.name || "");
        setBio(profile.bio || "");
        setEmail(profile.email || "");
        setAvatarUrl(profile.avatar_url);
        setOriginalAvatarUrl(profile.avatar_url);
      } else if (user) {
        setEmail(user.email);
        setName(user.name || "");
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const hasChanges =
    name !== (user?.name || "") ||
    bio !== "" ||
    selectedFile !== null;

  const handleAvatarChange = (previewUrl: string) => {
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarUrl(previewUrl);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setBio("");
    setAvatarUrl(originalAvatarUrl);
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (name.length > 100) {
      setError("Nome deve ter no máximo 100 caracteres.");
      return;
    }

    if (bio.length > 500) {
      setError("Bio deve ter no máximo 500 caracteres.");
      return;
    }

    startTransition(async () => {
      try {
        let newAvatarUrl = originalAvatarUrl;

        if (selectedFile && user?.id) {
          setIsUploading(true);

          const uploadResult = await uploadAvatar(selectedFile, user.id);

          if (!uploadResult.success) {
            setError(uploadResult.error || "Erro ao fazer upload da imagem.");
            setIsUploading(false);
            return;
          }

          newAvatarUrl = uploadResult.url;
          setAvatarUrl(newAvatarUrl);
          setOriginalAvatarUrl(newAvatarUrl);
          setSelectedFile(null);
          setIsUploading(false);
        }

        const result = await updateUserProfile({
          name: name || undefined,
          bio: bio || undefined,
          avatar_url: newAvatarUrl || undefined,
        });

        if (!result.success) {
          setError(result.error || "Erro ao atualizar perfil.");
          return;
        }

        setUser({
          id: result.profile.id,
          email: result.profile.email,
          name: result.profile.name || undefined,
          avatar_url: result.profile.avatar_url || undefined,
        });

        setOriginalAvatarUrl(newAvatarUrl);
        setSuccess("Perfil atualizado com sucesso!");
      } catch (err) {
        console.error("Error saving profile:", err);
        setError("Erro interno ao salvar. Tente novamente.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-error/10 text-error rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-success/10 text-success rounded-lg">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <AvatarUpload
          name={name}
          src={avatarUrl}
          size="xl"
          userId={user?.id || ""}
          onUploadComplete={handleAvatarChange}
          isUploading={isUploading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
            placeholder="Seu nome"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {name.length}/100
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-4 py-2.5 border border-primary-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Conte um pouco sobre você..."
          className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {bio.length}/500
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-primary-200">
        <button
          type="submit"
          disabled={isPending || !hasChanges || isUploading}
          className="px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending || !hasChanges}
          className="px-6 py-2.5 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
