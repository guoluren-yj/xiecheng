import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getFields = () => {
  return [
    {
      name: 'statusCode',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'strategyCode',
      label: intl.get('sagm.saleAgreement.view.priceStrategyCode').d('价格策略编码'),
    },
    {
      name: 'strategyName',
      label: intl.get('sagm.saleAgreement.view.priceStrategyName').d('价格策略名称'),
    },
    {
      name: 'priority',
      type: 'number',
      label: intl.get('sagm.common.view.priority').d('优先级'),
    },
    {
      name: 'adjustDetailsMeaning',
      label: intl.get('sagm.common.view.adjustDirection').d('调价方向'),
    },
    {
      name: 'overlinePriceEnableMeaning',
      label: intl.get('sagm.common.model.overlinePriceEnable').d('可超过划线价'),
    },
    {
      name: 'versionNum',
      label: intl.get('sagm.common.model.versionNum1').d('版本号'),
    },
    {
      name: 'strategyDimension',
      label: intl.get('sagm.common.view.strategyDimension').d('策略维度'),
    },
    {
      name: 'remark',
      label: intl.get('sagm.common.view.remark').d('备注'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'realName',
      label: intl.get('sagm.common.model.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sagm.common.model.creationTime').d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sagm.common.model.lastUpdateDate').d('最后更新时间'),
    },
  ];
};

const setPriorities = (dataSet) => {
  const priorities = [];
  dataSet.forEach((f) => {
    priorities.push(f.get('priority'));
  });
  dataSet.setState('priorities', priorities);
};

export default function getStrategyDs() {
  return {
    autoQuery: false,
    paging: false,
    pageSize: 20,
    fields: getFields(),
    primaryKey: 'priceStrategyLineId',
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((f) => {
          if (!['NEW', 'RESTORED', 'EXEFAIL'].includes(f.get('statusCode'))) {
            Object.assign(f, { selectable: false });
          }
        });
        setPriorities(dataSet);
      },
      create({ dataSet, record }) {
        Object.assign(record, { selectable: false });
        setPriorities(dataSet);
      },
      remove({ dataSet }) {
        setPriorities(dataSet);
      },
    },
    transport: {
      read: {
        url: `/sagm/v1/${organizationId}/sale-price-strategy-lines`,
        method: 'GET',
      },
      destroy: () => ({
        url: `/sagm/v1/${organizationId}/sale-price-strategy-lines`,
        method: 'DELETE',
      }),
    },
  };
}

export function getStrategyListDs() {
  return {
    pageSize: 20,
    autoQuery: false,
    fields: getFields(),
    primaryKey: 'priceStrategyId',
    cacheSelection: true,
    transport: {
      read: {
        url: `/sagm/v1/${organizationId}/price-strategys`,
        method: 'GET',
      },
    },
    events: {
      load: ({ dataSet }) => {
        const priceStrategyId = dataSet.getState('priceStrategyId', priceStrategyId);
        if (priceStrategyId) {
          const fIndex = dataSet.records.findIndex(
            (f) => f.get('priceStrategyId') === priceStrategyId
          );
          if (fIndex > -1) {
            dataSet.select(fIndex);
            dataSet.setState('priceStrategyId', null);
          }
        }
      },
    },
  };
}
