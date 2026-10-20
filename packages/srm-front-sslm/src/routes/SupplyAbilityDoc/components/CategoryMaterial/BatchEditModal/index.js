/*
 * CategoryMaterialModal - 批量编辑-推荐物料/品类
 * @date: 2023/10/24 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useEffect, Fragment } from 'react';
import { Form, useDataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import FormField from '@/routes/components/FormField';
import '@/routes/index.less';

import { getCategoryMaterialDS } from './stores/getCategoryMaterialModalDS';
import styles from '../index.less';

const Index = ({
  customizeForm,
  custLoading,
  tableCode = '',
  isEdit = true,
  modal,
  handleBatchEditSave = () => {},
  isAllSelectFlag,
  tableDs,
  purchaserCreateFlag = true,
}) => {
  const style = { marginBottom: 20, width: '100%' };
  const categoryMaterialDs = useDataSet(() => getCategoryMaterialDS(), []);

  useEffect(() => {
    modal.update({
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        // 表单数据校验
        const validateFlag = await categoryMaterialDs.validate();
        // 表单数据
        const formData = categoryMaterialDs.toJSONData();
        if (isEmpty(formData)) {
          return true;
        }
        const currentData = formData[0];
        const filterNullData = filterNullValueObject(currentData);
        if (isEmpty(filterNullData)) {
          return true;
        }
        if (validateFlag) {
          return new Promise(resolve => {
            handleBatchEditSave(currentData).then(res => {
              if (res) {
                tableDs.query();
                resolve(true);
              } else {
                resolve(false);
              }
            });
          });
        } else {
          return false;
        }
      },
    });
  }, []);
  const alertMessage = isAllSelectFlag
    ? intl
        .get(`sslm.supplyAbility.view.message.alert.editingForAllData`)
        .d('针对全部数据进行批量编辑')
    : intl
        .get(`sslm.supplyAbility.view.message.alert.editingForSelectedData`)
        .d('针对勾选数据进行批量编辑');

  return (
    <Fragment>
      <Alert
        banner
        showIcon
        type="info"
        iconType="help"
        message={alertMessage}
        className={styles['batch-change-supply-ability-alert']}
      />
      {customizeForm(
        {
          code: tableCode,
        },
        <Form
          className={styles['batch-change-supply-ability-form']}
          labelLayout="float"
          useWidthPercent
          dataSet={categoryMaterialDs}
          columns={1}
          custLoading={custLoading}
          style={style}
        >
          <FormField isEdit={isEdit} name="supplyFlag" clearButton={false} componentType="SELECT" />
          <FormField isEdit={isEdit} name="dateFrom" componentType="DATEPICKER" />
          <FormField isEdit={isEdit} name="dateTo" componentType="DATEPICKER" />
          <FormField isEdit={isEdit} name="countryId" componentType="LOV" />
          <FormField isEdit={isEdit} name="regionId" componentType="LOV" />
          <FormField isEdit={isEdit} name="cityId" componentType="LOV" />
          <FormField isEdit={isEdit} name="manufacturer" />
          <FormField isEdit={isEdit} name="adapterProducts" />
          <FormField isEdit={isEdit} name="remark" resize="vertical" componentType="TextArea" />
          <FormField
            isEdit={isEdit}
            name="purchaseOrganizationId"
            componentType="LOV"
            hidden={!purchaserCreateFlag}
          />
          <FormField
            isEdit={isEdit}
            name="inventoryOrganizationId"
            componentType="LOV"
            hidden={!purchaserCreateFlag}
          />
        </Form>
      )}
    </Fragment>
  );
};

export default Index;
