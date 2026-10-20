/**
 * RulesDefinition.js
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, useState, useMemo, useContext } from 'react';
import { isArray, isNil } from 'lodash';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { Header } from 'components/Page';
import { downloadFileByAxios } from 'services/api';
import { getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
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
                ? (isJSON(value) ? JSON.parse(value) : value).map((v, index) => {
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
              return isArray(value)
                ? JSON.stringify(value.map(v => v[item.valueField]))
                : value[item.valueField];
            } else {
              return isArray(value) ? JSON.stringify(value) : value;
            }
          },
        });
      });
      setReturnFieldDs(returnFieldDsTmp);
    });
  }, [returnValueDs, returnMultipleValueFlag]);

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
          queryParams: [{ name: 'tenantNum', value: tenantNum }],
          method: 'GET',
        }).finally(() => {
          setExportLoading(false);
        });
      },
    });
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.rulesDefinition.view.title.header').d('业务规则定义')}>
        <Button onClick={() => exportDate()} loading={exportLoading} icon="export">
          {intl.get('hzero.common.export').d('导出')}
        </Button>
      </Header>
      <div className={style['rule-definition']}>
        <Spin spinning={loading}>
          <div className="rule-definition-content">
            <CollapseBox>
              <TreeMenu
                fetchDataDs={serviceRuleDs}
                onChange={handleFormVisible}
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
                  <div className="blank-pic" />
                  <div className="blank-title">
                    {intl
                      .get('spfm.rulesDefinition.view.title.blankTitle')
                      .d('请从左侧菜单中选择业务规则分类')}
                  </div>
                  <div className="blank-desc">
                    {intl
                      .get('spfm.rulesDefinition.view.title.blankDesc')
                      .d('业务规则定义可以配置相关的业务流程规则')}
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
