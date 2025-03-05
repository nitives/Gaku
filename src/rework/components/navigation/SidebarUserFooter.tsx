import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { MiniSpinner } from "../extra/MiniSpinner";

export const SidebarUserFooter = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <FooterContainer href="#">
        <div className="flex gap-2 items-center">
          <div className="bg-white/5 animate-pulse rounded-full size-8" />
          <MiniSpinner size="md" />
        </div>
        <div>
          <IoIosArrowForward className="fill-[--systemSecondary]" />
        </div>
      </FooterContainer>
    );
  }

  if (!user) {
    return (
      <FooterContainer href="/sign-in">
        <div className="flex gap-2 items-center">
          <div className="bg-white/5 rounded-full size-8" />
          Sign in
        </div>
        <div>
          <IoIosArrowForward className="fill-[--systemSecondary]" />
        </div>
      </FooterContainer>
    );
  }

  return (
    <FooterContainer href="/settings">
      <div className="flex gap-2 items-center">
        {user.imageUrl && (
          <div className="bg-white/5 rounded-full size-8 overflow-hidden">
            <Image
              src={user.imageUrl}
              alt="User profile image"
              width={40}
              height={40}
            />
          </div>
        )}
        {user.username || user.fullName || user.firstName}
      </div>
      <div>
        <IoIosArrowForward className="fill-[--systemSecondary]" />
      </div>
    </FooterContainer>
  );
};

const FooterContainer = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="z-10 relative mb-16 p-3">
      <Link href={href}>
        <div className="hover:bg-white/5 w-full p-2 rounded-[9px] flex justify-between items-center">
          {children}
        </div>
      </Link>
    </div>
  );
};
