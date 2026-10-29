// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeAddonAssetPath,
  resolveAddonAssetPath,
  SandboxAddonAssetRegistry,
} from "./addon-sandbox-asset-registry";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sandbox addon asset registry", () => {
  it("normalizes package paths without permitting traversal", () => {
    expect(normalizeAddonAssetPath("/dist/./assets/../assets/brand-mark.svg")).toBe(
      "dist/assets/brand-mark.svg",
    );
    expect(resolveAddonAssetPath("../assets/brand-mark.svg", "dist/styles/addon.css")).toBe(
      "dist/assets/brand-mark.svg",
    );
    expect(() => normalizeAddonAssetPath("../../outside.png")).toThrow("escapes the package root");
  });

  it("loads once, returns a typed Blob, and reuses one object URL", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const requestBlob = vi.fn().mockResolvedValue(new Blob([bytes]));
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:addon-logo");
    const registry = new SandboxAddonAssetRegistry(
      [
        {
          id: "asset-id",
          mimeType: "image/png",
          path: "assets/brand-mark.svg",
          size: bytes.byteLength,
        },
      ],
      requestBlob,
    );

    const [firstBlob, secondBlob, firstUrl, secondUrl] = await Promise.all([
      registry.getBlob("/assets/brand-mark.svg"),
      registry.getBlob("assets/brand-mark.svg"),
      registry.getUrl("assets/brand-mark.svg"),
      registry.getUrl("assets/brand-mark.svg"),
    ]);

    expect(firstBlob).toBe(secondBlob);
    expect(firstBlob.type).toBe("image/png");
    expect(firstUrl).toBe("blob:addon-logo");
    expect(secondUrl).toBe(firstUrl);
    expect(requestBlob).toHaveBeenCalledTimes(1);
    expect(requestBlob).toHaveBeenCalledWith("asset-id");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(registry.has("assets/brand-mark.svg")).toBe(true);
    expect(registry.list()).toEqual([expect.objectContaining({ path: "assets/brand-mark.svg" })]);
    expect(registry.list()[0]).not.toHaveProperty("id");
  });

  it("revokes object URLs on clear", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:addon-logo");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const registry = new SandboxAddonAssetRegistry(
      [{ id: "asset-id", mimeType: "image/png", path: "assets/brand-mark.svg", size: 1 }],
      vi.fn().mockResolvedValue(new Blob([new Uint8Array([1])], { type: "image/png" })),
    );

    await registry.getUrl("assets/brand-mark.svg");
    registry.clear();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:addon-logo");
  });

  it("rejects duplicate normalized paths", () => {
    expect(
      () =>
        new SandboxAddonAssetRegistry(
          [
            { id: "first", mimeType: "image/png", path: "/assets/brand-mark.svg", size: 1 },
            { id: "second", mimeType: "image/png", path: "assets/brand-mark.svg", size: 1 },
          ],
          vi.fn(),
        ),
    ).toThrow("Duplicate packaged addon asset path 'assets/brand-mark.svg'");
  });

  it("does not create an object URL when cleared during a pending load", async () => {
    let resolveBlob!: (blob: Blob) => void;
    const requestBlob = vi.fn(
      () =>
        new Promise<Blob>((resolve) => {
          resolveBlob = resolve;
        }),
    );
    const createObjectURL = vi.spyOn(URL, "createObjectURL");
    const registry = new SandboxAddonAssetRegistry(
      [{ id: "asset-id", mimeType: "image/png", path: "assets/brand-mark.svg", size: 1 }],
      requestBlob,
    );

    const loading = registry.getUrl("assets/brand-mark.svg");
    registry.clear();
    resolveBlob(new Blob([new Uint8Array([1])], { type: "image/png" }));

    await expect(loading).rejects.toThrow("registry was cleared while loading");
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("retries after a failed asset load", async () => {
    const requestBlob = vi
      .fn()
      .mockResolvedValueOnce(new Blob([new Uint8Array([1, 2])], { type: "image/png" }))
      .mockResolvedValueOnce(new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }));
    const registry = new SandboxAddonAssetRegistry(
      [{ id: "asset-id", mimeType: "image/png", path: "assets/brand-mark.svg", size: 3 }],
      requestBlob,
    );

    await expect(registry.getBlob("assets/brand-mark.svg")).rejects.toThrow("changed while loading");
    await expect(registry.getBlob("assets/brand-mark.svg")).resolves.toMatchObject({ size: 3 });
    expect(requestBlob).toHaveBeenCalledTimes(2);
  });
});
