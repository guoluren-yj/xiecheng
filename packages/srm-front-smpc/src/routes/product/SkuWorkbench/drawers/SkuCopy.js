import React, { useMemo } from 'react';
import { Form, DataSet, CheckBox } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { flowRight } from 'lodash';
import qs from 'qs';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';
import SupplierHocLov from '@/components/SupplierHocLov';
import { copySkuInfo } from '../api';

import Info from '../../SkuCreate/Info';
import { copyDs } from './ds';

function SkuCopy(props) {
  const ds = useMemo(() => new DataSet(copyDs()), []);

  const {
    modal,
    selectSkus,
    afterCallback = (e) => e,
    history: { push },
    location: { pathname },
  } = props;
  modal.handleOk(async () => {
    const unitData = ds.current.toJSONData();
    const params = {
      ...unitData,
      skuList: selectSkus.map((r) => ({ skuId: r.get('skuId'), spuId: r.get('spuId') })),
    };
    const isSameSpu = [...new Set(selectSkus.map((f) => f.get('spuId')))].length === 1;
    if (selectSkus.length === 1 || isSameSpu) {
      const res = getResponse(await copySkuInfo(params));
      if (res) {
        push({
          pathname: `${pathname.split('/list')[0]}/create`,
          search: qs.stringify(
            filterNullValueObject({
              spuId: res,
            })
          ),
        });
      }
    } else {
      const res = getResponse(await copySkuInfo(params));
      if (res) {
        notification.success();
        afterCallback();
      }
    }
    return true;
  });
  return (
    <>
      <Info
        style={{ color: 'rgb(45,147,241)', backgroundColor: 'rgb(234,244,253)' }}
        iconStyle={{ alignSelf: 'flex-start', marginTop: 8 }}
        message={intl
          .get('smpc.product.view.auth.copyHelpInfo')
          .d('未选择供应商时取原商品上的供应商，来源于价格库的商品价格信息不可编辑')}
      />
      <Form dataSet={ds} labelLayout="float" columns={1} style={{ padding: 20 }}>
        <SupplierHocLov
          name="supplierLov"
          dataSet={ds}
          oldLovFieldsProps={[
            {
              name: 'supplierLov',
              lovCode: 'SMPC.SELF_PUR_SUPPLIER',
              textField: 'supplierName',
              valueField: 'supplierId',
            },
            {
              name: 'supplierCompanyId',
              bind: 'supplierLov.supplierId',
            },
          ]}
        />
        <CheckBox name="priceCopyFlag" />
      </Form>
    </>
  );
}

export default flowRight(withRouter)(SkuCopy);
