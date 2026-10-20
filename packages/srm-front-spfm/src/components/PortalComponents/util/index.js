export const replacePrefix = (prefix, link) => {
  const reg = prefix ? /\{prefix\}/g : /\{prefix\}./g;
  return link.replace(reg, prefix);
};

// 月份转化
export const monthToChinese = (month, oauthIntl) => {
  switch (month) {
    case "01":
      return oauthIntl['smbl.common.message.month.jan']||"01月";
    case "02":
      return oauthIntl['smbl.common.message.month.feb']||"02月";
    case "03":
      return oauthIntl['smbl.common.message.month.mar']||"03月";
    case "04":
      return oauthIntl['smbl.common.message.month.apr']||"04月";
    case "05":
      return oauthIntl['smbl.common.message.month.may']||"05月";
    case "06":
      return oauthIntl['smbl.common.message.month.jun']||"06月";
    case "07":
      return oauthIntl['smbl.common.message.month.jul']||"07月";
    case "08":
      return oauthIntl['smbl.common.message.month.aug']||"08月";
    case "09":
      return oauthIntl['smbl.common.message.month.sep']||"09月";
    case "10":
      return oauthIntl['smbl.common.message.month.oct']||"10月";
    case "11":
      return oauthIntl['smbl.common.message.month.nov']||"11月";
    case "12":
      return oauthIntl['smbl.common.message.month.dec']||"12月";
    default:
      break;
  }
};
