export function UserAvatar({
  name,
  pictureUrl,
  size = "w-7 h-7",
}: {
  name: string;
  pictureUrl?: string | null;
  size?: string;
}) {
  if (pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        className={`${size} rounded-full object-cover border border-slate-200 shrink-0 shadow-xs`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs text-[10px]`}
    >
      {name?.[0] || "?"}
    </div>
  );
}
