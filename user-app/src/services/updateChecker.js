const CURRENT_VERSION_CODE = 2;

const UPDATE_MANIFEST_URL =
  "https://raw.githubusercontent.com/shettyprathams/Project-Atlas/main/update.json";

export async function checkForUpdate() {
  try {
    const response = await fetch(
      `${UPDATE_MANIFEST_URL}?t=${Date.now()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const update = await response.json();

    if (!update.versionCode || !update.apkUrl) {
      return null;
    }

    if (Number(update.versionCode) <= CURRENT_VERSION_CODE) {
      return null;
    }

    return update;
  } catch (error) {
    console.error("Atlas update check failed:", error);
    return null;
  }
}