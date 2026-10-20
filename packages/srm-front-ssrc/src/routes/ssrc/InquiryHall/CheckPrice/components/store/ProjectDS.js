import intl from 'utils/intl';

const projectDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'projectNum',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.projectDecode`).d('项目编码'),
    },
    {
      name: 'projectName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectsName`).d('项目名称'),
    },
    {
      name: 'whetherRule',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherRule`).d('是否按规则'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'whetherOverBudget',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherOverBudget`).d('是否超预算'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'PricingInstructions',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.PricingInstructions`).d('定价说明'),
    },
  ],
});

export { projectDS };
