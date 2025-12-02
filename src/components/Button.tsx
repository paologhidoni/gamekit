import React from "react";

interface ButtonProps {
  text: string;
  handleOnClick: () => void;
}

function Button({ text, handleOnClick }: ButtonProps) {
  return (
    <button
      onClick={handleOnClick}
      className="py-4 px-6 rounded-xl w-fit font-bold cursor-pointer transition-colors duration-100 text-(--color-text-secondary) bg-(--color-accent-primary) hover:bg-opacity-5"
    >
      {text}
    </button>
  );
}

export default React.memo(Button);
