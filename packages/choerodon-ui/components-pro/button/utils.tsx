const lowerCase = [
  "aboard",
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "amid",
  "among",
  "and",
  "anti",
  "around",
  "as",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "besides",
  "between",
  "beyond",
  "but",
  "by",
  "concerning",
  "considering",
  "despite",
  "down",
  "during",
  "except",
  "excepting",
  "excluding",
  "following",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "like",
  "minus",
  "near",
  "of",
  "off",
  "on",
  "onto",
  "opposite",
  "over",
  "past",
  "per",
  "plus",
  "regarding",
  "round",
  "save",
  "since",
  "than",
  "through",
  "to",
  "toward",
  "towards",
  "under",
  "underneath",
  "unlike",
  "until",
  "up",
  "upon",
  "versus",
  "via",
  "with",
  "within",
  "without",
  "throughout",
  "outside",
  "respecting",
  "including",
];

const word = "[^\\s'’\\(\\)!?;:\"-]";
const regex = new RegExp(`(?:(?:(\\s?(?:^|[.\\(\\)!?;:"-])\\s*)(${word}))|(${word}))(${word}*[’']*${word}*)`, "g");

function parseMatch(match) {
  const firstCharacter = match[0];

  // test first character
  if (/\s/.test(firstCharacter)) {
    // if whitespace - trim and return
    return match.slice(1);
  }

  return match;
}

const textConvert = (text: string) => {
  return text.replace(regex, (m, lead = '', forced, lower, rest, offset, string) => {
    const isLastWord = m.length + offset >= string.length;
    const parsedMatch = parseMatch(m);
    if (!parsedMatch) {
      return m;
    }
    if (!forced) {
      const fullLower = lower + rest;

      if (lowerCase.includes(fullLower) && !isLastWord) {
        return parsedMatch;
      }
    }
    return lead + (lower || forced).toUpperCase() + rest;
  });
}

export default textConvert;