/* 列表头按钮组
 * @Date: 2024-05-30 13:38:15
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Icon, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

import { getExportConfig } from '../utils/index';

const HeaderBtns = observer(
  ({
    dataSet,
    activeKey,
    handleCreate = () => {},
    handleDelete = () => {},
    customizeBtnGroup = () => {},
    handleApproved = () => {},
    handleRefused = () => {},
    handleExportParams = () => {},
  }) => {
    const isNotSelected = isEmpty(dataSet.selected);
    // 待审批
    const toSubmitFlag = activeKey === 'toBeSubmitted';
    // 审批中
    const approvingFlag = activeKey === 'approving';
    // 整单全部
    const wholeOrderAllFlag = activeKey === 'wholeOrderAll';
    // 明细全部
    const lineDetailAllFlag = activeKey === 'lineDetailAll';

    const buttons = [
      {
        name: 'create',
        btnProps: {
          icon: 'add',
          type: 'c7n-pro',
          color: 'primary',
          onClick: handleCreate,
        },
        child: intl.get('hzero.common.button.create').d('新建'),
        hidden: lineDetailAllFlag,
      },
      {
        name: 'batchDelete',
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'delete_sweep',
          disabled: isNotSelected,
          onClick: () => handleDelete(dataSet),
        },
        hidden: !toSubmitFlag,
        child: intl.get('sslm.common.button.batchDelete').d('批量删除'),
      },
      {
        name: 'batchApproval',
        group: true,
        hidden: !approvingFlag,
        child: (
          <Button type="c7n-pro" funcType="flat" icon="authorize" disabled={isNotSelected}>
            {intl.get('sslm.common.button.batchApproval').d('批量审批')}
            <Icon type="expand_more" style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }} />
          </Button>
        ),
        children: [
          {
            name: 'approved',
            btnType: 'c7n-pro',
            child: intl.get('hzero.common.button.approved').d('审批通过'),
            btnProps: {
              disabled: isNotSelected,
              onClick: () => handleApproved(dataSet),
            },
          },
          {
            name: 'refused',
            btnType: 'c7n-pro',
            child: intl.get('hzero.common.button.refused').d('审批拒绝'),
            btnProps: {
              disabled: isNotSelected,
              onClick: () => handleRefused(dataSet),
            },
          },
        ],
      },
      {
        name: 'excelExport',
        btnComp: ExcelExportPro,
        hidden: !(wholeOrderAllFlag || lineDetailAllFlag),
        btnProps: {
          ...getExportConfig(wholeOrderAllFlag),
          queryParams: () => handleExportParams(dataSet),
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          buttonText: isNotSelected
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: '',
        pro: true,
      },
      <DynamicButtons buttons={buttons} maxNum={5} trigger="hover" defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
