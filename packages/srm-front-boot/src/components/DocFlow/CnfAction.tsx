/**
 * DocInfo
 * 单据流单据信息 - 关键配置与策略
 * @date: 2021-11-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Spin, Table, DataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryNodeCnfAction } from './docFlowService';

interface CnfActionProps {
  nodeDataId: string;
  currentOrganizationId: number;
}

interface OptionData {
  fieldCode: string;
  fieldValue: string;
  fieldMeaning: string;
}

interface ActionValueInterface {
  isTile: boolean;
  actionDescription: string | string[];
}

function CnfAction(props: CnfActionProps) {
  const { nodeDataId, currentOrganizationId } = props;
  const [actionLoading, handleActionLoading] = useState(true);
  const [actionData, setActionData] = useState({});

  const strategyTypeMap = {
    SSTA_CONFIG: {
      desc: intl.get('component.docFlow.view.strategyType.sstaConfig').d('结算策略'),
      code: 'ssta-config',
      color: 'blue',
    },
    SOURCE_CONFIG: {
      desc: intl.get('component.docFlow.view.strategyType.sourceConfig').d('寻源模板策略'),
      code: 'source-config',
      color: 'yellow',
    },
    CNF: {
      desc: intl.get('component.docFlow.view.strategyType.cnf').d('业务规则定义'),
      code: 'cnf',
      color: 'green',
    },
  };

  useEffect(() => {
    queryNodeCnfAction({
      nodeDataId,
      currentOrganizationId,
    })
      .then((res) => {
        if (getResponse(res)) {
          setActionData(getDsOption(res));
        }
      })
      .finally(() => handleActionLoading(false));
  }, []);

  const tableDs = useMemo(() => new DataSet(actionData), [actionData]);


  const getDsOption = (data = []) => {
    const dsData = {};
    data.forEach((d: OptionData) => {
      dsData[d.fieldCode] = d.fieldValue;
    });
    return {
      selection: false,
      paging: false,
      fields: [
        {
          name: 'cnfName',
          type: 'string',
          label: intl.get('component.docFlow.view.strategyType.cnfName').d('执行策略'),
        },
        {
          name: 'strategyType',
          type: 'string',
        },
        {
          name: 'cnfDescription',
          type: 'string',
        },
        {
          name: 'settleConfigNum',
          type: 'string',
        },
        {
          name: 'link',
          type: 'string',
        },
        {
          name: 'versionNumber',
          type: 'number',
        },
        {
          name: 'actionValue',
          type: 'object',
          label: intl.get('component.docFlow.view.collapse.action.actionDescription').d('执行规则'),
        },
        {
          name: 'createDate',
          type: 'string',
          label: intl.get('component.docFlow.view.collapse.action.createDate').d('执行时间'),
        },
      ],
      data,
    };
  };

  const renderActionDescription = (actionValue: ActionValueInterface) => {
    const { isTile, actionDescription } = actionValue;
    if (isTile) {
      return (
        <div>
          { typeof actionDescription === 'string' ? null : actionDescription.map((desc) => {
            return (
              <div className="action-table-cnfActionDesc-objDesc">
                <span>{Object.keys(desc)[0]}: </span>
                <span>{Object.values(desc)[0]}</span>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <span>
          {typeof actionDescription === 'string' ? actionDescription : actionDescription.join(' ')}
        </span>
      );
    }
  };

  const columns: object[] = [
    {
      name: 'cnfName',
      width: 300,
      renderer: ({ record }) => {
        const { cnfName, strategyType, cnfDescription } = record.get([
          'cnfName',
          'strategyType',
          'cnfDescription',
        ]);
        return (
          <div className="action-table-cnfActionInfo">
            <div className="action-table-cnfActionInfo-content">
              <span className="action-table-cnfActionInfo-content-cnfName">{cnfName}</span>
              <span
                className={classnames(
                  'action-type-desc',
                  `action-type-desc-${strategyTypeMap[strategyType].color}`
                )}
              >
                {strategyTypeMap[strategyType].desc}
              </span>
            </div>
            <div className="action-table-cnfActionInfo-content-cnfDescription">
              {cnfDescription}
            </div>
          </div>
        );
      },
    },
    {
      name: 'actionValue',
      width: 280,
      renderer: ({ record }) => {
        const { strategyType, settleConfigNum, versionNumber, actionValue, link } = record.get([
          'strategyType',
          'settleConfigNum',
          'versionNumber',
          'actionValue',
          'link',
        ]);
        return strategyType === 'SSTA_CONFIG' ? (
          <div>
            <div>
              <span>
                {intl.get('component.docFlow.view.collapse.action.settleConfigNum').d('策略编码')}
              </span>
              <a href={link} rel="noopener noreferrer" target="_blank">
                {settleConfigNum}
              </a>
            </div>
            <div>
              <span>
                {intl.get('component.docFlow.view.collapse.action.versionNumber').d('策略版本')}
              </span>
              <span>{versionNumber}</span>
            </div>
          </div>
        ) : (
          <div className="action-table-cnfActionDesc">{renderActionDescription(actionValue)}</div>
        );
      },
    },
    {
      name: 'createDate',
      width: 120,
    },
  ];

  return (
    <div className="doc-flow-info-modal-action">
      <Spin spinning={actionLoading}>
        <div className="modal-group-head-title">
          <span>
            {intl.get('component.docFlow.view.docInfo.tab.docAction').d('关键配置与策略')}
          </span>
        </div>
        <Table
          className="action-table"
          dataSet={tableDs}
          aggregation
          columns={columns}
          rowHeight="auto"
        />
      </Spin>
    </div>
  );
}

export default CnfAction;
