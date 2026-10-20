import React, { useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { operatorRender, enableTagRender } from 'hzero-front/lib/utils/renderer';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { DataSet, Button } from 'choerodon-ui/pro';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import qs from 'querystring';
import { Operators } from '@/businessGlobalData/common';
import {
  disableBusinessObjectRule,
  enableBusinessObjectRule,
} from '@/services/businessObjectService';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

interface IProps {
  ruleDS: DataSet;
  businessObjectName?: string;
  domainId?: string;
  [x: string]: any;
}

const tenantHidden = isTenantRoleLevel();
let cacheTotalCount = 0;

const Index = (props: IProps) => {
  const {
    ruleDS,
    history,
    match: {
      params: { id: businessObjectId },
    },
    businessObjectCode,
    businessObjectName,
    domainId,
  } = props;

  useEffect(() => {
    const init = async () => {
      if (businessObjectCode) {
        await ruleDS.query();
        cacheTotalCount = ruleDS.totalCount;
      }
    };
    init();
  }, [ruleDS, businessObjectCode]);

  const handleNavigatorToCreate = () => {
    // 跳转至详情页面
    history.push({
      pathname: `/hmde/business-object/rule/create`,
      search: qs.stringify({
        businessObjectId,
        businessObjectCode,
        cacheTotalCount,
        businessObjectName,
        domainId,
      }),
    });
  };

  const handleNavigatorToDetail = ruleId => {
    // 跳转至详情页面
    history.push({
      pathname: `/hmde/business-object/rule/detail`,
      search: qs.stringify({
        businessObjectId,
        businessObjectCode,
        businessObjectName,
        domainId,
        ruleId,
      }),
    });
  };

  const handleDisableRule = async data => {
    const res = await disableBusinessObjectRule(data);
    if (getResponse(res)) {
      ruleDS.query();
    }
  };
  const handleEnableRule = async data => {
    const res = await enableBusinessObjectRule(data);
    if (getResponse(res)) {
      ruleDS.query();
    }
  };

  return (
    <FilterBarTable
      dataSet={ruleDS}
      buttons={tenantHidden ? undefined :[
        <Button icon="playlist_add" hidden={tenantHidden} onClick={() => handleNavigatorToCreate()}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
      ]}
      columns={[
        { name: 'enabledFlag', renderer: ({ value }) => enableTagRender(value ? 1 : 0) },
        {
          name: 'ruleName',
          tooltip: 'overflow' as any,
          renderer: ({ value, record }) => (
            <a
              style={{ verticalAlign: 'text-bottom' }}
              onClick={() => handleNavigatorToDetail(record?.get('validateRuleId'))}
            >
              {value}
            </a>
          ),
        },
        { name: 'ruleCode', tooltip: 'overflow' as any },
        {
          name: 'ruleType',
          renderer: ({ value }) => {
            const map = {
              RECHECK_RULE: '查重规则',
              REGEXP_VALIDATE: '正则校验',
              CUSTOM_RULE: '自定义规则',
            };
            return map[value];
          },
        },
        {
          name: 'ruleSourceType',
          renderer: ({ value }) => {
            const map = {
              CUSTOM: '自定义',
              PREDEFINE: '预定义',
            };
            return map[value];
          },
        },
        { name: 'errorInfo', tooltip: Tooltip.overflow },
        {
          header: intl.get('hzero.common.table.column.option').d('操作'),
          width: 120,
          hidden: tenantHidden,
          lock: ColumnLock.right,
          renderer: ({ record }) => {
            const operators: Operators = [
              {
                key: 'delete',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => {
                      if (record) {
                        ruleDS.delete(record);
                      }
                    }}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.delete').d('删除'),
              },
            ];
            if (record?.get('enabledFlag')) {
              operators.unshift({
                key: 'disable',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => handleDisableRule(record?.toData())}
                  >
                    {intl.get('hzero.common.button.disable').d('禁用')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.disable').d('禁用'),
              });
            } else {
              operators.unshift({
                key: 'disable',
                ele: (
                  <a
                    style={{ verticalAlign: 'text-bottom' }}
                    onClick={() => handleEnableRule(record?.toData())}
                  >
                    {intl.get('hzero.common.button.enable').d('启用')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.enable').d('启用'),
              });
            }
            return operatorRender(operators, record);
          },
        },
      ]}
      filterBarConfig={{
        collpase: true,
        collpaseble: true,
      }}
      customizable
      customizedCode='HMDE.BUSINESS_OBJECT.RULE.LIST'
    />
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Index)
);
