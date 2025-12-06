import { useNavigate } from "react-router";
import Button from "./Button";
import errorImg from "../assets/scared-luigi.png";

interface ErrorElementProps {
  errorMessage?: string;
}

export default function ErrorElement({ errorMessage }: ErrorElementProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 items-center p-10 text-center">
      <h1 className="text-3xl font-bold">
        Oh snap! An unexpected error occurred!
      </h1>

      {errorMessage && <p>{errorMessage}</p>}

      <img src={errorImg} alt="An unexpected error occurred" className="w-50" />

      <Button text="Back to home" handleOnClick={() => navigate("/")} />
    </div>
  );
}
