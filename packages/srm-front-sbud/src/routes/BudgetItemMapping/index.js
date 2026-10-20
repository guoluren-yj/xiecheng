import React, { Fragment, useMemo, useRef } from 'react';
import { Header, Content } from 'components/Page';
import { Tag } from 'choerodon-ui';
import { Button, useDataSet, Modal, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, compose } from 'lodash';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { save, budgetItemEnable, refBudgetItemDdefault } from '@/services/budgetItemMappingService';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import BudgetItemDetail from '@/routes/components/BudgetItemDetail';
import TableDs from './store/indexDs';
import { colorRender } from './hook';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index(props) {
  const { customizeTable, dispatch } = props;
  const tableDs = useDataSet(() => TableDs(), []);

  const detailRef = useRef(null);

  const lovDs = useDataSet(
    () => ({
      autoCreate: true,
      fields: [
        {
          name: 'code',
          type: 'object',
          lovCode: 'SBDM.BUDGET_PRE_ITEM',
          multiple: true,
        },
      ],
      events: {
        update: ({ name, value, dataSet }) => {
          if (name === 'code' && !isEmpty(value)) {
            refBudgetItemDdefault(value)
              .then(res => {
                if (res?.failed) {
                  notification.error({
                    message: res.message,
                  });
                } else {
                  notification.success();
                  tableDs.query();
                }
              })
              .finally(() => {
                dataSet.loadData([
                  {
                    code: [],
                  },
                ]);
              });
          }
        },
      },
    }),
    []
  );

  const handleToDetail = (record, type) => {
    if (record) {
      const itemKey = `sbdm.budgetItemMapping.detail`;
      window.sessionStorage.setItem(itemKey, JSON.stringify(record.toData()));
      if (type === 'edit') {
        dispatch(
          routerRedux.push({
            pathname: `/sbud/budget-item-mapping/detail/${record.get('budgetItemId')}`,
            search: `?cacheKey=${itemKey}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/sbud/budget-item-mapping/read-only/${record.get('budgetItemId')}`,
            search: `?cacheKey=${itemKey}`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sbud/budget-item-mapping/detail/new`,
        })
      );
    }
  };

  const statusChange = record => {
    return new Promise(resolve => {
      budgetItemEnable({
        ...record.toData(),
        enabledFlag: String(record.get('enabledFlag')) === '1' ? '0' : '1',
      })
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            tableDs.query();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const colorSourceRender = (value, text) => {
    if (value === '1') {
      return (
        <Tag color="green" style={{ border: 'none' }}>
          {text}
        </Tag>
      );
    } else {
      return (
        <Tag color="yellow" style={{ border: 'none' }}>
          {text}
        </Tag>
      );
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 120,
        renderer: ({ value }) => (
          <Tag color={value === '1' ? 'green' : 'red'} style={{ border: 'none' }}>
            {value === '1'
              ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
              : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
          </Tag>
        ),
      },
      {
        name: 'operation',
        width: 150,
        renderer: ({ record }) => (
          <>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleToDetail(record, 'edit')}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>

            <Button
              style={{ marginLeft: '16px' }}
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => statusChange(record)}
            >
              {String(record.get('enabledFlag')) === '1'
                ? intl.get('hzero.common.button.disable').d('禁用')
                : intl.get('hzero.common.button.enabled').d('启用')}
            </Button>
          </>
        ),
      },
      {
        name: 'budgetItemCode',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => handleToDetail(record, 'readOnly')}>{value}</a>
        ),
      },
      {
        name: 'budgetItemName',
        width: 220,
      },
      {
        name: 'predefinedFlag',
        width: 150,
        renderer: ({ value, text }) => colorSourceRender(value, text),
      },
      {
        name: 'componentType',
        width: 200,
      },
      {
        name: 'lovCode',
        width: 200,
      },
      {
        name: 'importTranslateSceneDescription',
        width: 250,
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.budgetItemDefined`).d('预算维度定义')}>
        <Button type="c7n-pro" color="primary" icon="add" onClick={() => handleToDetail()}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
        <Lov
          dataSet={lovDs}
          name="code"
          mode="button"
          clearButton={false}
          funcType="flat"
          icon="cloud_download"
        >
          {intl.get(`${commonPrompt}.referBudgetItemDefined`).d('引用平台预定义维度')}
        </Lov>
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SBUD_BUDGET_MAPPING.LIST',
            dataSet: tableDs,
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100vh - 190px)' }}
            searchCode="SBUD_BUDGET_MAPPING.SEARCH"
            dataSet={tableDs}
            cacheState
            columns={columns}
            data={[]}
            queryFieldsLimit={3}
            // virtual
            // virtualCell
            // virtualSpin
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100', '200'],
            }}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['sbdm.common', 'hzero.common', 'hzero.c7nProUI', 'srm.filterBar'],
  }),
  withCustomize({
    unitCode: ['SBUD_BUDGET_MAPPING.SEARCH', 'SBUD_BUDGET_MAPPING.LIST'],
  })
)(Index);
