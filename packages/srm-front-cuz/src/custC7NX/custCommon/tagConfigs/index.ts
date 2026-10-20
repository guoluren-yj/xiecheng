export default function getTagConfig(tagName?: string): PromiseLike<any> {
  switch(tagName) {
    case "AF-BASIC": return import("./afBasic");
    case "AF-EXTRA": return import("./afExtra");
    default: return Promise.resolve();
  }
}