/*
 * @Date: 2025-03-12 09:32:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

const HeaderBtns = ({
  dataSet,
  loading,
  activeKey,
  onSubmit,
  submitDisabled,
  onCreateMenus,
  onOverlayClick,
  customizeBtnGroup,
}) => {
  // 获取导出参数
  const handleExportParams = () => {
    if (dataSet) {
      const queryParams = dataSet?.queryDataSet?.current?.toData() || {};
      return filterNullValueObject(queryParams);
    }
  };

  const buttons = [
    {
      name: 'create',
      noNest: true,
      hidden: activeKey === 'supplierLane',
      child: (
        <Dropdown placement="bottomRight" overlay={onCreateMenus()} onOverlayClick={onOverlayClick}>
          <Button icon="add" color="primary" loading={loading}>
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="expand_more" style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }} />
          </Button>
        </Dropdown>
      ),
    },
    {
      name: 'submit',
      hidden: activeKey !== 'waitSubmit',
      child: intl.get(`hzero.common.button.submit`).d('提交'),
      btnProps: {
        icon: 'check',
        funcType: 'flat',
        disabled: submitDisabled,
        onClick: onSubmit,
      },
    },
    {
      name: 'export',
      btnComp: ExcelExportPro,
      hidden: activeKey !== 'all',
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-reqss/listExport`,
        queryParams: () => handleExportParams(),
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        templateCode: 'SRM_C_SRM_SSLM_LIFE_CYCLE_CHANGE_REQS_LIST',
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
    {
      name: 'detailExport',
      btnComp: ExcelExportPro,
      hidden: activeKey !== 'all',
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-reqss/listDetailExport`,
        queryParams: () => handleExportParams(),
        buttonText: intl.get('sslm.common.button.detailExport').d('详情导出'),
        templateCode: 'SRM_C_SRM_SSLM_LIFE_CYCLE_CHANGE_REQS_DETAIL_LIST',
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: {
      ...btn.btnProps,
      loading,
      wait: 500,
      waitType: 'throttle',
    },
  }));
  return customizeBtnGroup(
    {
      code: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />
  );
};

export default HeaderBtns;
