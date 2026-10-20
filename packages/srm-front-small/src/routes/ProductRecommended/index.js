/* eslint-disable eqeqeq */
import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';
import { Tag } from 'choerodon-ui';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import remote from 'hzero-front/lib/utils/remote';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import { getResponse } from 'utils/utils';
import { disableProductGroup, deleteProductGroup } from '@/services/productRecommendedService';
import ChooseRole from '@/components/ChooseRole';
import { dateRender } from 'utils/renderer';

import { tableDs } from './tableDs';
import styles from './index.less';
import ListModal from './ListModal';

function ProductRecommended(props) {
  const {
    history,
    productRecommended: { currentRole, purchase, lovBatch },
    dispatch,
    match: { path = '' },
    productRecommendedRemote,
  } = props;
  const initDs = useMemo(() => {
    return new DataSet(tableDs());
  }, []);

  useEffect(() => {
    dispatch({
      type: 'productRecommended/initQueryIdp',
    });
  }, []);

  function checkUnit() {
    if (currentRole === 'purchase' && !purchase?.unitId) {
      notification.warning({
        message: intl.get('small.common.purchase.choose.warning').d('请先选择采买组织'),
      });
      return false;
    }
    return true;
  }

  const handleEdit = (record, resetFlag) => {
    if (!checkUnit()) return;
    c7nModal({
      title: !record
        ? intl.get(`small.common.model.createSkuList`).d('新建商品集合')
        : intl.get('small.common.model.editSkuList').d('编辑商品集合'),
      children: (
        <ListModal
          resetFlag={resetFlag}
          path={path}
          record={record}
          belongType={currentRole === 'purchase' ? 1 : 0}
          unitId={purchase?.unitId}
          okCallBack={() => initDs.query()}
          productRecommendedRemote={productRecommendedRemote}
        />
      ),
      style: { width: '742px' },
      closable: false,
      okText: intl.get('small.common.modal.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleDisable = async (params) => {
    const resp = getResponse(await disableProductGroup(params));
    if (resp) {
      await initDs.query();
    }
  };

  const handleDelete = (params) => {
    Modal.confirm({
      title: intl.get('small.common.model.tips').d('提示'),
      children: intl.get('small.common.view.confirmDelete').d('确认删除？'),
      onOk: async () => {
        const resp = getResponse(await deleteProductGroup(params));
        if (resp) initDs.query();
      },
    });
  };

  const fetchList = (params = {}) => {
    initDs.setQueryParameter('belongType', currentRole === 'purchase' ? 1 : 0);
    initDs.setQueryParameter('unitId', purchase?.unitId);
    initDs.setQueryParameter('filterParams', { ...params });
    initDs.setQueryParameter('customizeUnitCode', 'SMAL.PRODUCT_GROUP.SEARCH_BAR');
    if ((currentRole === 'purchase' && purchase?.unitId) || currentRole === 'tenant') {
      initDs.query();
    }
  };

  const columns = [
    {
      width: 80,
      name: 'serialNumber',
    },
    {
      width: 100,
      name: 'enabledFlag',
      renderer: ({ record, value }) => (
        <Tag border={false} color={+record.get('enabledFlag') === 1 ? 'green' : 'red'}>
          {lovBatch.enabledFlag?.find(item => item.value === value)?.meaning}
        </Tag>
      ),
    },
    {
      name: 'groupName',
      renderer: ({ record, value }) => (
        <Button funcType="link" color="primary" onClick={() => handleEdit(record)}>
          {value}
        </Button>
      ),
    },
    {
      name: 'about',
      header: intl.get('small.ProRecommend.model.Correlation').d('关联情况'),
      renderer: ({ record }) => {
        const productUseByCustomTagDTOList = record.get('productUseByCustomTagDTOList') || [];
        const aboutRender = productUseByCustomTagDTOList
          .map(
            n =>
              `${n.useType === 0 ? intl.get(`small.ProRecommend.model.bar`).d('自定义栏') : 'Banner'
              }-${n.useName}`
          )
          .join('、');
        return aboutRender;
      },
    },
    {
      width: 100,
      name: 'groupAttribute',
      renderer: ({ value }) => {
        return lovBatch.groupAttribute?.find(item => item.value === value)?.meaning;
      },
    },
    {
      width: 120,
      name: 'groupType',
      renderer: ({ value }) => {
        return lovBatch.groupType?.find(item => item.value === value)?.meaning;
      },
    },
    {
      width: 200,
      name: 'validityDate',
      renderer: ({ record }) => {
        return `${dateRender(record.get('startDate') || '')}~${dateRender(record.get('endDate') || '')}`;
      },
    },
    {
      width: 160,
      name: 'operation',
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          {record.get('enabledFlag') == 1 ? (
            <Button
              funcType="link"
              color="primary"
              onClick={() =>
                handleDisable({
                  groupId: record.get('groupId'),
                  enabledFlag: 0,
                  objectVersionNumber: record.get('objectVersionNumber'),
                })
              }
            >
              {intl.get('hzero.common.button.disable').d('禁用')}
            </Button>
          ) : (
            <Button
              funcType="link"
              color="primary"
              onClick={async () => {
                const data = record.toData();
                // 时间失效，打开弹框
                if (data.endDate && moment(data.endDate).isBefore(moment().format('YYYY-MM-DD'))) {
                  handleEdit(record, true);
                } else {
                  handleDisable({
                    groupId: record.get('groupId'),
                    enabledFlag: 1,
                    objectVersionNumber: record.get('objectVersionNumber'),
                  });
                }
              }}
            >
              {intl.get('hzero.common.button.enable').d('启用')}
            </Button>
          )}
          {+record.get('enabledFlag') === 0 && (
            <Button
              funcType="link"
              color="primary"
              style={{ marginLeft: 16 }}
              onClick={() =>
                handleDelete([
                  {
                    groupId: record.get('groupId'),
                    objectVersionNumber: record.get('objectVersionNumber'),
                  },
                ])
              }
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        </span>
      ),
    },
  ];
  return (
    <React.Fragment>
      <div className={styles.content}>
        <Header title={intl.get('small.ProductRecommend.view.newTitle').d('商品推荐列表')}>
          <ChooseRole
            defaultRole={currentRole}
            defaultData={purchase}
            onChange={(params) => {
              const { role, purchase: data = {} } = params;
              dispatch({
                type: 'productRecommended/updateState',
                payload: {
                  currentRole: role,
                  purchase: data,
                },
              });
              initDs.setQueryParameter('unitId', data?.unitId);
              initDs.setQueryParameter('belongType', role === 'purchase' ? 1 : 0);
              if ((role === 'purchase' && data?.unitId) || role === 'tenant') {
                initDs.query();
              } else {
                initDs.loadData([]);
              }
            }}
          />
          <div className="operate-btns">
            <Button
              funcType="flat"
              icon="application_model"
              onClick={() => {
                history.push('/small/mall-home-config');
              }}
            >
              {intl.get('small.common.button.mall.zhuangxiu').d('商城装修')}
            </Button>
            <Button color="primary" icon="add" className="add-btn" onClick={() => handleEdit()}>
              {intl.get(`small.common.model.create`).d('新建')}
            </Button>
          </div>
        </Header>
      </div>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          <SearchBarTable
            dataSet={initDs}
            columns={columns}
            searchCode="SMAL.PRODUCT_GROUP.SEARCH_BAR"
            customizedCode="SMAL.PRODUCT.GROUP.LIST"
            searchBarConfig={{
              onQuery: (params) => fetchList(params),
            }}
            style={{ maxHeight: `calc(100% - 22px)` }}
          />
        </div>
      </Content>
    </React.Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['small.ProductRecommend', 'small.ProRecommend', 'small.common'],
  }),
  remote({
    code: 'SMAll_PRODUCT-RECOMMENDED_LIST',
    name: 'productRecommendedRemote',
  }),
  connect(({ productRecommended }) => ({
    productRecommended,
  }))
)(ProductRecommended);
