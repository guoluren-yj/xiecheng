export default function getGlobalRegistry(win) {
  if (win) {
    if (!win.__SLARDAR_REGISTRY__) {
      win.__SLARDAR_REGISTRY__ = {
        Slardar: {
          plugins: [],
          errors: [],
          subject: {},
        },
      };
    }
    return win.__SLARDAR_REGISTRY__.Slardar;
  }
}
