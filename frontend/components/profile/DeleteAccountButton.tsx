"use client"

export default function DeleteAccountButton() {
  return (
    <form action="/api/auth/delete" method="POST">
      <button
        type="submit"
        className="bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 hover:text-white transition-all duration-300"
        onClick={(e) => {
          if (!confirm("Are you absolutely sure you want to permanently delete your account and all data? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        Delete Account
      </button>
    </form>
  )
}
