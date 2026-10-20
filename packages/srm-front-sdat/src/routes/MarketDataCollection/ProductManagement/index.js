/**
 * 2026-02-10 index.js
 * 商品管理页面
 * Version: 1.0.0
 * Last Update: 2026-02-10
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Icon,
  Dropdown,
  Menu,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
// import { getEnvConfig } from 'utils/iocUtils';
import StaticSearchBar from '@/components/StaticSearchBar';
import { ReactComponent as InitComp } from '@/assets/ill-price-data-manage.svg';

import {
  ProductListDS,
  ProductDetailDS,
  GetPriceDS,
  TieredPriceDS,
} from './stores/productManagementDS';
import ProductForm from './ProductForm';
import { getQueryConfig } from './queryConfig';
// import emptyStateImg from '../../../assets/icon/emptyState.png';
import {
  fetchChangeStatus,
  fetchSaveProduct,
  fetchInitData,
  fetchGetPrice,
} from '@/services/marketCollection/productManageService';
import ImportComp from './ImportComp';
import styles from './index.less';

function ProductManagement({ listDS }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    listDS.query().then(res => {
      if (getResponse(res) && res?.content?.length > 0) {
        setIsInitialized(true);
      }
    });
  }, []);

  const handleInit = () => {
    // 模拟初始化操作，实际应调用初始化 API
    Modal.confirm({
      title: intl.get('sdat.productManagement.view.message.initData').d('初始化数据'),
      children: intl.get('sdat.productManagement.view.message.initDataDesc').d('确定要初始化吗？'),
    }).then(async btn => {
      if (btn === 'ok') {
        const res = await fetchInitData();
        if (getResponse(res)) {
          setIsInitialized(res);
        }
      }
    });
  };

  /**
   * 商品更新订阅数据
   */
  const handleUpdateSubscriptionData = () => {
    Modal.confirm({
      title: intl
        .get('sdat.productManagement.view.message.confirmUpdateSubscriptionData')
        .d('更新订阅数据'),
      children: intl
        .get('sdat.productManagement.view.message.confirmUpdateSubscriptionDataDesc')
        .d(
          '同步平台数据会将平台最新的商品数据同步到当前租户下，最新的数据会覆盖原数据，同时获取最新的订单数据。确定要同步平台数据吗？'
        ),
    }).then(async btn => {
      if (btn === 'ok') {
        const res = await fetchInitData();
        if (getResponse(res)) {
          listDS.query();
        }
      }
    });
  };

  const handleCreate = item => {
    const detailDS = new DataSet(ProductDetailDS());

    if (item) {
      const obj = item?.toData() ?? {};
      const treeData = [];
      if (obj?.oneCategory !== '-') {
        treeData.push(obj?.oneCategory);
      }
      if (obj?.twoCategory !== '-') {
        treeData.push(obj?.twoCategory);
      }
      if (obj?.threeCategory !== '-') {
        treeData.push(obj?.threeCategory);
      }

      detailDS.loadData([
        {
          ...obj,
          commodityCode: obj.commodityCode?.startsWith('CUX_GD_')
            ? obj.commodityCode.substring(7)
            : `${obj.commodityCode}`,
          categoryTree: [...treeData],
        },
      ]);
    }
    Modal.open({
      title: item
        ? intl.get('sdat.productManagement.view.title.editProduct').d('编辑商品')
        : intl.get('sdat.productManagement.view.title.createProduct').d('新建商品'),
      drawer: true,
      style: { width: 372 },
      children: <ProductForm dataSet={detailDS} editMode={!!item} />,
      onOk: async () => {
        const iaValid = await detailDS.validate();

        if (iaValid) {
          const obj = detailDS?.toData()?.[0] ?? {};
          const res = await fetchSaveProduct({
            ...obj,
            commodityCode: `CUX_GD_${obj.commodityCode}`,
          });
          if (getResponse(res)) {
            listDS.query();
          }
        } else {
          return false;
        }
      },
    });
  };

  /**
   * 启用禁用操作
   * @param {*} record
   * @returns
   */
  const handleDisable = async record => {
    const isActive = record.get('enabledFlag') == '1';

    if (isActive) {
      return Modal.confirm({
        title: intl.get('sdat.productManagement.view.message.confirmMsg').d('信息确认'),
        children: intl
          .get('sdat.productManagement.view.message.confirmDisableDesc')
          .d('禁用后，该商品将无法被使用，影响较大，确定要禁用吗？'),
      }).then(async btn => {
        if (btn === 'ok') {
          const obj = record?.toData() ?? {};
          const res = await fetchChangeStatus({
            ...obj,
            enabledFlag: isActive == '1' ? '0' : '1',
          });
          if (getResponse(res)) {
            listDS.query();
          }
        }
      });
    } else {
      const obj = record?.toData() ?? {};
      const res = await fetchChangeStatus({
        ...obj,
        enabledFlag: isActive == '1' ? '0' : '1',
      });
      if (getResponse(res)) {
        listDS.query();
      }
    }
  };

  const handleImport = record => {
    let modal = null;

    const handleClose = () => {
      if (modal) modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.productManagement.view.title.importData').d('导入数据'),
      style: { width: '372px' },
      drawer: true,
      bodyStyle: { padding: 0 },
      children: <ImportComp record={record} handleClose={handleClose} />,
      footer: null,
      // footer: () => {
      //   return (
      //     <>
      //       <Button color="primary" onClick={handleOk}>
      //         {intl.get('hzero.common.btn.ok').d('确定')}
      //       </Button>
      //       <Button onClick={handleClose}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
      //     </>
      //   );
      // },
    });
  };

  const handleTieredPrice = record => {
    let modal = null;
    const tieredPriceDS = new DataSet(TieredPriceDS());
    tieredPriceDS.setQueryParameter('commodityCode', record.get('commodityCode'));
    tieredPriceDS.query();

    const handleClose = () => {
      if (modal) modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.productManagement.view.title.tieredPrice').d('阶梯价'),
      drawer: true,
      style: { width: 800 },
      children: (
        <Table dataSet={tieredPriceDS} queryBar="none">
          <Table.Column name="priority" />
          <Table.Column name="tieredName" />
          <Table.Column name="tieredCode" />
        </Table>
      ),
      footer: () => {
        return (
          <Button color="primary" onClick={handleClose}>
            {intl.get('sdat.productManagement.button.close').d('关闭')}
          </Button>
        );
      },
      closable: true,
    });
  };

  /**
   * 获取价格操作
   * @param {*} record
   */
  const handleGetPrice = record => {
    let modal = null;
    const startDate = record?.get('startDate') ?? null;
    const endDate = record?.get('endDate') ?? null;
    const getPriceDS = new DataSet(GetPriceDS(startDate, endDate));

    const handleClose = () => {
      if (modal) modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.productManagement.view.title.getPrice').d('获取价格'),
      style: { width: '372px' },
      drawer: true,
      bodyStyle: { padding: 0 },
      children: (
        <div className={styles['price-modal-form']}>
          <Alert
            style={{ margin: '4px' }}
            message={intl.get('sdat.productManagement.view.message.getPriceTip', {
              effectiveDateFrom: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
              effectiveDateTo: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
            })}
            showIcon
            iconType="help"
          />
          <div style={{ marginTop: '20px', padding: '0 20px' }}>
            <Form dataSet={getPriceDS} labelLayout="float">
              <DatePicker name="priceDate" />
            </Form>
          </div>
        </div>
      ),
      onCancel: handleClose,
      onOk: async () => {
        const isValid = await getPriceDS.validate();
        if (isValid) {
          const data = getPriceDS.toData();
          const rangeDate = data?.length ? data[0]?.priceDate : [];
          const startDate = rangeDate?.[0] ?? null;
          const endDate = rangeDate?.[1] ?? null;

          const param = {
            commodityCode: record.get('commodityCode'),
            startDate,
            endDate,
          };

          fetchGetPrice({ ...param }).then(res => {
            if (getResponse(res)) {
              notification.success();
              handleClose();
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      },
    });
  };

  const renderInitPage = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 186px)',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', height: '160px' }}>
        <InitComp style={{ width: '300px', height: '160px' }} />
      </div>
      <div style={{ marginTop: '24px', fontSize: '16px', fontWeight: '600', color: '#1D2129' }}>
        {intl.get('sdat.productManagement.view.title.dataInit').d('数据初始化')}
      </div>
      <div style={{ marginTop: '8px', color: '#868D9C', fontSize: '14px' }}>
        {intl
          .get('sdat.productManagement.view.message.initDesc')
          .d('首次使用该功能，需要先进行初始化相应商品数据，点进按钮会进行相关数据载入。')}
      </div>
      <Button color="primary" icon="sync" onClick={handleInit} style={{ marginTop: '24px' }}>
        {intl.get('sdat.productManagement.button.initData').d('初始化数据')}
      </Button>
    </div>
  );

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const typeMap = {
    0: styles['status-disabled'],
    1: styles['status-manue'],
  };

  const columns = [
    {
      name: 'effectiveFlag',
      width: 100,
      lock: 'left',
      renderer: ({ value, text }) => {
        const classes = classMap[value];
        return <span className={classes}>{text}</span>;
      },
    },
    { name: 'commodityCode', width: 140 },
    { name: 'commodityName', width: 140 },
    { name: 'oneCategoryName', width: 160 },
    { name: 'twoCategoryName', width: 160 },
    { name: 'threeCategoryName', width: 160 },
    {
      name: 'tieredPricing',
      width: 80,
    },
    {
      name: 'viewTieredPrice',
      width: 80,
      header: intl.get('sdat.productManagement.button.tieredPrice').d('阶梯价'),
      renderer: ({ record }) => {
        const tieredPricing = record.get('tieredPricing');
        return tieredPricing == '1' ? (
          <a onClick={() => handleTieredPrice(record)} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.view.title.view').d('查看')}
          </a>
        ) : (
          '-'
        );
      },
    },
    { name: 'remark', width: 200 },
    {
      name: 'type',
      renderer: ({ value, text }) => {
        const classes = typeMap[value];
        return <span className={classes}>{text}</span>;
      },
    },

    {
      name: 'startDate',
      width: 160,
    },
    { name: 'endDate', width: 160 },
    {
      name: 'operation',
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 250,
      renderer: ({ record }) => {
        const type = record.get('type');
        const effectiveFlag = record.get('effectiveFlag');

        return (
          <span className={styles['action-container']}>
            {type == '1' ? (
              <Button
                funcType="link"
                onClick={() => handleDisable(record)}
                style={{ marginRight: 8 }}
              >
                {effectiveFlag == '1'
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </Button>
            ) : null}
            {type == '0' ? (
              <>
                <a onClick={() => handleGetPrice(record)}>
                  {intl.get('sdat.productManagement.button.getPrice').d('获取价格')}
                </a>
              </>
            ) : null}
            {type == '1' ? (
              <>
                <a onClick={() => handleCreate(record)} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                {effectiveFlag == '1' ? (
                  <a onClick={() => handleImport(record)}>
                    {intl.get('hzero.common.button.importData').d('导入数据')}
                  </a>
                ) : null}
              </>
            ) : null}
          </span>
        );
      },
    },
  ];

  const menu = () => {
    return (
      <Menu>
        <Menu.Item key="0" onClick={() => handleCreate('')}>
          {intl.get('sdat.productManagement.button.createProduct').d('新建商品')}
        </Menu.Item>
        <Menu.Item key="1" onClick={() => handleUpdateSubscriptionData()}>
          {intl.get('sdat.productManagement.button.updateSubscriptionData').d('更新订阅数据')}
        </Menu.Item>
      </Menu>
    );
  };

  const handleFilterQueryAll = ({ params }) => {
    const { startDateRange_range, endDateRange_range } = params;

    if (startDateRange_range) {
      const dateList = startDateRange_range.split(',');
      params.startDateStart = moment(dateList[0]).format('YYYY-MM-DD 00:00:00');
      params.startDateEnd = moment(dateList[1]).format('YYYY-MM-DD 23:59:59');
    }

    if (endDateRange_range) {
      const dateList = endDateRange_range.split(',');
      params.endDateStart = moment(dateList[0]).format('YYYY-MM-DD 00:00:00');
      params.endDateEnd = moment(dateList[1]).format('YYYY-MM-DD 23:59:59');
    }

    delete params.startDateRange_range;
    delete params.endDateRange_range;

    listDS.queryParameter = { ...params };
    listDS.query();
  };

  return (
    <>
      <Header title={intl.get('sdat.productManagement.view.title.productManagement').d('商品管理')}>
        {isInitialized && (
          <Dropdown overlay={menu}>
            <Button icon="add" color="primary">
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '4px' }}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </span>
                <Icon type="expand_more" />
              </span>
            </Button>
          </Dropdown>
        )}
      </Header>
      <div
        style={{
          margin: '8px',
          padding: '16px',
          height: 'calc(100vh - 148px)',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {!isInitialized ? (
          renderInitPage()
        ) : (
          <div>
            <StaticSearchBar
              cacheState
              clearButton
              searchCode="SDAT.DATA_COLLECTION_PRODUCT_MANAGE_LIST"
              filters={getQueryConfig()}
              dataSet={[listDS]}
              onQuery={handleFilterQueryAll}
              showLoading={false}
              // defaultExpand={false}
            />
            <div style={{ height: 'calc(100vh - 320px)' }}>
              <Table
                queryBar="none"
                dataSet={listDS}
                columns={columns}
                queryFieldsLimit={3}
                customizable
                customizedCode="SDAT.DATA_COLLECTION_PRODUCT_MANAGE_LIST"
                autoHeight={{ type: 'maxHeight', diff: 20 }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.productManagement'],
})(
  withProps(
    () => {
      const listDS = new DataSet(ProductListDS());
      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(ProductManagement)
);
