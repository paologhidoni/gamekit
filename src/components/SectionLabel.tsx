export default function SectionLabel({ text }: { text: string }) {
  return (
    <h2 className="text-lg rounded-xl text-center font-bold py-2 px-4 bg-black text-(--color-accent-secondary) uppercase border-4 border-x-(--color-accent-secondary) border-y-(--color-accent-primary) transition-all transition-300">
      {text}
    </h2>
  );
}
