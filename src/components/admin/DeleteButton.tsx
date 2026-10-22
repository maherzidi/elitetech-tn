"use client";

export default function DeleteButton({
  id,
  action,
  confirmText,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmText: string;
}) {
  return (
    <form
      action={async () => {
        if (confirm(confirmText)) {
          await action(id);
        }
      }}
    >
      <button type="submit" className="text-red-500 hover:underline">
        Supprimer
      </button>
    </form>
  );
}
