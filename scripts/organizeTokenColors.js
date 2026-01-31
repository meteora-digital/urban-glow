function organizeTokenColors(tokenColors) {
  // Step 1: Split entries with multiple settings into separate entries
  const splitSettings = [];

  tokenColors.forEach(entry => {
    const { scope, settings } = entry;
    const settingKeys = Object.keys(settings);

    // If entry has multiple settings, split them
    if (settingKeys.length > 1) {
      settingKeys.forEach(key => {
        splitSettings.push({
          scope: [...scope],
          settings: { [key]: settings[key] }
        });
      });
    } else {
      // Single setting, keep as is
      splitSettings.push({
        scope: [...scope],
        settings: { ...settings }
      });
    }
  });

  // Step 2: Group entries with identical settings
  const settingsMap = new Map();

  splitSettings.forEach(entry => {
    // Create a key based on the settings object
    const settingsKey = JSON.stringify(entry.settings);

    if (settingsMap.has(settingsKey)) {
      // Merge scopes with existing entry
      const existing = settingsMap.get(settingsKey);
      existing.scope = [...existing.scope, ...entry.scope];
    } else {
      // New settings group
      settingsMap.set(settingsKey, {
        scope: [...entry.scope],
        settings: { ...entry.settings }
      });
    }
  });

  // Step 3: Remove duplicate scopes within each group and sort
  const result = Array.from(settingsMap.values()).map(entry => ({
    scope: [...new Set(entry.scope)].sort(),
    settings: entry.settings
  }));

  // Step 4: Sort by setting type (foreground first, then fontStyle, etc.)
  const settingTypeOrder = ['foreground', 'fontStyle', 'fontWeight'];

  return result.sort((a, b) => {
    const aType = Object.keys(a.settings)[0];
    const bType = Object.keys(b.settings)[0];

    const aIndex = settingTypeOrder.indexOf(aType);
    const bIndex = settingTypeOrder.indexOf(bType);

    // If both are in the order array, sort by position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If one is in order array and one isn't
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // If neither is in order array, sort alphabetically
    return aType.localeCompare(bType);
  });
}
