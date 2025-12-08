import React from "react";

interface ButtonProps {
  text: string;
  type?: "button" | "submit" | "reset" | undefined;
  handleOnClick?: () => void;
  variant?: "variant-1" | "variant-2";
  extraClasses?: string;
  disabled?: boolean;
}

function Button({
  text,
  type = "button",
  handleOnClick,
  variant = "variant-1",
  extraClasses,
}: ButtonProps) {
  const variants = {
    "variant-1": `py-3 px-5 rounded-2xl w-fit font-bold border-2 border-(--color-accent-primary) bg-(--color-accent-primary) cursor-pointer transition-colors duration-100 text-(--color-text-secondary) hover:bg-(--color-accent-secondary) hover:border-(--color-accent-secondary) ${extraClasses}`,
    "variant-2": `py-3 px-5 rounded-2xl w-fit font-bold border-2 border-(--color-text-secondary) bg-transparent cursor-pointer transition-colors duration-100 text-(--color-text-secondary) hover:bg-(--color-accent-secondary) hover:border-(--color-accent-secondary) ${extraClasses}`,
  };

  const classes = variants[variant];

  return (
    <button type={type} onClick={handleOnClick} className={classes} disabled>
      {text}
    </button>
  );
}

export default React.memo(Button);
