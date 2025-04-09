export const DataFetchErrorMessage = ({ message }: { message: string }) => {
  return (
    <p className="text-muted-foreground flex h-full flex-col py-10 text-xl leading-1 font-medium">
      {message} Please refresh and try again.
    </p>
  );
};
