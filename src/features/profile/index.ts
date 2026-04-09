// Profile Feature - Re-exports para nova estrutura

// Application - Queries
export { getProfile } from './application/queries/get-profile.query';

// Application - Commands
export { updateProfile } from './application/commands/update-profile.command';

// Actions (legacy - ainda necessários)
export { getProfileAction } from './actions/get-profile.action';
export { updateProfileAction } from './actions/update-profile.action';
export { uploadAvatar } from './actions/upload-avatar.action';
export { getUserProfile } from './actions/profile.actions';

// Hooks
export { useProfileForm } from './hooks/use-profile-form';

// Presentation - Widgets
export { ProfileFormWidget } from './presentation/widgets/profile-form.widget';
export { AvatarUpload } from './presentation/widgets/avatar-upload.widget';

// Presentation - UI
export { ProfileFormUI } from './presentation/ui/profile-form.ui';
export { ProfileFields } from './presentation/ui/profile-fields.ui';
export { ProfileFeedback } from './presentation/ui/profile-feedback.ui';

// Presentation - Pages
export { SettingsPage } from './presentation/pages/settings.page';

// Reading (sub-feature)
export { ReadingSectionWidget } from './reading/widgets/reading-section.widget';
export { ReadingPreview } from './reading/widgets/reading-preview.widget';
export { ReadingModeToggle } from './reading/widgets/reading-mode-toggle.widget';
export { FontSizeSelector } from './reading/widgets/font-size-selector.widget';
export { AutoScrollToggle } from './reading/widgets/auto-scroll-toggle.widget';
export { useReadingPreferences } from './reading/hooks/use-reading-preferences';
export { ReadingSectionUI } from './reading/ui/reading-section.ui';