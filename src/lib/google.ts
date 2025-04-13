"use server";

import { Client } from "@googlemaps/google-maps-services-js";

import { env } from "~/env";

const client = new Client();
export const autocomplete = async (input: string) => {
  if (!input) return [];

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: env.GOOGLE_MAPS_API_KEY,
        components: ["country:us"],
      },
    });

    return response.data.predictions;
  } catch (error) {
    console.error(error);
  }
};

export const getLatLng = async (placeId: string) => {
  const response = await client.geocode({
    params: {
      place_id: placeId,
      key: env.GOOGLE_MAPS_API_KEY,
    },
  });

  return response.data.results;
};
