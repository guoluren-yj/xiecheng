const ssrcDirectionSymbolDefaultTab = () => {
  // 询价工作台跳转记录标识, srm-78889需求
  // window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate' | 'inquiryHallNewDetail';
  const SSRCSYMBOL = 'inquiryHallNewUpdate,inquiryHallNewDetail';
  let ssrcInquiryHallNewFlag = window?.ssrcDirectionToPurchasePlatformSymbol || null;
  ssrcInquiryHallNewFlag = ssrcInquiryHallNewFlag && SSRCSYMBOL.includes(ssrcInquiryHallNewFlag);
  const defaultTabKey = ssrcInquiryHallNewFlag ? 'allByWhole' : null;

  return defaultTabKey;
};

// clear ssrc direction symbol
const clearSsrcDirectionSymbol = () => {
  if (window?.ssrcDirectionToPurchasePlatformSymbol) {
    window.ssrcDirectionToPurchasePlatformSymbol = null;
  }
};

export { ssrcDirectionSymbolDefaultTab, clearSsrcDirectionSymbol };
