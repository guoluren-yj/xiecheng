import React, { useMemo, useEffect } from 'react';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import { DataSet, Lov, Form, Select, Tooltip, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { saveCataProducts } from '@/services/productRecommendedService';
import notification from 'utils/notification';
// import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { openCategory, openCatalog } from '@/components/UnitTreeModal/pageTree';
import SupplierHocLov from '@/components/SupplierHocLov';

function QuickAdd(props) {
  const { modal, cataTreeList, dispatch, groupId, handleOk = (e) => e } = props;
  const typeList = [
    {
      value: 'CATEGORY',
      meaning: intl.get(`small.common.model.product.category`).d('商品分类'),
    },
    {
      value: 'CATALOG',
      meaning: intl.get('small.common.model.catalogName').d('目录'),
    },
    {
      value: 'SUPPLIER',
      meaning: intl.get('small.ProRecommend.model.supplier').d('供应商'),
    },
  ];
  useEffect(() => {
    if (isEmpty(cataTreeList)) {
      dispatch({
        type: 'productRecommended/fetchTypeTree',
      });
    }
  }, []);

  const ds = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          label: intl.get(`small.ProRecommend.model.quickAddType`).d('添加类型'),
          name: 'quickAddType',
          required: true,
        },
        {
          label: intl.get(`small.common.model.product.category`).d('商品分类'),
          name: 'catalogTypeLov',
          type: 'object',
          textField: 'categoryName',
          valueField: 'categoryId',
          ignore: 'always',
          lovPara: { tenantId: getCurrentOrganizationId() },
          computedProps: {
            required: ({ record }) => {
              return record.get('quickAddType') === 'CATEGORY';
            },
          },
        },
        {
          name: 'catalogLov',
          label: intl.get('small.common.model.catalogName').d('目录'),
          type: 'object',
          textField: 'catalogName',
          valueField: 'catalogId',
          computedProps: {
            required: ({ record }) => {
              return record.get('quickAddType') === 'CATALOG';
            },
          },
        },
        {
          name: 'supplierLov',
          label: intl.get('small.ProRecommend.model.supplier').d('供应商'),
          type: 'object',
          lovPara: { tenantId: getCurrentOrganizationId() },
          textField: 'supplierCompanyName',
          valueField: 'supplierCompanyId',
          computedProps: {
            required: ({ record }) => {
              return record.get('quickAddType') === 'SUPPLIER';
            },
          },
        },
      ],
    });
  }, []);

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const flag = await ds.validate();
    if (flag) {
      const { quickAddType, catalogTypeLov, catalogLov, supplierLov } = ds.current.toData();
      const data = {
        groupId,
        quickAddType,
      };
      switch (quickAddType) {
        case 'CATEGORY':
          data.dataId = catalogTypeLov.categoryId;
          break;
        case 'CATALOG':
          data.dataId = catalogLov.catalogId;
          break;
        case 'SUPPLIER':
          data.dataId = supplierLov.supplierCompanyId || supplierLov.supplierId;
          break;
        default:
          break;
      }
      const res = getResponse(await saveCataProducts(data));
      if (res) {
        notification.success();
        handleOk();
        return true;
      } else {
        return false;
      }
    }
    return flag;
  }

  const CurrentForm = observer(({ dataSet }) => {
    const quickAddType = dataSet?.current?.get('quickAddType');
    return (
      <Form dataSet={ds} labelLayout="float" columns={1}>
        <Select name="quickAddType" onChange={() => {}}>
          {typeList.map((g) => {
            return <Select.Option value={g.value}>{g.meaning}</Select.Option>;
          })}
        </Select>
        {quickAddType === 'CATEGORY' && (
          <Lov
            clearButton={false}
            name="catalogTypeLov"
            onClick={() => {
              openCategory({
                drawer: false,
                name: 'catalogTypeLov',
                record: ds.current,
              });
            }}
          />
        )}
        {quickAddType === 'CATALOG' && (
          <Lov
            clearButton={false}
            name="catalogLov"
            onClick={() => {
              openCatalog({
                drawer: false,
                name: 'catalogLov',
                record: ds.current,
              });
            }}
          />
        )}
        {quickAddType === 'SUPPLIER' && (
          <SupplierHocLov
            name="supplierLov"
            dataSet={ds}
            oldLovFieldsProps={[
              {
                name: 'supplierLov',
                lovCode: 'SMAL.SUPPLIER_BY_PUR',
                textField: 'supplierName',
                valueField: 'supplierId',
              },
            ]}
            addonAfter={
              <Tooltip
                title={intl
                  .get('small.ProRecommend.view.onlyAdd.cataProduct')
                  .d('仅支持供应商下目录化商品添加')}
              >
                <Icon type="help" style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: 16 }} />
              </Tooltip>
            }
          />
        )}
      </Form>
    );
  });

  return <CurrentForm dataSet={ds} />;
}
export default compose(
  connect(({ productRecommended }) => ({
    cataTreeList: productRecommended.cataTreeList || [],
  }))
)(QuickAdd);
