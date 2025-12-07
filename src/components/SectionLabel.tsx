export default function SectionLabel({ text }: { text: string }) {
  return (
    <h2 className="font-gonadaltes tracking-wider uppercase md:text-xl rounded-2xl text-center font-bold py-2 px-4 bg-black text-(--color-accent-secondary) border-t-4 border-t-(--color-accent-primary)">
      {text}
    </h2>
  );
}
