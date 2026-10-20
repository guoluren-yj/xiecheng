import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';

import { calculationRender } from '@/utils/renderer';
import { SRM_SPC } from '_utils/config';
import { getPriceEditField } from '../util';

const organizationId = getCurrentOrganizationId();

const renderAccuracy = (record, field) => {
  let accuracy; // 精度
  if (record.getField(field).get('step')) {
    accuracy = Math.log10(record.getField(field).get('step')) * -1;
  } else if (record.getField(field).get('step') === 0) {
    accuracy = 0;
  }
  return record.getState('precision') || accuracy;
};

const basicFormDS = (param) => ({
  primaryKey: 'requestId',
  // autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'requestNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestNum').d('申请单号'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.application`).d('申请人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.creationDate`).d('创建日期'),
    },
    {
      name: 'requestStatus',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.status`).d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_REQUEST_STATUS',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.updateRemark').d('更新说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.attachmentUuid').d('附件'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-reqs/detail`,
        method: 'GET',
        data: {
          ...param,
          customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_REJECT_DETAIL',
        },
      };
    },
  },
});

const TableDS = ({ templateCode }) => ({
  primaryKey: 'priceLibId',
  // autoQuery: true,
  // table表单显示的字段
  fields: [],
  events: {
    update: ({ name, value, record, dataSet }) => {
      // 更新值集映射关系
      if (name.includes('LOV') && value) {
        const dimensionCode = name.split('LOV')[0];
        const priceLibDimMapList = record.getField(`${dimensionCode}MapList`).get('defaultValue');
        // 更新值集映射关系
        if (!isEmpty(priceLibDimMapList) && record.get(name)) {
          priceLibDimMapList.forEach((item) => {
            // 存在targetDimensionCode，目标维度编码
            if (item.targetDimensionCode) {
              // lov对象中的字段赋值到targetDimensionCode
              record.set(item.targetDimensionCode, record.get(name)[item.sourceFromFieldName]);
            }
          });
        }
      } else if (name.includes('LOV') && !value) {
        const dimensionCode = name.split('LOV')[0];
        const priceLibDimMapList = record.getField(`${dimensionCode}MapList`).get('defaultValue');
        if (!isEmpty(priceLibDimMapList)) {
          priceLibDimMapList.forEach((item) => {
            // 存在targetDimensionCode，目标维度编码
            if (item.targetDimensionCode) {
              record.set(item.targetDimensionCode, undefined);
            }
          });
        }
      }

      // 当基准价为含税单价时,输入含税单价时，根据税率实时计算未税单价,若税率为空或没有税率维度，则当作税率为零计算, 未税=含税 /（1+税率）
      // 当基准价为未税单价时,当输入未税单价时，根据税率实时计算含税单价，若税率为空或没有税率维度，则当作税率为零计算, 含税 = 未税 * (1 + 税)
      const ruleDefinition = dataSet.getState('ruleDefinition');
      const editField = getPriceEditField(record, ruleDefinition, {
        templateCode,
      });

      console.log('templateCode', templateCode);
      const taxIncludedPriceEdit = editField === 'TAX_INCLUDED_PRICE';
      const netPriceEdit = editField === 'NET_PRICE';

      if (name === 'taxIncludedPrice') {
        if (taxIncludedPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag')
            ? 0
            : record.get('taxRate')
            ? math.div(record.get('taxRate'), 100)
            : 0;
          record.set(
            'netPrice',
            calculationRender(value, math.plus(1, taxRate), '/', renderAccuracy(record, 'netPrice'))
          );
        }
      } else if (name === 'netPrice') {
        if (netPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag')
            ? 0
            : record.get('taxRate')
            ? math.div(record.get('taxRate'), 100)
            : 0;
          record.set(
            'taxIncludedPrice',
            calculationRender(
              value,
              math.plus(1, taxRate),
              '*',
              renderAccuracy(record, 'taxIncludedPrice')
            )
          );
        }
      } else if (name === 'taxRate') {
        if (taxIncludedPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag') ? 0 : value ? math.div(value, 100) : 0;
          if (record.get('taxIncludedPrice') || record.get('taxIncludedPrice') === 0) {
            record.set(
              'netPrice',
              calculationRender(
                record.get('taxIncludedPrice'),
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'netPrice')
              )
            );
          }
        } else if (netPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag') ? 0 : value ? math.div(value, 100) : 0;
          if (record.get('netPrice') || record.get('netPrice') === 0) {
            record.set(
              'taxIncludedPrice',
              calculationRender(
                record.get('netPrice'),
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'taxIncludedPrice')
              )
            );
          }
        }
      } else if (name === 'taxIncludedFlag') {
        // 修改含税标识，重新计算金额
        if (!value) {
          // 修改是否含税标识为否时清空税率
          record.set('taxIdLOV', undefined);
        } else if (taxIncludedPriceEdit) {
          const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
          if (record.get('taxIncludedPrice') || record.get('taxIncludedPrice') === 0) {
            record.set(
              'netPrice',
              calculationRender(
                record.get('taxIncludedPrice'),
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'netPrice')
              )
            );
          }
        } else if (netPriceEdit) {
          const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
          if (record.get('netPrice') || record.get('netPrice') === 0) {
            record.set(
              'taxIncludedPrice',
              calculationRender(
                record.get('netPrice'),
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'taxIncludedPrice')
              )
            );
          }
        }
      } else if (name === 'taxIncludedFlag' && !value) {
        // 修改是否含税标识为否时清空税率
        record.set('taxIdLOV', undefined);
      }
    },
  },
  transport: {
    // read: ({ data }) => {
    //   const { routerParams = {}, ...otherParams } = data;
    //   return {
    //     url: `${SRM_SPC}/v1/${organizationId}/price-lib-mains`,
    //     method: 'GET',
    //     data: {
    //       ...params,
    //       ...routerParams,
    //       ...otherParams,
    //       from: 'APPROVE_REJECT',
    //     },
    //   };
    // },
    submit: ({ data, dataSet }) => {
      const {
        queryParameter: { priceLibId },
      } = dataSet;
      const priceLibMainMapList = data.map((item) => {
        const { __id, _status, ...other } = item;
        return { ...other, priceLibId };
      });
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-reqs`,
        method: 'POST',
        data: { priceLibMainMapList },
      };
    },
  },
  // eslint-disable-next-line no-dupe-keys
  // events: {
  //   submitSuccess: ({ dataSet }) => {
  //     dataSet.query();
  //   },
  // },
});

const relevantQueryFormDS = () => ({
  // 查询表单显示的字段
  fields: [],
});

const historyTableDS = () => ({
  // autoQuery: true,
  selection: false,
  primaryKey: 'id',
  fields: [
    {
      name: 'endTime',
      type: 'dateTime',
      label: intl.get('ssrc.priceLibraryNew.model.library.approvalTime').d('审批时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approvalAction').d('审批动作'),
    },
    {
      name: 'name',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approvalStep').d('审批环节'),
    },
    {
      name: 'assigneeName',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approvalOwner').d('审批人'),
    },
    {
      name: 'comment',
      type: 'string',
      label: intl
        .get('ssrc.priceLibraryNew.model.library.approvalOpinion', { title: '审批意见' })
        .d('审批意见'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approvalFile').d('附件'),
    },
  ],
});

export { basicFormDS, TableDS, historyTableDS, relevantQueryFormDS };
