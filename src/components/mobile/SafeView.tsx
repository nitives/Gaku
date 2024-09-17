import React, {
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoSearch } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";
import Link from "next/link";

interface SafeViewProps {
  children?: ReactNode;
  className?: string;
  backButton?: boolean;
}

export const SafeView: React.FC<SafeViewProps> = ({
  children,
  className = "",
  backButton,
}) => {
  return (
    <>
      {backButton ? (
        <div className="z-50 relative pt-5 standalone:pt-0">
          <BackButton />
        </div>
      ) : null}
      <div
        className={`${className} pt-8 standalone:pt-12 pb-40 px-5 min-w-screen min-h-screen select-none`}
      >
        {children ? children : <p>No content available</p>}
      </div>
    </>
  );
};

export const Heading = ({
  children,
  className = "",
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
  className = "",
  link,
  onClick,
}: {
  children: ReactNode;
  subtitle?: string;
  className?: string;
  link?: string;
  onClick?: () => void;
}) => {
  return (
    <div onClick={onClick} className={`${className}`}>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        {link ? (
          <motion.button
            whileTap={{
              scale: 0.95,
              translateX: -5,
            }}
            transition={{ duration: 0.125, ease: "easeInOut" }}
          >
            <Link href={link}>
              <div className="flex items-center gap-2">
                {children}
                <IoIosArrowForward
                  className="text-muted-foreground"
                  size={24}
                />
              </div>
            </Link>
          </motion.button>
        ) : (
          children
        )}
      </h1>
      {subtitle && (
        <h4 className="text-sm text-muted-foreground">
          <p>{subtitle}</p>
        </h4>
      )}
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

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all opacity-0 pt-8 standalone:pt-12 pb-2 px-5 ${
        isScrolled
          ? "bg-background/75 backdrop-blur-2xl pt-14 opacity-[1] standalone:pt-[3.6rem]  pb-2 px-5"
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

export const Header = ({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children?: ReactNode;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
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

  return (
    <div className={`${className}`}>
      <Heading>{title}</Heading>
      <div
        className={`${
          isScrolled
            ? "fixed top-0 left-0 w-full z-50 bg-foreground/75 backdrop-blur-2xl pt-10 standalone:pt-16 pb-2"
            : "relative pt-10 pb-4"
        } transition-all`}
      >
        <Input placeholder="Search" className="" />
      </div>
      <div className={`pt-20 ${isScrolled ? "mt-12" : ""}`}>{children}</div>
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: () => void;
  icon?: React.ReactNode | false;
}

export const Input: React.FC<InputProps> = ({
  className,
  onSearch,
  autoFocus,
  placeholder,
  type,
  title,
  icon,
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
      <div
        className={`${
          className || ""
        } bg-foreground/[0.05] w-full rounded-xl relative flex items-center px-2 gap-2`}
      >
        {icon !== false && (
          <button>
            {icon || (
              <IoSearch
                onClick={onSearch}
                className="text-muted-foreground"
                size={20}
              />
            )}
          </button>
        )}
        <input
          {...props}
          ref={inputRef}
          spellCheck="true"
          type={type}
          className={`appearance-none py-2 bg-transparent w-full placeholder:text-muted-foreground focus:outline-none ${
            icon === false ? "pl-2" : ""
          }`}
          placeholder={placeholder}
          aria-haspopup="false"
          title={title}
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
      className={`${className} flex overflow-x-scroll pb-10 max-sm:pb-5 hide-scroll-bar gap-2`}
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
      whileTap={{
        scale: 0.9,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      }}
      transition={{ duration: 0.125, ease: "easeInOut" }}
      onClick={handleBack}
      className={`${className} flex items-center space-x-2 p-2 max-sm:pl-0 cursor-pointer rounded-[50%] sm:hover:bg-[rgba(255,255,255,0.1)] sm:ml-4 transition-colors ease-out`}
    >
      <IoIosArrowBack size={30} />
      <span className="sr-only">Back</span>
    </motion.button>
  );
};
