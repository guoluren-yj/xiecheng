import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from '_components/FilterBarTable';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import AddOtherProduct from 'srm-front-smpc/lib/components/AddOtherProduct';
import { Card, Alert, Icon } from 'choerodon-ui';
import { isFunction } from 'lodash';
// import notification from 'utils/notification';

import { Form, Lov, TextField } from 'choerodon-ui/pro';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import styles from './index.less';

const Index = function Index({ referLineDs, headerDs, ...props }) {
  const cols = [
    { name: 'supplierCompanyNum', width: 150 },
    { name: 'supplierCompanyName', width: 200 },

    { name: 'taxPrice', width: 100 },
    { name: 'taxRate', width: 80 },
    { name: 'unitPrice', width: 100 },
    { name: 'marketPrice', width: 100 },
    { name: 'currencyCode', width: 80 },
    { name: 'uomName', width: 100, renderer: ({ record }) => record?.get('uomCodeAndName') },
    { name: 'prPriceSourceMeaning', width: 100 },
    { name: 'validDateFrom', width: 150 },
    { name: 'validDateTo', width: 150 },
    { name: 'orderNum', width: 150 },
    { name: 'skuCodeAndName', width: 150 },
    {
      name: 'supplierCode',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 200,
    },
    { name: 'creationDate', width: 150 },
    { name: 'productEcSourceFrom', width: 150 },
    { name: 'ecLimitQuantity', width: 150 },
  ];
  const AddOtherProductBtn = observer(() => {
    const addressInfo = headerDs?.current?.get('defaultOrderingAddressId');
    return (
      <AddOtherProduct
        addressInfo={{
          ...addressInfo,
          prLineId: headerDs?.current?.get('prLineId'),
          companyId: headerDs?.current?.get('companyId'),
        }}
        onOkCallback={() => {
          referLineDs.query();
        }}
        buttonProps={{
          disabled: !addressInfo,
          icon: 'add',
        }}
      />
    );
  });

  const handleQuery = (parm) => {
    const { params = {} } = parm || { params: {} };
    const clearParams = {}; // 清理
    const { customizeOrderField = undefined } = params;
    const dataObj = referLineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['queryPriceAddressId'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    referLineDs.setQueryParameter(
      'queryPriceAddressId',
      headerDs?.current?.get('defaultOrderingAddressId')?.addressId
    );
    referLineDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    referLineDs.queryDataSet.current
      ? referLineDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : referLineDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    referLineDs.query();
  };
  const { cuxSupplierModalCols = undefined } = props;

  const cuxCols = isFunction(cuxSupplierModalCols) ? cuxSupplierModalCols(cols) : cols;

  return (
    <div>
      <Alert
        className={styles['batch-all-edit-alert']}
        border={false}
        message={
          <div className={styles['batch-all-edit-alert-message']}>
            <Icon type="help" />{' '}
            {intl
              .get('sprm.common.purExecution.supplierModal.noticeAlert')
              .d('温馨提示：如果收货地址为空，无法查询商品有效性，建议请先选择地址后操作。')}
          </div>
        }
        closable
      />
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('sprm.common.model.supplierModal.chooseAddress').d('选择收货地址')}
      >
        <Form dataSet={headerDs} columns={3} labelLayout="float">
          <Lov name="defaultOrderingAddressId" onChange={handleQuery} />
          <TextField name="defaultContactPerson" disabled />
          <TextField name="defaultContactPhone" disabled />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('sprm.common.model.supplierModal.itemInfo').d('物料信息')}
      >
        <Form dataSet={headerDs} columns={3} labelLayout="float">
          <TextField name="itemCode" disabled />
          <TextField name="itemName" disabled />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('sprm.common.model.supplierModal.chooseSupplier').d('选择供应商及价格')}
      >
        <FilterBarTable
          dataSet={referLineDs}
          customizable
          columns={cuxCols}
          filterBarConfig={{
            checkDataSetStatus: false,
            autoQuery: true,
            collpaseble: false,
            expandable: false,
            onQuery: handleQuery,
          }}
          onRow={(row) => {
            const handleSelect = ({ dataSet, record: _record }) => {
              if (dataSet && _record) {
                dataSet.select(_record);
              }
            };
            return {
              onClick: () => handleSelect(row),
            };
          }}
          buttons={[<AddOtherProductBtn />]}
          customizedCode="sprm-supplier-choose_list"
          style={{ maxHeight: 'calc(100vh - 410px)' }}
        />
      </Card>
    </div>
  );
};

export default formatterCollections({
  code: [
    'entity.supplier',
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'sodr.sendOrder',
    'sodr.common',
    'smpc.product',
  ],
})(Index);
