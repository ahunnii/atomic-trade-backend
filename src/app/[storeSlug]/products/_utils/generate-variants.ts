import type { ProductFormData } from "~/lib/validators/product";

type Attribute = {
  id: string;
  name: string;
  values: string[];
};

export function generateVariants(
  attributes: Attribute[],
  existingVariants: ProductFormData["variants"] = [],
): ProductFormData["variants"] {
  // If no attributes, return the existing variants
  if (attributes.length === 0) {
    return existingVariants;
  }

  // Get the first variant's properties to use as a template
  const firstVariant = existingVariants[0] ?? {
    priceInCents: 0,
    stock: 0,
    manageStock: false,
    imageUrl: "",
    sku: "",
  };

  // Generate all possible combinations of attribute values
  const combinations: string[][] = [];
  const generateCombinations = (current: string[], index: number) => {
    if (index === attributes.length) {
      combinations.push([...current]);
      return;
    }

    const currentAttribute = attributes[index];
    if (currentAttribute?.values) {
      for (const value of currentAttribute.values) {
        current[index] = value;
        generateCombinations(current, index + 1);
      }
    }
  };

  // Initialize array with empty strings
  const initialArray = Array.from({ length: attributes.length }, () => "");
  generateCombinations(initialArray, 0);

  // Create variants from combinations
  const variants = combinations.map((values) => {
    // Create the variant name by joining attribute values with " * "
    const name = values.join(" * ");

    // Generate a unique SKU based on the combination
    const sku = firstVariant.sku
      ? values.map((v) => v.toLowerCase().replace(/\s+/g, "-")).join("-") +
        "-" +
        Math.random().toString(36).substring(2, 7)
      : null;

    return {
      ...firstVariant,
      id: crypto.randomUUID(),
      name,
      values,
      sku: sku ? `${"AT"}-${sku}` : "",
      manageStock: firstVariant.manageStock,
    };
  });
  console.log(variants);
  return variants;
}
