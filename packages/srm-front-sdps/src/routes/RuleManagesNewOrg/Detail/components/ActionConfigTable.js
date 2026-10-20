/**
 * 规则配置详情 - 策略配置
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import CommonImport from 'components/Import';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';

import { ReactExportButton } from './ReactExportButton';

const { Column } = Table;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀
const organizationId = getCurrentOrganizationId();
const exportRequestUrl = `${SRM_DATA_PROCESS}/v1/${organizationId}/cnf-actions/action-export`;
const importTemplateCode = 'SDPS.CNF_ACTION_IMPORT'; // 导入模板编码

export default function ActionConfigTable(props = {}) {
  const {
    tableDs,
    code,
    tenantId,
    ruleCode,
    handleActionEdit,
    handleActionDelete,
    onActionAdd = () => {},
    onOpenCalculationModal = () => {},
  } = props;

  const buttons = () => {
    return [
      <Button onClick={onActionAdd} color="primary" icon="playlist_add">
        {intl.get(`${viewPrompt}.button.add`).d('添加')}
      </Button>,
      <ReactExportButton
        btnText={intl.get(`${viewPrompt}.button.export`).d('导出')}
        buttonProps={{
          funcType: 'flat',
          color: 'primary',
        }}
        exportRequestUrl={exportRequestUrl}
        ruleCode={ruleCode}
        code={code}
        ds={tableDs}
      />,
      <CommonImport
        refreshButton
        templateCode={importTemplateCode}
        prefixPatch={`${SRM_DATA_PROCESS}`}
        tenantId={tenantId}
        buttonText={intl.get(`${viewPrompt}.button.import`).d('导入')}
        buttonProps={{
          funcType: 'flat',
          color: 'primary',
        }}
        modalProps={{
          onClose: () => {
            tableDs.query();
          },
        }}
      />,
      <Button icon="rule" funcType="flat" onClick={onOpenCalculationModal}>
        {intl.get(`sdps.ruleManagesDetail.view.btn.strategyCalculation`).d('策略试算')}
      </Button>,
    ];
  };

  return (
    <Table dataSet={tableDs} queryBar="none" buttons={buttons()}>
      <Column name="actionName" width={200} />
      <Column name="description" width={200} />
      <Column name="priority" width={100} />
      <Column name="conditionExpression" />
      <Column name="value" width={200} />
      <Column
        name="action"
        width={120}
        renderer={({ record }) => {
          return (
            <Fragment>
              <a onClick={() => handleActionEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => handleActionDelete(record)} style={{ marginLeft: '16px' }}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </Fragment>
          );
        }}
      />
    </Table>
  );
}
