/*
 * @Descripttion: 申请转RF--DS
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-08-06 11:13:57
 * @LastEditors: yiping.liu
 */
import intl from 'utils/intl';

const RFApplyDS = () => ({
  autoQuery: true,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationNum`).d('申请编号'),
      type: 'string',
    },
    {
      name: 'displayLineNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
      type: 'string',
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      name: 'categoryName',
      label: intl.get(`ssrc.common.goodsSorts`).d('物品类别'),
      type: 'string',
    },
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
      type: 'string',
    },
    {
      name: 'ouName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
      type: 'string',
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
      type: 'string',
    },
    {
      name: 'unitName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      type: 'string',
    },
    {
      name: 'prRequestedName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
      type: 'string',
    },
    {
      name: 'quantity',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantities`).d('数量'),
      type: 'string',
    },
  ],
});

export { RFApplyDS };
