import * as React from "react";

import { Img } from "@react-email/components";

import { env } from "~/env";

export const EmailLogo = () => (
  <Img
    src={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/logo.png`}
    width="64"
    height="64"
    alt="Logo"
  />
);
