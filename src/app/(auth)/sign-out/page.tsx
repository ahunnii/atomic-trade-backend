import { signOut } from "~/server/auth";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function SignOutPage() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign Out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out of Atomic Trade?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form
              action={async () => {
                "use server";
                try {
                  await signOut({
                    redirectTo: "/",
                  });
                } catch (error) {
                  throw error;
                }
              }}
            >
              <Button
                type="submit"
                variant="default"
                className="flex w-full items-center justify-center gap-2"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
