import { init } from "@paralleldrive/cuid2";

const createId = init({
  random: Math.random,
  length: 7,
});

export const generateOrderNumber = (
  numberOfOrders: number,
  storeSlug: string,
) => {
  // Extract store identifier parts from the slug
  const slugParts = storeSlug.split("-");
  const firstPart = slugParts[0] ?? "";
  const secondPart = slugParts[1] ?? "";

  // Create a prefix from the first letters of the store slug parts
  const prefix =
    (firstPart ? firstPart.charAt(0).toUpperCase() : "A") +
    (secondPart ? secondPart.charAt(0).toUpperCase() : "T");

  // Get current date components for the order number
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are 0-indexed

  // Format the sequential order number with padding
  const sequentialNumber = (numberOfOrders + 1).toString().padStart(3, "0");

  // Combine all parts into the final order number format
  return `${prefix}-${year}${month}-1${sequentialNumber}`;
};

export const generateDraftOrderNumber = (numberOfOrders: number) => {
  // Get current date components for the order number
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are 0-indexed

  // Format the sequential order number with padding
  const sequentialNumber = (numberOfOrders + 1).toString().padStart(3, "0");

  // Combine all parts into the final order number format
  return `DRAFT-${year}${month}-${sequentialNumber}`;
};

export const generateOrderAuthNumber = () => {
  //Unique ish number to access the order when not logged in
  return `${createId().toUpperCase()}`;
};
