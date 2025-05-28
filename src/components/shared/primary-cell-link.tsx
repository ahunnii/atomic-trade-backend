"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  image?: string;
  subheader?: string;
  link?: string;
};

export const PrimaryCellLink = ({ name, image, subheader, link }: Props) => {
  const content = (
    <>
      {image && (
        <div className="border-border relative aspect-square h-10 overflow-hidden rounded-md border shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={image ?? "/placeholder-image.webp"}
            fill
            className="rounded-md object-cover"
            alt={`Image for ${name}`}
          />
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        <span className="group-hover:text-primary text-sm font-medium transition-colors">
          {name}
        </span>
        {subheader && (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {subheader}
          </span>
        )}
      </div>
    </>
  );

  const sharedClasses = "group flex w-fit items-center gap-3 py-1";

  if (link) {
    return (
      <Link href={link} className={`${sharedClasses} hover:underline-offset-4`}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClasses}>{content}</div>;
};
