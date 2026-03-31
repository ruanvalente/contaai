"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransition } from "react";
import { Profile } from "@/features/profile/types/profile.types";
import { getProfileAction } from "@/features/profile/actions/get-profile.action";
import { updateProfileAction } from "@/features/profile/actions/update-profile.action";

type UseProfileFormReturn = {
  name: string;
  setName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  email: string;
  avatarUrl: string | null;
  setAvatarUrl: (value: string | null) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  success: string | null;
  hasChanges: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  handleAvatarChange: (file: File, previewUrl: string) => void;
  userId: string | undefined;
};

export function useProfileForm(userId?: string): UseProfileFormReturn {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await getProfileAction();
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || "");
        setBio(profileData.bio || "");
        setEmail(profileData.email);
        setAvatarUrl(profileData.avatar_url);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const hasChanges = useCallback(() => {
    if (!profile) return false;
    const originalName = profile.name || "";
    const originalBio = profile.bio || "";
    return (
      name !== originalName || bio !== originalBio || selectedFile !== null
    );
  }, [name, bio, selectedFile, profile]);

  const handleAvatarChange = useCallback((file: File, previewUrl: string) => {
    setSelectedFile(file);
    setAvatarUrl(previewUrl);
  }, []);

  const handleCancel = useCallback(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url);
      setSelectedFile(null);
      setError(null);
      setSuccess(null);
    }
  }, [profile]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

      if (!hasChanges()) {
        return;
      }

      startTransition(async () => {
        const result = await updateProfileAction({
          name,
          bio,
          avatarUrl: profile?.avatar_url || undefined,
          avatarFile: selectedFile || undefined,
        });

        if (!result.success) {
          setError(result.error || "Erro ao atualizar perfil.");
          return;
        }

        setProfile(result.profile);
        setSelectedFile(null);
        setSuccess("Perfil atualizado com sucesso!");
      });
    },
    [name, bio, selectedFile, profile, hasChanges],
  );

  return {
    name,
    setName,
    bio,
    setBio,
    email,
    avatarUrl,
    setAvatarUrl,
    selectedFile,
    setSelectedFile,
    isLoading,
    isPending,
    error,
    success,
    hasChanges: hasChanges(),
    handleSubmit,
    handleCancel,
    handleAvatarChange,
    userId: profile?.id || userId,
  };
}
