/*
 * @Date: 2023-10-07 20:03:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { routerRedux } from 'dva/router';
import React, { useCallback } from 'react';
import { Icon, Dropdown, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderAddMenus } from '../IndicatorDefine/utils';

const organizationId = getCurrentOrganizationId();
const permissionList = [
  {
    name: 'exportPro',
    meaning: '指标定义新导出',
    code: 'srm.partner.indicator-template-definition.button.indicators.definition-export',
  },
  {
    name: 'commonImport',
    meaning: '指标定义新导入',
    code: 'srm.partner.indicator-template-definition.button.indicators.definition-import',
  },
];

const HeaderBtns = observer(
  ({
    loading,
    activeKey,
    dispatch,
    indicatorListDs,
    indicatorSearchBarRef,
    batchUpdateTemplate,
    onOverlayClick,
    allRowExpandFlag,
    expandAllClick,
  }) => {
    // 指标定义-导出参数
    const getExportParams = useCallback(() => {
      const queryParams = indicatorListDs?.queryDataSet?.current?.toData() || {};
      const exportIndicatorIds = indicatorListDs?.selected
        ?.map(record => record?.get('indicatorId'))
        ?.join();
      return filterNullValueObject({ ...queryParams, exportIndicatorIds });
    }, [indicatorSearchBarRef]);

    // 新建模板
    const handleTemplateCreate = useCallback(() => {
      dispatch(
        routerRedux.push({
          pathname: '/sslm/indicator-template-define/template-detail/create',
        })
      );
    }, []);

    // 指标定义头按钮
    const indicatorBtns = [
      {
        name: 'create',
        noNest: true,
        child: (
          <Dropdown
            placement="bottomRight"
            overlay={renderAddMenus()}
            onOverlayClick={event => onOverlayClick(event, 'PARENT')}
          >
            <Button icon="add" color="primary" loading={loading}>
              {intl.get('spfm.supplierKpiIndicator.view.button.addParentNode').d('新增顶级指标')}
              <Icon
                type="expand_more"
                style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }}
              />
            </Button>
          </Dropdown>
        ),
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/indicators/export-new`,
          queryParams: () => getExportParams(),
          templateCode: 'SRM_C_SRM_SSLM_KPI_INDICATOR_DEFINITION_EXPORT',
          buttonText: isEmpty(indicatorListDs?.selected)
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
          otherButtonProps: {
            loading,
            funcType: 'flat',
          },
        },
      },
      {
        name: 'commonImport',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.import').d('导入'),
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_KPI_INDICATOR_DEFINITION_IMPORT',
          prefixPatch: SRM_SSLM,
          refreshButton: true,
          successCallBack: () => {
            indicatorListDs.query();
          },
          buttonProps: {
            loading,
            funcType: 'flat',
          },
        },
      },
      {
        name: 'batchUpdateToScoringTemplate',
        btnProps: {
          loading,
          funcType: 'flat',
          icon: 'published_with_changes',
          disabled: isEmpty(indicatorListDs.selected),
          onClick: batchUpdateTemplate,
        },
        child: intl
          .get('spfm.supplierKpiIndicator.view.button.batchUpdateToScoringTemplate')
          .d('批量更新至评分模板'),
      },
      {
        name: 'collapseAll',
        btnProps: {
          loading,
          funcType: 'flat',
          icon: allRowExpandFlag ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
          onClick: expandAllClick,
        },
        child: allRowExpandFlag
          ? intl.get('hzero.common.button.collapseAll').d('全部收起')
          : intl.get('hzero.common.button.expandAll').d('全部展开'),
      },
    ];

    // 模板定义头按钮
    const templateBtns = [
      {
        name: 'create',
        btnProps: {
          loading,
          icon: 'add',
          color: 'primary',
          onClick: handleTemplateCreate,
        },
        child: intl.get(`hzero.common.button.create`).d('新建'),
      },
    ];

    const buttons = activeKey === 'indicatorDefine' ? indicatorBtns : templateBtns;

    return (
      <DynamicButtons
        maxNum={5}
        trigger="hover"
        defaultBtnType="c7n-pro"
        buttons={buttons}
        permissions={permissionList}
      />
    );
  }
);

export default HeaderBtns;
