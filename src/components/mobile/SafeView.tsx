import React, {
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoSearch } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { motion } from "framer-motion";

interface SafeViewProps {
  children?: ReactNode;
  className?: string;
}

export const SafeView: React.FC<SafeViewProps> = ({ children, className }) => {
  return (
    <div
      className={`${className} pt-8 standalone:pt-2 pb-40 px-5 min-w-screen min-h-screen select-none`}
    >
      {children ? children : <p>No content available</p>}
    </div>
  );
};

export const Heading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={`${className} text-4xl font-bold mb-4`}>
      {children ? children : <p>Home</p>}
    </h1>
  );
};

export const SubHeading = ({
  children,
  subtitle,
  className,
}: {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}) => {
  return (
    <div className={`${className}`}>
      <h1 className="text-2xl font-bold">
        {children ? children : <p>Home</p>}
      </h1>
      {subtitle ? (
        <h4 className="text-sm text-muted-foreground">
          <p>{subtitle}</p>
        </h4>
      ) : null}
    </div>
  );
};

export const ScrollHeader = ({
  title,
  className = "",
  value,
  onChange,
  onSearch,
  onKeyDown,
  autoFocus,
}: {
  title: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 37) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleInputFocus = (isFocused: boolean) => {
    if (onInputFocus) onInputFocus(isFocused);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all opacity-0 pt-8 standalone:pt-12 pb-2 px-5 ${
        isScrolled
          ? "bg-white/75 backdrop-blur-2xl pt-14 opacity-[1] standalone:pt-[3.6rem]  pb-2 px-5"
          : "bg-transparent py-4"
      } ${className}`}
    >
      {/* Only show title when scrolled */}
      {isScrolled && (
        <>
          <h1 className="text-lg font-semibold text-center">{title}</h1>
          <Input
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Search"
            onSearch={onSearch}
            autoFocus={autoFocus}
            className="mb-5"
          />
        </>
      )}
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: () => void;
}

export const Input: React.FC<InputProps> = ({
  className,
  onSearch,
  autoFocus,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <>
      {/* <div className="dark:bg-white/[0.1]" /> */}
      <div
        className={`${
          className || ""
        } bg-black/[0.05] w-full rounded-xl relative flex items-center px-2 gap-2`}
      >
        <button>
          <IoSearch
            onClick={onSearch}
            className="text-muted-foreground"
            size={20}
          />
        </button>
        <input
          {...props}
          ref={inputRef}
          spellCheck="true"
          type="search"
          className="appearance-none py-2 bg-transparent w-full placeholder:text-muted-foreground focus:outline-none"
          placeholder="Search"
          aria-haspopup="false"
          title="Search"
        />
      </div>
    </>
  );
};

export const ScrollContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`${className} flex overflow-x-scroll pb-10 hide-scroll-bar gap-2`}
    >
      {children}
    </div>
  );
};

export const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      whileTap={{
        scale: 0.85,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
      transition={{ duration: 0.125, ease: "easeInOut" }}
      // className="flex flex-col items-center rounded-full p-2"
      onClick={handleBack}
      className={`${className} flex items-center space-x-2 p-2 cursor-pointer rounded-[50%] sm:bg-[#c7c7c75c] sm:hover:bg-[#ffffff40] transition-colors ease-out`}
    >
      <IoIosArrowBack size={24} />
      <span className="sr-only">Back</span>
    </motion.button>
  );
};
