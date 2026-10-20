/**
 * RulesDefinition.js
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, useState, useMemo, useContext } from 'react';
import { isArray, isNil } from 'lodash';
import { DataSet, Button, Modal, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { Spin, Tooltip } from 'choerodon-ui';
import { Header } from 'components/Page';
import { downloadFileByAxios, initiateAsyncExport } from 'services/api';
import { getCurrentTenant, getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';

import { ReactComponent as NoContent } from '@/assets/ill_none.svg';
import CommonImport from './Import';
import { getReturnFieldTableDs } from './stores/paramServiceDs';
import Context from './Context';
import TreeMenu from './TreeMenu';
import CollapseBox from './CollapseBox';
import DefinitionDetail from './DefinitionDetail';
import { isJSON } from './util';
import style from './index.less';

const currentTenant = getCurrentTenant();

function RulesDefinition() {
  const {
    filterTreeDs,
    serviceRuleDs,
    returnValueDs,
    paramServiceDs,
    policyConfigDs,
    policyConfigDataDs,
    conditionJsonDs,
    paramTableDs,
    customizeConditionCombinationDs,
  } = useContext(Context);
  const [formVisible, handleFormVisible] = useState(false);
  const [returnMultipleValueFlag, handleReturnMultipleValueFlag] = useState(false); // 多值返回类型标识
  const [returnFieldDs, setReturnFieldDs] = useState(); // 返回字段ds
  const [loading, setLoadingStatus] = useState(false); // 返回字段ds
  const [exportLoading, setExportLoading] = useState(false); // 导出按钮loading
  const [exportConditionLoading, setExportConditionLoading] = useState(false); // 导出按钮loading

  // 返回值ds 添加 load 监听，如果 load的时候，添加 field 字段 描述、执行规则值
  useMemo(() => {
    returnValueDs.addEventListener('load', async () => {
      const returnFieldDsTmp = new DataSet(getReturnFieldTableDs());
      const fieldData = returnValueDs.toData() || [];
      fieldData.forEach(item => {
        returnFieldDsTmp.addField(item.name, {
          ...item,
          required: true,
          type: item.lovCode ? 'object' : item.type || 'string',
          transformResponse: (value, object) => {
            if (object && !object.value && !object.valueMeaning) {
              return null;
            }
            if (item.lovCode && item.valueField) {
              return item.multiple
                ? (isJSON(value) ? JSON.parse(value) || [] : value || [])?.map((v, index) => {
                  const meaning = JSON.parse(object.valueMeaning || '[]');
                  return {
                    [item.valueField]: v,
                    [item.textField]: meaning[index],
                  };
                })
                : {
                  [item.valueField]: value,
                  [item.textField]: !returnMultipleValueFlag
                    ? object.valueMeaning
                    : JSON.parse(object.valueMeaning)[item.name],
                };
            } else {
              const reValue = isJSON(value) ? JSON.parse(value) : value;
              return isNil(reValue) ? '' : reValue;
            }
          },
          transformRequest: value => {
            if (value === undefined || value === null) {
              return null;
            }
            if (item.lovCode && item.valueField) {
              if (isArray(value)) {
                const valueTmp = value.map(v => v[item.valueField]);
                return returnMultipleValueFlag ? valueTmp : JSON.stringify(valueTmp);
              } else {
                return value[item.valueField];
              }
            } else {
              return isArray(value) ? JSON.stringify(value) : value;
            }
          },
          computedProps: handleTransformComputedProps(item.computedProps),
        });
      });
      setReturnFieldDs(returnFieldDsTmp);
    });
  }, [returnValueDs, returnMultipleValueFlag]);

  const handleTransformComputedProps = computedProps => {
    if (!computedProps) {
      return {};
    }
    let oldComputedProps = computedProps;
    if (typeof oldComputedProps === 'string') {
      oldComputedProps = JSON.parse(oldComputedProps);
    }
    const newComputedProps = {};
    if (oldComputedProps.noFunc) {
      if (oldComputedProps.lovPara) {
        const newLovPara = { ...oldComputedProps.lovPara };
        if (newLovPara.tenantId) {
          newLovPara.tenantId = currentTenant.tenantId;
        }
        newComputedProps.lovPara = () => {
          return newLovPara;
        };
      }
    }
    return newComputedProps;
  };

  const exportDate = () => {
    Modal.confirm({
      title: intl
        .get(`spfm.rulesDefinition.view.message.confirm.exportTitle`)
        .d('确定导出所有数据吗？'),
      onOk: () => {
        setExportLoading(true);
        const { tenantNum, tenantId } = currentTenant;
        const api = `/marmot/v1/${tenantId}/marmot-organization-api/CNF_META_DEFINITION_EXP`;
        downloadFileByAxios({
          requestUrl: api,
          queryParams: [{ name: 'tenantNum', value: tenantNum }, { name: 'async', value: true }],
          method: 'GET',
        }).finally(() => {
          setExportLoading(false);
        });
      },
    });
  };

  const exportCondition = () => {
    setExportConditionLoading(true);
    const { tenantNum, tenantId } = currentTenant;
    const api = `/spfm/v1/${tenantId}/cnf-center-exp/export`;
    request(api, {
      query: { exportType: 'COLUMN', tenantNum },
      method: 'GET',
    })
      .then(res => {
        if (getResponse(res)) {
          const data = res.children || [];
          const params = [];
          data.forEach(item => {
            params.push({ name: 'ids', value: item.id });
            if (item.children) {
              params.push(...item.children.map(ele => ({ name: 'ids', value: ele.id })));
            }
          });
          const param = filterNullValueObject(filterTreeDs?.current?.toData() || {});
          // 添加表单查询参数
          for (const key of Object.keys(param)) {
            if (param[key] !== undefined) {
              params.push({ name: key, value: param[key] });
            }
          }
          initiateAsyncExport({
            requestUrl: api,
            queryParams: [
              { name: 'tenantNum', value: tenantNum },
              { name: 'fillerType', value: 'single-sheet' },
              { name: 'maxDataCount', value: '250000' },
              { name: 'singleExcelMaxSheetNum', value: '5' },
              { name: 'fileType', value: 'EXCEL2007' },
              { name: 'async', value: 'true' },
              { name: 'exportType', value: 'DATA' },
              ...params,
            ],
            method: 'GET',
          }).finally(() => {
            setExportConditionLoading(false);
          });
        } else {
          setExportConditionLoading(false);
        }
      })
      .finally(() => {
        setExportConditionLoading(false);
      });
  };

  const templateDownloadMenu = (
    <Menu>
      <Menu.Item key="exportByPloy">
        <a onClick={() => exportDate()} disabled={exportLoading}>
          {intl.get('spfm.rulesDefinition.view.button.exportByPloy').d('按策略整行导出')}
        </a>
      </Menu.Item>
      <Menu.Item key="exportByCondition">
        <Tooltip
          title={intl
            .get('spfm.rulesDefinition.view.button.exportByConditionTip')
            .d('如需导入业务规则定义，请使用该导出Excel文件用于导入。')}
        >
          <a onClick={() => exportCondition()} disabled={exportConditionLoading}>
            {intl
              .get('spfm.rulesDefinition.view.button.exportByCondition')
              .d('按条件和执行规则打平导出')}
          </a>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  const handleSelectMenuItem = visible => {
    handleFormVisible(visible);
    if (policyConfigDs && policyConfigDs.queryDataSet) {
      policyConfigDs.queryDataSet.reset();
    }
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.rulesDefinition.view.title.header').d('业务规则定义')}>
        <Dropdown overlay={templateDownloadMenu}>
          <Button icon="unarchive" funcType="flat">
            {intl.get('hzero.common.export').d('导出')}
            <Icon type="keyboard_arrow_down" />
          </Button>
        </Dropdown>
        <CommonImport
          buttonProps={{
            funcType: 'flat',
            permissionList: [
              {
                code: `srm.bg.business-rule.cnf.center.button.import`,
                type: 'button',
                meaning: '导入',
              },
            ],
          }}
        />
      </Header>
      <div className={style['rule-definition']}>
        <Spin spinning={loading}>
          <div className="rule-definition-content">
            <CollapseBox>
              <TreeMenu
                fetchDataDs={serviceRuleDs}
                onChange={handleSelectMenuItem}
                handleReturnMultipleValueFlag={handleReturnMultipleValueFlag}
                handleLoading={setLoadingStatus}
              />
            </CollapseBox>
            <div className="rule-definition-info">
              {formVisible ? (
                <DefinitionDetail
                  formDs={paramServiceDs}
                  tableDs={policyConfigDs}
                  policyConfigDataDs={policyConfigDataDs}
                  conditionJsonDs={conditionJsonDs}
                  paramTableDs={paramTableDs}
                  returnValueDs={returnValueDs}
                  returnFieldDs={returnFieldDs}
                  customizeConditionCombinationDs={customizeConditionCombinationDs}
                  returnMultipleValueFlag={returnMultipleValueFlag}
                  style={{ overflowY: 'auto' }}
                />
              ) : (
                <div className="rule-definition-black">
                  <div className="blank-pic">
                    <NoContent />
                  </div>
                  <div className="blank-desc">
                    {intl
                      .get('spfm.rulesDefinition.view.title.blankTitle')
                      .d('请从左侧菜单中选择业务规则分类')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Spin>
      </div>
    </Fragment>
  );
}

export default RulesDefinition;
