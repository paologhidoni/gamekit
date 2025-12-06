export default function LoadingSpinner() {
  return (
    <div className="flex justify-center min-h-screen">
      <div className="animate-spin m-auto rounded-full h-12 w-12 border-4 border-(--color-accent-primary) border-t-transparent" />
    </div>
  );
}
