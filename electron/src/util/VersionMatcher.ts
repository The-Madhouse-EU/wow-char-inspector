export default function VersionMatcher(
  oldVersion: string,
  newVersion: string,
): boolean {
  const versionRegex = /^\d+\.\d+\.\d+$/;

  // Validate both version strings
  if (!versionRegex.test(oldVersion) || !versionRegex.test(newVersion)) {
    return false;
  }

  const oldParts = oldVersion.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const oldNum = oldParts[i];
    const newNum = newParts[i];

    if (newNum > oldNum) return true;
    if (newNum < oldNum) return false;
  }

  return false; // Versions are equal
}
