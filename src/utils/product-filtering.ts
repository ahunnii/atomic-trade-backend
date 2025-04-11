import type { Product } from "~/types/product";

export function extractQueryString(query: string) {
  // Split the query string into individual key-value pairs
  const pairs = query.split("&");

  // Extract the names and values into separate arrays
  const names: string[] | undefined = [];
  const values: string[][] | undefined = [];

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    // Extract the name from the key (assuming it always ends with 'Variant')
    const name = key?.replace("Variant", "");
    names?.push(name!.charAt(0).toUpperCase() + name!.slice(1)); // Capitalize the first letter

    values.push(decodeURIComponent(value!).split(","));
  });

  // Join the names and values with ' | ' and return
  return {
    names,
    values,
  };
}

export function parseQueryString(query: string): Record<string, unknown> {
  const params = new URLSearchParams(query);
  const result: Record<string, unknown> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as unknown[]).push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = [value];
    }
  });

  return result;
}

export function filterProductsByVariants(
  products: Product[],
  targetNames: string[],
  targetValues: string[][],
) {
  return products.filter((product) => {
    // Check if every target name and value is present in the product's variants
    return targetNames.every((name, index) => {
      // Find a variant in the product that matches the name and contains all target values
      return product.variants.some(
        (variant) =>
          variant.name.includes(name) &&
          targetValues[index]!.some((value) => variant.values.includes(value)),
      );
    });
  });
}

export function filterProductsByVariantsAlt(
  products: Product[],
  targetNames: string[],
  targetValues: string[][],
) {
  const filtered = products.filter((product) => {
    // Check if every target name and value is present in the product's variants
    return targetNames.some((name, index) => {
      if (
        name.toLowerCase() === "range" ||
        name.toLowerCase() === "sort" ||
        name.toLowerCase() === "collection" ||
        name.toLowerCase() === "q"
      ) {
        return true;
      }

      // Find a variant in the product that matches the name and contains all target values
      return product.variants.some(
        (variant) =>
          variant.name.includes(name) &&
          targetValues[index]!.some((value) => variant.values.includes(value)),
      );
    });
  });

  const lowerCaseNames = targetNames.map((name) => name.toLowerCase());

  if (!lowerCaseNames.includes("sort")) return filtered;

  const sortIndex = lowerCaseNames.indexOf("sort");
  const sortValue = targetValues[sortIndex];

  if (sortValue?.[0] === "price-desc" || sortValue?.[0]?.includes("desc")) {
    // Sort each product by checking the price of the most expensive variant
    return filtered.sort((a, b) => {
      const aPrice = Math.max(
        ...a.variants.map((variant) => variant.priceInCents),
      );
      const bPrice = Math.max(
        ...b.variants.map((variant) => variant.priceInCents),
      );

      return bPrice - aPrice;
    });
  }
  if (sortValue?.[0] === "price-asc" || sortValue?.[0]?.includes("asc")) {
    // Sort each product by checking the price of the most expensive variant
    return filtered.sort((a, b) => {
      const aPrice = Math.min(
        ...a.variants.map((variant) => variant.priceInCents),
      );
      const bPrice = Math.min(
        ...b.variants.map((variant) => variant.priceInCents),
      );

      return aPrice - bPrice;
    });
  }

  return filtered;
}
