/**
 * 协议工作台-阶段Tab index
 */
import React, { useCallback } from 'react';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import StatusTag from '../components/StatusTag';

const organizationId = getUserOrganizationId();

const StageTab = (props) => {
  const {
    customizeTable,
    dataSet,
    stageAll,
    onQuery,
    onFieldChange,
    letfRender,
    rightRender,
    goDetail,
  } = props;
  const [aggregationStageAll, setAggregationStageAll] = React.useState(false); // 明细-全部

  const getColumns = (key) => {
    switch (key) {
      case 'flat':
        return [
          {
            name: 'pcStatusCode',
            width: 150,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            name: 'pcNum',
            width: 160,
            renderer: ({ value, record }) => {
              return <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>;
            },
          },
          {
            name: 'pcName',
            width: 200,
            renderer: ({ record }) => (
              <Tooltip title={record.get('pcName')}>{record.get('pcName')}</Tooltip>
            ),
          },
          {
            name: 'supplierCompanyName',
            width: 165,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'companyName',
            width: 100,
          },
          {
            name: 'pcKindCode',
            width: 100,
            renderer: ({ record }) => record.get('pcKindCodeMeaning'),
          },
          {
            name: 'pcTypeId',
            width: 120,
            renderer: ({ record }) => record.get('pcTypeName'),
          },
          {
            name: 'pcTemplateId',
            width: 120,
            renderer: ({ record }) => record.get('templateName'),
          },
          {
            name: 'startDateActive',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('startDateActive')),
          },
          {
            name: 'endDateActive',
            width: 120,
            renderer: ({ record }) => dateRender(record.get('endDateActive')),
          },
          {
            name: 'stageCode',
            width: 120,
          },
          {
            name: 'stageName',
            width: 120,
          },
          {
            name: 'prepaymentStage',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'milestoneTime',
            width: 120,
          },
          {
            name: 'payRatio',
            width: 155,
          },
          {
            name: 'supplierCurrencyCode',
            width: 150,
          },
          // {
          //     name: 'purchaseCurrencyCodeLov',
          //     width: 150,
          //     compareValue: 'purchaseCurrencyCode',
          // },
          {
            name: 'costQuantity',
            width: 150,
          },
          {
            name: 'purchaseCostQuantity',
            width: 150,
          },
          {
            name: 'typeIdLov',
            width: 150,
            compareValue: 'typeName',
          },
          {
            name: 'termIdLov',
            width: 150,
            compareValue: 'termName',
          },
          {
            name: 'purchaseOrgId',
            width: 150,
            renderer: ({ record }) => record.get('purchaseOrgName'),
          },
          {
            name: 'ouId',
            width: 150,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            name: 'purchaseAgentId',
            width: 100,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            name: 'createdBy',
            width: 140,
            renderer: ({ record }) => record.get('createByRealName'),
          },
          {
            name: 'creationDate',
            width: 100,
            renderer: ({ record }) => dateTimeRender(record.get('creationDate')),
          },
          {
            name: 'pcSourceCode',
            width: 100,
            renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
          },
        ];
      default:
        return [
          {
            name: 'pcStatusCode',
            width: 150,
            align: 'left',
            sort: 10,
            renderer: ({ value, record }) => (
              <StatusTag text={record.get('pcStatusCodeMeaning')} value={value} />
            ),
          },
          {
            key: 'numInfo',
            width: 240,
            aggregation: true,
            align: 'left',
            sort: 30,
            header: intl.get('spcm.workspace.model.common.numInfo').d('协议信息'),
            children: [
              {
                name: 'pcNum',
                renderer: ({ value, record }) => {
                  return <a onClick={() => goDetail(record, 'all')}>{`${value}`}</a>;
                },
              },
              {
                name: 'pcName',
              },
              {
                name: 'supplierCompanyName',
                renderer: ({ record }) =>
                  record.get('supplierCompanyName') || record.get('supplierName'),
              },
              {
                name: 'pcKindCode',
                renderer: ({ record }) => record.get('pcKindCodeMeaning'),
              },
              {
                name: 'pcTypeId',
                renderer: ({ record }) => record.get('pcTypeName'),
              },
              {
                name: 'pcTemplateId',
                renderer: ({ record }) => record.get('templateName'),
              },
            ],
          },
          {
            key: 'organizInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 40,
            header: intl.get('spcm.workspace.model.common.organizInfo').d('组织信息'),
            children: [
              {
                name: 'companyName',
              },
              {
                name: 'purchaseOrgId',
                renderer: ({ record }) => record.get('purchaseOrgName'),
              },
              {
                name: 'ouId',
                renderer: ({ record }) => record.get('ouName'),
              },
              {
                name: 'purchaseAgentId',
                width: 100,
                renderer: ({ record }) => record.get('purchaseAgentName'),
              },
            ],
          },
          {
            key: 'stageInfo',
            minWidth: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 50,
            header: intl.get('spcm.workspace.model.common.stageInfo').d('阶段信息'),
            children: [
              {
                name: 'stageCode',
                width: 120,
              },
              {
                name: 'stageName',
                width: 150,
              },
              {
                name: 'prepaymentStage',
                width: 120,
                renderer: ({ value }) => yesOrNoRender(value),
              },
            ],
          },
          {
            key: 'amountInfo',
            minWidth: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 50,
            header: intl.get('spcm.workspace.model.common.amountInfo').d('金额信息'),
            children: [
              {
                name: 'supplierCurrencyCode',
                width: 150,
              },
              // {
              //     name: 'purchaseCurrencyCodeLov',
              //     width: 150,
              //     compareValue: 'purchaseCurrencyCode',
              // },
              {
                name: 'costQuantity',
                width: 150,
              },
              {
                name: 'purchaseCostQuantity',
                width: 150,
              },
            ],
          },
          {
            key: 'stagePayInfo',
            minWidth: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 50,
            header: intl.get('spcm.workspace.model.common.stagePayInfo').d('阶段付款信息'),
            children: [
              {
                name: 'payRatio',
                width: 155,
              },
              {
                name: 'typeIdLov',
                width: 150,
                compareValue: 'typeName',
              },
              {
                name: 'termIdLov',
                width: 150,
                compareValue: 'termName',
              },
            ],
          },

          {
            key: 'timeInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 60,
            header: intl.get('spcm.workspace.model.common.timeInfo').d('时间信息'),
            children: [
              {
                name: 'startDateActive',
                width: 120,
                renderer: ({ record }) => dateRender(record.get('startDateActive')),
              },
              {
                name: 'endDateActive',
                width: 120,
                renderer: ({ record }) => dateRender(record.get('endDateActive')),
              },
              {
                name: 'milestoneTime',
                width: 120,
              },
            ],
          },
          {
            key: 'createInfo',
            width: 200,
            align: 'left',
            aggregation: true,
            aggregationLimit: 4,
            sort: 70,
            header: intl.get('spcm.workspace.model.common.createInfo').d('创建信息'),
            children: [
              {
                name: 'createdBy',
                width: 140,
                renderer: ({ record }) => record.get('createByRealName'),
              },
              {
                name: 'creationDate',
                width: 150,
                renderer: ({ record }) => dateRender(record.get('creationDate')),
              },
            ],
          },
          {
            key: 'sourceInfo',
            width: 200,
            align: 'left',
            header: intl.get('spcm.workspace.model.common.sourceInfo').d('来源信息'),
            aggregation: true,
            sort: 90,
            aggregationLimit: 4,
            children: [
              {
                name: 'pcSourceCode',
                width: 150,
                renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
              },
            ],
          },
        ];
    }
  };

  const getTableRender = useCallback(() => {
    return customizeTable(
      {
        code: 'SPCM.WORKSPACE_STAGE_ALL.LIST',
      },
      <SearchBarTable
        customizable
        customizedCode="aggregation"
        aggregation={aggregationStageAll}
        onAggregationChange={(a) => {
          setAggregationStageAll(a);
        }}
        cacheState
        style={{ maxHeight: `calc(100vh - 280px)` }}
        searchCode="SPCM.WORKSPACE_STAGE_ALL.SEARCH"
        dataSet={dataSet}
        columns={getColumns(stageAll)}
        searchBarConfig={{
          onQuery: (e) => onQuery(e, dataSet),
          onFieldChange,
          editorProps: {
            pcStatusSet: {
              // 已变更/已拒绝/供应商确认前变更/供应商确认后变更/补充完成。工作台筛选中去掉该值。
              optionsFilter: (record) =>
                ![
                  'HAVE_ALTERATION',
                  'REJECT',
                  'AFTER_SUP_CONFIRM',
                  'BEFORE_SUP_CONFIRM',
                  'SUPPLEMENT_COMPLETE',
                ].includes(record.get('value')),
            },
          },
          fieldProps: {
            supplierCompanyId: {
              lovPara: {
                tenantId: organizationId,
              },
            },
            version: {
              precision: 0,
            },
            // multiPcNumOrTitle: {
            //   multiple: ',',
            // },
          },
          left: {
            render: letfRender,
          },
          right: {
            render: () => rightRender('stageAll', setAggregationStageAll),
          },
        }}
      />
    );
  });

  return getTableRender();
};

export default compose(observer)(StageTab);
