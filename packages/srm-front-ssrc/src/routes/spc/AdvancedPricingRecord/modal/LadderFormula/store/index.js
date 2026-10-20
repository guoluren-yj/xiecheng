import intl from 'utils/intl';

const TableDS = () => ({
  primaryKey: 'ladderLineId',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'ladderFrom',
      type: 'number',
      max: 'ladderTo',
      label: intl.get(`spc.formulaManage.model.ladderFrom`).d('数量从（=）'),
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 'ladderFrom',
      label: intl.get(`spc.formulaManage.model.ladderTo`).d('数量至（<）'),
    },
    {
      name: 'operationalFormulaName',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.ladderFormula`).d('阶梯公式'),
    },
    {
      name: 'calculatePrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.calculatePrice`).d('计算结果'),
    },
  ],
});


export { TableDS };
