/* 列表头按钮组
 * @Date: 2024-05-30 13:38:15
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

import { getExportConfig } from '../utils/index';

const HeaderBtns = observer(
  ({
    remote,
    dataSet,
    activeKey,
    handleCreate = () => {},
    handleDelete = () => {},
    customizeBtnGroup = () => {},
    handleExportParams = () => {},
  }) => {
    const isNotSelected = isEmpty(dataSet.selected);
    // 待审批
    const toSubmitFlag = activeKey === 'toBeSubmitted';
    // 整单全部
    const wholeOrderAllFlag = activeKey === 'wholeOrderAll';

    // 明细全部
    const lineDetailAllFlag = activeKey === 'lineDetailAll';

    const btns = [
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
        name: 'excelExport',
        btnComp: ExcelExportPro,
        hidden: !['wholeOrderAll', 'lineDetailAll'].includes(activeKey),
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
    const buttons = remote
      ? remote.process('SSLM_SUPPLY_ABILITY_DOC_SUPPLIER_WORKBENCH_LIST_HEADER_BTNS', btns, {
          dataSet,
          activeKey,
        })
      : btns;
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
