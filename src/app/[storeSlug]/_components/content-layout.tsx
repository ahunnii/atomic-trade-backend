import { Fragment } from "react";
import Link from "next/link";

import { cn } from "~/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Navbar } from "~/components/layout/navbar";
import { DataFetchErrorMessage } from "~/components/shared/data-fetch-error-message";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  currentPage?: string;
  breadcrumbClassName?: string;
  displayError?: boolean;
  displayErrorText?: string;
  displayErrorActionHref?: string;
  displayErrorActionLabel?: string;
};

export function ContentLayout({
  title,
  children,
  className,
  breadcrumbs,
  currentPage,
  breadcrumbClassName,
  displayError,
  displayErrorText,
  displayErrorActionHref,
  displayErrorActionLabel,
}: Props) {
  if (displayError) {
    return (
      <DataFetchErrorMessage
        message={
          displayErrorText ?? "An error occurred while loading the page."
        }
        actionHref={displayErrorActionHref}
        actionLabel={displayErrorActionLabel}
      />
    );
  }

  return (
    <>
      <Navbar title={title} />
      <div
        className={cn(
          "container mx-auto px-4 pt-4 pb-8 sm:px-8",
          className,
          breadcrumbs && breadcrumbs.length > 0 && "pt-8",
        )}
      >
        {!!breadcrumbs && breadcrumbs?.length > 0 && (
          <Breadcrumb className={breadcrumbClassName}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/admin/dashboard`}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  <BreadcrumbSeparator key={`sep-${index}`} />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              ))}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        {children}
      </div>
    </>
  );
}
