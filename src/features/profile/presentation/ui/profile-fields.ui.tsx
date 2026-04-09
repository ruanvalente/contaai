type ProfileFieldsProps = {
  name: string;
  onNameChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
  email: string;
};

export function ProfileFields({
  name,
  onNameChange,
  bio,
  onBioChange,
  email,
}: ProfileFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
            placeholder="Seu nome"
          />
            <p className="text-xs text-gray-500 mt-1 text-right">
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
          onChange={(e) => onBioChange(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Conte um pouco sobre você..."
          className="w-full px-4 py-2.5 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
        />
          <p className="text-xs text-gray-500 mt-1 text-right">
          {bio.length}/500
        </p>
      </div>
    </>
  );
}
