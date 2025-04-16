import * as React from "react";
import { SingleColumn } from "responsive-react-email";

import { Text } from "@react-email/components";

type Props = {
  name: string;
};

export const EmailSignature = (props: Props) => (
  <SingleColumn pX={25}>
    <Text>
      Best regards, <br />
      <strong>{props.name}</strong>
    </Text>
  </SingleColumn>
);
