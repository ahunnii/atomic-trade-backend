export type Email<EmailData> = {
  from: string;
  to: string;
  subject: string;
  data: EmailData;
  template: React.FC<EmailData>;
};
