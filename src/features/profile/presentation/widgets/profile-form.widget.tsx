"use client";

import { useProfileForm, AvatarUpload, ProfileFeedback, ProfileFields, ProfileFormUI } from "@/features/profile";
import { useAuthStore } from "@/shared/storage/use-auth-store";

export function ProfileFormWidget() {
  const { user } = useAuthStore();
  const {
    name,
    setName,
    bio,
    setBio,
    email,
    avatarUrl,
    isLoading,
    isPending,
    error,
    success,
    hasChanges,
    handleSubmit,
    handleCancel,
    handleAvatarChange,
  } = useProfileForm(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProfileFormUI
      onSubmit={handleSubmit}
      isSubmitDisabled={!hasChanges}
      isPending={isPending}
      isCancelDisabled={!hasChanges}
      onCancel={handleCancel}
    >
      <ProfileFeedback error={error} success={success} />

      <div className="flex items-center gap-4">
        <AvatarUpload
          name={name}
          src={avatarUrl}
          size="xl"
          onUploadComplete={handleAvatarChange}
        />
      </div>

      <ProfileFields
        name={name}
        onNameChange={setName}
        bio={bio}
        onBioChange={setBio}
        email={email}
      />
    </ProfileFormUI>
  );
}
