import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { isEmpty } from 'lodash';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const FormulaLadderDS = (formulaId, assignItemBomDS, isAssign) => ({
  primaryKey: 'ladderId',
  paging: false,
  autoQueryAfterSubmit: false,
  forceValidate: true,
  fields: [
    {
      name: 'formulaId',
      defaultValue: formulaId,
    },
    {
      name: 'ladderName',
      type: FieldType.intl,
      label: intl.get(`spc.formulaManage.model.ladderName`).d('公式阶梯名称'),
      required: true,
    },
    {
      name: 'bomViewId',
      type: 'object',
      multiple: true,
      label: intl.get(`spc.formulaManage.model.bomViewId`).d('物料BOM名称'),
      lovCode: 'SSRC.PRICE_FORMULA_BOM_VIEW',
      textField: 'bomViewNameEnCode',
      lovQueryAxiosConfig: (code, config, { data, params }) => {
        return {
          url: `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-formula-bom-rels/list`,
          method: 'POST',
          data: {
            ...data,
            ...params,
          },
          transformResponse: (res) => {
            const result = JSON.parse(res);
            if (result && !result.failed) {
              const { content } = result;
              return {
                ...result,
                content: content.map((item) => ({ ...item, bomViewNameEnCode: item?.bomViewName })),
              };
            }
          },
        };
      },
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const flag = record.status !== 'add' && !dataSet.getState('hiddenBom'); // 新增时不必输
          return flag;
        },
        lovPara: ({ dataSet }) => {
          const filterBomViewIdList = [];
          dataSet.forEach((record) => {
            const bomViewId = record.get('bomViewId');
            filterBomViewIdList.push(...bomViewId.map((item) => item.bomViewId));
          });

          const shieldLineIdList = [];
          const tempBomViewIdList = [];
          // 分配模式下实时过滤分配物料BOM表数据
          if (isAssign) {
            const deleteLines = assignItemBomDS.getState('deleteLines') || [];
            const updateData = assignItemBomDS.toJSONData() || [];
            deleteLines.forEach((line) => {
              filterBomViewIdList.push(line.get('bomViewId')?.bomViewId);
            });
            updateData.forEach((line) => {
              const { relId, bomViewId } = line;
              if (!filterBomViewIdList.includes(bomViewId)) {
                tempBomViewIdList.push(bomViewId);
              }
              shieldLineIdList.push(relId);
            });
          }

          return {
            formulaId,
            filterBomViewIdList,
            tempBomViewIdList,
            shieldLineIdList,
          };
        },
      },
      transformResponse: (value, record) => {
        const { bomViewId, bomViewName, bomViewCode, bomViewNameEnCode } = record;
        const bomViewIdList = bomViewId?.split(',') || [];
        const bomViewNameList = bomViewName?.split(',') || [];
        const bomViewCodeList = bomViewCode?.split(',') || [];
        const bomViewNameEnCodeList = bomViewNameEnCode?.split(',') || [];
        return value
          ? bomViewIdList.map((item, index) => ({
              bomViewId: item,
              bomViewName: bomViewNameList[index],
              bomViewNameEnCode: decodeURIComponent(bomViewNameEnCodeList[index]),
              bomViewCode: bomViewCodeList[index],
            }))
          : null;
      },
      transformRequest: (value) => {
        if (isEmpty(value)) {
          return null;
        }
        return (
          value &&
          value
            .map((item) => item.bomViewId)
            .filter(Boolean)
            .join(',')
        );
      },
    },
    {
      name: 'bomViewNameEnCode',
      bind: 'bomViewId.bomViewNameEnCode',
      multiple: '`', // 不要用逗号分隔，bomViewName中可能包含逗号
      transformResponse: (value, record) => {
        const { bomViewNameEnCode } = record;
        const bomViewNameEnCodeList = bomViewNameEnCode?.split(',') || [];
        return bomViewNameEnCodeList.map((item) => decodeURIComponent(item)).join('`');
      },
    },
    {
      name: 'bomViewCode',
      bind: 'bomViewId.bomViewCode',
      multiple: ',',
    },
  ],
  queryParameter: {
    formulaId,
  },
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-ladders/list`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      const newData =
        data &&
        data.map((i) => {
          const { needDeleteFlag } = i;
          let { _status } = i;
          if (needDeleteFlag) {
            _status = 'delete';
          }
          return {
            ...i,
            _status,
          };
        });
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-ladders`,
        method: 'POST',
        data: newData,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-ladders`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const LadderDetailDS = (ladderId) => ({
  primaryKey: 'ladderLineId',
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'ladderId',
      defaultValue: ladderId,
    },
    {
      name: 'ladderFrom',
      type: 'number',
      max: 'ladderTo',
      label: intl.get(`spc.formulaManage.model.ladderFrom`).d('数量从（=）'),
      required: true,
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 'ladderFrom',
      label: intl.get(`spc.formulaManage.model.ladderTo`).d('数量至（<）'),
      dynamicProps: {
        // 最后一条数据不必输，默认无穷
        required: ({ record, dataSet }) => record.index !== dataSet.length - 1,
      },
    },
    {
      name: 'ladderFormula',
      type: 'string',
      label: intl.get(`spc.formulaManage.model.ladderFormula`).d('阶梯公式'),
    },
    {
      name: 'operationalFormula',
      type: 'string',
    },
    {
      name: 'operationalFormulaName',
      type: 'string',
      label: intl.get('spc.formulaManage.view.title.calcFormula').d('计算公式'),
      // required: true,
    },
  ],
  queryParameter: {
    ladderId,
  },
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-ladder-lines/list`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formula-ladder-lines`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const PreFormulaLadderDS = () => ({
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-formulas/valid-expression`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

const addAllStageDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'includeAllFlag',
      type: 'boolean',
      label: intl.get(`spc.formulaManage.model.addAll`).d('加入全部'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
});

export { FormulaLadderDS, LadderDetailDS, PreFormulaLadderDS, addAllStageDS };
