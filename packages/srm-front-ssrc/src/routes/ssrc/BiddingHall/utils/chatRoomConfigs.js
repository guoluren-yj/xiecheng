// chat room common params
const getChatRoomConfigs = (header) => {
  if (!header) {
    return {};
  }

  const { openRule, biddingAnonymousQuotesFlag } = header || {};

  let supNameHideForSup = 0;
  const supNameHideForPurch = biddingAnonymousQuotesFlag === 1 ? 0 : 1;

  if (openRule === 'HIDE_IDENTITY_HIDE_QUOTE' || openRule === 'HIDE_IDENTITY_OPEN_QUOTE') {
    supNameHideForSup = 0;
  }
  if (openRule === 'OPEN_IDENTITY_HIDE_QUOTE' || openRule === 'OPEN_IDENTITY_OPEN_QUOTE') {
    supNameHideForSup = 1;
  }

  return {
    supNameHideForSup,
    supMsgHideForSup: 0,
    supNameHideForPurch,
    purchUserNameHideForSup: 1,
    supUserNameHideForPurch: 0,
    supUserNameHideForSup: 0,
  };
};

export { getChatRoomConfigs };
