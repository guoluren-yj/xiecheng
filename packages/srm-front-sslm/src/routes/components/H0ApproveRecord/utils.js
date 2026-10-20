/*
 * @Date: 2022-07-02 15:09:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
export const getInterfaceName = (params) => {
  const { documentType, documentId } = params;
  let interfaceName = '';
  switch (documentType) {
    case 'SITE_EVAL': // 现场考察
      interfaceName = `site-eval-opr-historys/${documentId}`;
      break;
    default:
      break;
  }
  return interfaceName;
};
