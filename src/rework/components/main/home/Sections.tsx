"use client";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { SoundCloudSections } from "@/lib/types/soundcloud";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../../extra/Spinner";
import style from "./Sections.module.css";
import Link from "next/link";
import Image from "next/image";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import { TryAgain } from "../../extra/TryAgain";
import { PrefetchLink } from "../../navigation/PrefetchLink";

export const Sections = () => {
  const { data, isLoading, error, refetch } = useQuery<SoundCloudSections>({
    queryKey: ["homeSections"],
    queryFn: SoundCloudKit.getHomeSections,
    staleTime: 1000 * 60 * 60, // 1 hour in milliseconds
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const sections = data?.collection;
  if (isLoading && !sections) return <Spinner />;
  if (error)
    return (
      <>
        <p>Error</p>
        <TryAgain
          errorMessage={(error as Error).message}
          errorName={(error as Error).name}
          onTryAgain={() => {
            refetch();
          }}
        />
      </>
    );

  return sections && <Section data={sections} />;
};

const Section = ({ data }: { data: SoundCloudSections["collection"] }) => {
  return (
    <div className={style.section}>
      {data.map((section) => (
        <div className="mb-10" key={section.id}>
          <SectionHeader url={section.tracking_feature_name}>
            {section.title}
          </SectionHeader>
          <SectionItems items={section.items.collection} />
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) => {
  return (
    <div className={style.sectionHeader}>
      <Link href={`/rooms/${url}`}>
        <h1>{children}</h1> <Chevron />
      </Link>
    </div>
  );
};

const Chevron = () => {
  return (
    <svg
      className={style.sectionHeaderChevron}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path d="M19.817 61.863c1.48 0 2.672-.515 3.702-1.546l24.243-23.63c1.352-1.385 1.996-2.737 2.028-4.443 0-1.674-.644-3.09-2.028-4.443L23.519 4.138c-1.03-.998-2.253-1.513-3.702-1.513-2.994 0-5.409 2.382-5.409 5.344 0 1.481.612 2.833 1.739 3.96l20.99 20.347-20.99 20.283c-1.127 1.126-1.739 2.478-1.739 3.96 0 2.93 2.415 5.344 5.409 5.344Z"></path>
    </svg>
  );
};

type SectionItem =
  SoundCloudSections["collection"][number]["items"]["collection"][number];

const SectionItems = ({ items }: { items: SectionItem[] }) => {
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });
  return (
    <div className={style.sectionItems}>
      {items.map((item) => (
        <div className={style.sectionItem} key={item.id}>
          <PrefetchLink
            className={style.sectionItemImage}
            style={
              item.kind === "user"
                ? { borderRadius: "50%" }
                : item.set_type === "album"
                ? undefined
                : undefined
            }
            href={
              item.kind === "user"
                ? `/artist/${item.permalink}/${item.id}`
                : item.set_type === "album"
                ? `/album/${item.permalink}/${item.id}`
                : `/playlist/${item.id}`
            }
          >
            <Image
              fill
              alt={item.title || "Image"}
              src={
                item.kind === "user"
                  ? item.avatar_url_hd || PLACEHOLDER_IMAGE
                  : item.artwork_url_hd || PLACEHOLDER_IMAGE
              }
            />
          </PrefetchLink>
          <div className={style.sectionItemSubtitle}>
            <span>
              <PrefetchLink
                className="hover:underline decoration-[--keyColor]"
                href={
                  item.set_type === "album"
                    ? `/album/${item.permalink}/${item.id}`
                    : `/playlist/${item.id}`
                }
              >
                {item.kind === "user" ? (
                  <h3 className="w-fit">{item.username}</h3>
                ) : (
                  <h3 className="w-fit">{item.title}</h3>
                )}
              </PrefetchLink>
            </span>
            {item.kind === "user" ? (
              <p className="w-fit">
                {formatter.format(item.followers_count) + " followers"}
              </p>
            ) : (
              <PrefetchLink
                className="hover:underline decoration-[--keyColor]"
                href={`/artist/${item.user?.permalink}/${item.user?.id}`}
              >
                <p className="w-fit">{item.user?.username}</p>
              </PrefetchLink>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
