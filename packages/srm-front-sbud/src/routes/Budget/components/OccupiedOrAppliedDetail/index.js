/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-23 13:09:57
 */

import React, { useMemo, useState, useEffect } from 'react';
import ExcelExport from '@/routes/components/ExcelExport';
import { Modal, DataSet, Select, useDataSet, Button, Dropdown } from 'choerodon-ui/pro';
import { Icon, Divider, Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import SearchBarTable from '@/routes/components/SearchBarTable';
import { fetchLineAmount } from '@/services/budgetService';
import { listDS, dataSourcesDS, aggregationMethodList } from './stores/indexDs';
import Formula from './Formula';

import styles from './index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const organizationId = getCurrentOrganizationId();

const OccupiedOrApplied = ({ budgetLineId, dataSourcesDs }) => {
  const [dataSources, setDataSources] = useState('all');
  const [aggregationMethod, setAggregationMethods] = useState('detail');
  const [amountObj, setAmountObj] = useState({});
  const listDs = useDataSet(() => listDS({ budgetLineId }), [budgetLineId]);
  const viewList = useMemo(() => aggregationMethodList(), []);
  const ModalFooter = observer(({ dataSet }) => {
    const { selected } = dataSet;

    let url = '';
    switch (dataSources) {
      case 'all':
        url = `/sbdm/v1/${organizationId}/budget-line/all-detail-view/export/${budgetLineId}`;
        break;
      case 'occupy':
        url = `/sbdm/v1/${organizationId}/budget-line/occupy-detail-view/export/${budgetLineId}`;
        break;
      case 'cancellation':
        url = `/sbdm/v1/${organizationId}/budget-line/cancellation-detail-view/export/${budgetLineId}`;
        break;
      default:
        url = `/sbdm/v1/${organizationId}/budget-line/all-detail-view/export/${budgetLineId}`;
        break;
    }

    const getExportParams = () => {
      // eslint-disable-next-line no-unused-expressions
      const queryParams = dataSet.queryDataSet?.current?.toData() || {};
      const { documentDate = {}, ...other } = queryParams;
      let uniqueKeyList;
      if (!isEmpty(selected)) {
        uniqueKeyList = selected.map((e) => e.get('uniqueKey')).join(',');
      }
      const params = {
        ...other,
        ...documentDate,
        uniqueKeyList,
        ...(dataSet?.queryParameter || {}),
      };
      return filterNullValueObject(params);
    };

    const modalClose = () => {
      return Modal.destroyAll();
    };

    const buttonText = isEmpty(selected)
      ? intl.get('hzero.common.button.export').d('导出')
      : intl.get(`hzero.common.checkedExport`).d('勾选导出');

    return (
      <div className={styles['occupied-or-applied-detail-footer']}>
        {aggregationMethod === 'detail' && (
          <ExcelExport
            requestUrl={url}
            queryParams={() => getExportParams()}
            buttonText={buttonText}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'raised',
              color: 'primary',
              icon: null,
            }}
          />
        )}

        <Button onClick={modalClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
      </div>
    );
  });

  const swap = (arr, a, b) => {
    const temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  };

  const columns = useMemo(() => {
    let amountHeader = '';
    switch (dataSources) {
      case 'all':
        amountHeader = intl.get(`${commonPrompt}.occupiedOrAppliedAmount`).d('占用/核销金额');
        break;
      case 'occupy':
        amountHeader = intl.get(`${commonPrompt}.occupyAmount`).d('占用金额');
        break;
      case 'cancellation':
        amountHeader = intl.get(`${commonPrompt}.writtenOffAmount`).d('核销金额');
        break;
      default:
        amountHeader = intl.get(`${commonPrompt}.occupiedOrAppliedAmount`).d('占用/核销金额');
        break;
    }
    const lindColumns = [
      {
        name: 'documentDate',
        width: 150,
      },
      {
        name: 'documentNum',
        width: 180,
      },
      {
        name: 'documentTypeMeaning',
        width: 150,
      },
      {
        header: amountHeader,
        name: 'amount',
        width: 120,
      },
      {
        name: 'incomingIdentityMeaning',
        width: 120,
      },
      {
        name: 'lotNum',
        width: 150,
      },
      {
        name: 'operatorName',
        width: 120,
      },
    ];

    if (aggregationMethod === 'document') {
      swap(lindColumns, 0, 1);
    }

    if (aggregationMethod === 'batch') {
      const index = dataSources === 'all' ? 5 : 4;
      swap(lindColumns, 1, index);
      swap(lindColumns, 0, 1);
    }

    if (dataSources !== 'all') {
      lindColumns.splice(4, 1);
    }

    if (dataSources === 'cancellation') {
      lindColumns.splice(5, 0, {
        name: 'parentDocumentNum',
        width: 150,
      });
    }

    return lindColumns;
  }, [dataSources, aggregationMethod]);

  const handleSelectView = ({ key }) => {
    setAggregationMethods(key);
    listDs.unSelectAll();
    listDs.clearCachedSelected();
    listDs.setQueryParameter('aggregationMethod', key);
    listDs.query();
  };

  const overlayMenu = useMemo(() => {
    const list = dataSources !== 'all' ? viewList.filter((ele) => ele.value !== 'batch') : viewList;
    return (
      <Menu
        onClick={handleSelectView}
        className={styles['occupied-or-applied-aggregation-view-menu']}
        defaultSelectedKeys={[aggregationMethod]}
      >
        {list.map((item) => (
          <Menu.Item
            key={item.value}
            className={styles['occupied-or-applied-aggregation-view-menu-item']}
          >
            {item.meaning}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [aggregationMethod, dataSources]);

  const aggregationView = useMemo(() => {
    return (
      <div className={styles['occupied-or-applied-aggregation-view']}>
        <Dropdown overlay={overlayMenu} trigger={['click']}>
          <span className={styles['occupied-or-applied-aggregation-view-control']}>
            {viewList.find((ele) => ele.value === aggregationMethod)?.meaning}
            <Icon
              type="expand_more"
              className={styles['occupied-or-applied-aggregation-view-expand']}
            />
          </span>
        </Dropdown>
      </div>
    );
  }, [aggregationMethod, overlayMenu]);

  useEffect(() => {
    if (budgetLineId) {
      fetchLineAmount(budgetLineId).then((res) => {
        if (getResponse(res)) {
          setAmountObj(res);
        }
      });
    }
    listDs.setQueryParameter('dataSources', 'all');
    listDs.setQueryParameter('aggregationMethod', 'detail');
    listDs.query();
  }, []);

  useEffect(() => {
    const handleUpdate = ({ name, value }) => {
      if (name === 'dataSources') {
        setDataSources(value);
        setAggregationMethods('detail');
        listDs.unSelectAll();
        listDs.clearCachedSelected();
        listDs.setQueryParameter(name, value);
        listDs.setQueryParameter('aggregationMethod', 'detail');
        listDs.query();
      }
    };

    dataSourcesDs.addEventListener('update', handleUpdate);

    return () => {
      dataSourcesDs.removeEventListener('update', handleUpdate);
    };
  }, [dataSourcesDs, listDs]);

  return (
    <>
      <div className={styles['occupied-or-applied-modal-content']}>
        <Formula activeKey={null} amountObj={amountObj} name="dataSources" />
        <SearchBarTable
          style={{ maxHeight: '720px' }}
          dataSet={listDs}
          columns={columns}
          mode={aggregationMethod === 'detail' ? '' : 'tree'}
          searchBarConfig={{
            fuzzyQueryCode: 'documentNum',
            fuzzyQueryName: intl.get(`${commonPrompt}.documentNumAndLineNum`).d('单据编码-行号'),
            right: {
              render: () => aggregationView,
            },
          }}
        />
      </div>
      <ModalFooter dataSet={listDs} />
    </>
  );
};

const Index = function Index({ record }) {
  const openModal = () => {
    const dataSourcesDs = new DataSet(dataSourcesDS());

    const renderTitle = () => {
      return (
        <>
          {intl.get(`${commonPrompt}.occupiedOrAppliedDetailTitle`).d('占用/核销明细')}
          <Divider type="vertical" />
          <Select
            className={styles['occupied-or-applied-source-select']}
            dataSet={dataSourcesDs}
            name="dataSources"
            clearButton={false}
          />
        </>
      );
    };

    Modal.open({
      title: renderTitle(),
      style: {
        width: 1090,
      },
      closable: true,
      drawer: true,
      children: (
        <OccupiedOrApplied
          budgetLineId={record.get('budgetLineId')}
          dataSourcesDs={dataSourcesDs}
        />
      ),
      // okText: intl.get(`hzero.common.button.close`).d('关闭'),
      cancelButton: false,
      footer: null,
    });
  };

  return (
    <>
      <a onClick={() => openModal()}>
        {intl.get(`${commonPrompt}.viewOccupiedOrAppliedDetail`).d('查看占用/核销记录')}
      </a>
    </>
  );
};

export default Index;
