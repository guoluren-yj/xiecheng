import React, { useMemo, useEffect, useCallback, Fragment } from 'react';
import { Form, DataSet, Lov, TextField, Switch } from 'choerodon-ui/pro';
import type { Record } from 'choerodon-ui/dataset';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import { pick } from 'lodash';

import intl from 'utils/intl';

// import type { StoreValueType } from '../stores';
// import { Store } from '../stores';
import { modifyGoodsMappingDS } from '../stores/listDS';
import DynamicAlert from '../../../Components/DynamicAlert';

interface ModifyGoodsMappingProps {
  modal?: any,
  record?: Record,
  action: 'modify' | 'create',
  onOk: Function
}

const ModifyGoodsMapping = (props: ModifyGoodsMappingProps) => {

  const { modal, record, action, onOk } = props;
  // const { currentTableDs, getTotalCount } = useContext<StoreValueType>(Store);

  const modifyFlag = action === 'modify';
  const modifyGoodsMappingDs = useMemo<DataSet>(() => new DataSet(modifyGoodsMappingDS()), []);

  const handleOk = useCallback(async () => {
    const validateFlag = await modifyGoodsMappingDs.validate();
    if (!validateFlag) return false;
    const res = await modifyGoodsMappingDs.submit();
    if (!res) return false;
    if (onOk) onOk();
  }, [modifyGoodsMappingDs, onOk]);

  const handleUpdateRecord = useCallback(({ name, value, record }) => {
    if (name === 'partnerItemLov') {
      // 单位、默认税率由客户公司物料带出，也可以自己选择
      record.set(pick(value, ['uomCode', 'taxRate', 'taxId', 'taxCode']));
    }
    if (name === 'companyLov') {
      record.set('partnerItemLov', undefined);

    }
  }, []);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
    if (record && modifyFlag) modifyGoodsMappingDs.loadData([record.toData()]);
    modifyGoodsMappingDs.addEventListener('update', handleUpdateRecord);
    return () => {
      modifyGoodsMappingDs.removeEventListener('update', handleUpdateRecord);
    };
  }, [modal, handleOk, record, modifyFlag, modifyGoodsMappingDs, handleUpdateRecord]);

  return (
    <Fragment>
      {modifyFlag && (
        <DynamicAlert
          placement='modal-top'
          message={intl
            .get(`ssta.goodsInfo.view.message.modifyGoodsMappingAlert`)
            .d('本次修改仅影响未来新建的单据，历史或正在进行中的单据即已做过税收商品转换的物料不同步变更！')}
        />
      )}
      <Form dataSet={modifyGoodsMappingDs} labelLayout={LabelLayout.float}>
        <Lov name="companyLov" />
        <Lov name="partnerItemLov" />
        <TextField name="partnerItemName" />
        <TextField name="model" />
        <Lov name="uomLov" />
        <Lov name="taxRateLov" />
        <Lov name="commodityLov" />
        <TextField name="commodityCode" />
        <TextField name="commodityServiceCateCode" disabled />
        <TextField name="supUnifiedSocialCode" disabled />
        <Switch name="enabledFlag" />
      </Form>
    </Fragment>

  );
};

export default ModifyGoodsMapping;