import errorImg from "../assets/scared-luigi.webp";

interface ErrorElementProps {
  errorMessage?: string;
}

export default function ErrorElement({ errorMessage }: ErrorElementProps) {
  return (
    <div className="flex flex-col gap-4 items-center p-10 text-center">
      <h1 className="text-2xl font-bold">
        Oh snap! <br /> An unexpected error occurred!
      </h1>

      {errorMessage && <p>{errorMessage}</p>}

      <img src={errorImg} alt="An unexpected error occurred" className="w-50" />
    </div>
  );
}
