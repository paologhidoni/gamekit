export default function SearchBar() {
  return (
    <div
      className="rounded-full transition duration-300"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
        // borderColor: "var(--color-accent-primary)",
        // borderWidth: 2,
      }}
    >
      <div></div>
      <input type="text" className="py-2 px-6" />
    </div>
  );
}
