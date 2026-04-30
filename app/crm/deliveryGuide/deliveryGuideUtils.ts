import type { DeliveryGuide, DeliveryGuideImage } from "@/app/crm/types";

export function nowIso() {
  return new Date().toISOString();
}

export function ensureGuide(base?: DeliveryGuide): DeliveryGuide {
  return (
    base ?? {
      updatedAt: nowIso(),
      images: [],
      services: {},
      pricing: {},
    }
  );
}

export function upsertGuide(base: DeliveryGuide | undefined, patch: Partial<DeliveryGuide>): DeliveryGuide {
  const prev = ensureGuide(base);
  return { ...prev, ...patch, updatedAt: nowIso() };
}

export function addImages(base: DeliveryGuide | undefined, imgs: DeliveryGuideImage[]): DeliveryGuide {
  const prev = ensureGuide(base);
  const nextImages = [...(prev.images ?? []), ...imgs].slice(0, 24);
  return { ...prev, images: nextImages, updatedAt: nowIso() };
}

export function removeImage(base: DeliveryGuide | undefined, id: string): DeliveryGuide {
  const prev = ensureGuide(base);
  return {
    ...prev,
    images: (prev.images ?? []).filter((x) => x.id !== id),
    updatedAt: nowIso(),
  };
}

