import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-between items-center text-center gap-2 py-8 px-2 text-(--color-text-primary) bg-(--color-bg-secondary) md:px-20 lg:px-25 md:flex-row">
      <p className="flex-1/3 md:text-start order-2 md:order-0">
        Coded by: <br />
        <a
          href="https://github.com/paologhidoni"
          target="_blank"
          className="underline hover:text-(--color-text-secondary)"
          rel="noopener noreferrer"
        >
          Paolo Ghidoni
        </a>
      </p>

      <div className="flex flex-1/3 justify-center order-1 md:order-0">
        <Logo />
      </div>

      <p className="flex-1/3 md:text-end order-3 md:order-0">
        Data provided by: <br />
        <a
          href="https://rawg.io"
          target="_blank"
          className="underline hover:text-(--color-text-secondary)"
          rel="noopener noreferrer"
        >
          RAWG Video Games Database
        </a>
      </p>
    </footer>
  );
}
