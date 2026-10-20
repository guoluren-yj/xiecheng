/*
 * CategoryMaterialModal - 推荐物料/品类
 * @date: 2023/10/24 15:12:06
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useEffect, Fragment } from 'react';
import { Form, useDataSet } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
// import notification from 'utils/notification';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCategoryMaterialDS } from './stores/index';
import '@/routes/index.less';
import styles from '../../../index.less';

const Index = ({
  customizeForm,
  custLoading,
  customizeUnitCode = '',
  isEdit = true,
  modal,
  handleBatchEditSave,
  isAllSelectFlag,
  tableDs,
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
        const formData = (categoryMaterialDs.current && categoryMaterialDs.current.toData()) || {};
        if (!isEmpty(formData)) {
          if (validateFlag) {
            handleBatchEditSave(formData);
            tableDs.query();
            return true;
          } else {
            return false;
          }
        } else {
          return true;
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
        className={styles[`category-material-alert`]}
      />
      {customizeForm(
        {
          code: customizeUnitCode,
        },
        <Form
          className={styles.createForm}
          labelLayout="float"
          useWidthPercent
          dataSet={categoryMaterialDs}
          columns={1}
          custLoading={custLoading}
          style={style}
        >
          <FormField isEdit={isEdit} name="supplyFlag" clearButton={false} componentType="SELECT" />
          <FormField isEdit={isEdit} name="adapterProducts" />
          <FormField isEdit={isEdit} name="countryLov" componentType="LOV" />
          <FormField isEdit={isEdit} name="regionLov" componentType="LOV" />
          <FormField isEdit={isEdit} name="cityLov" componentType="LOV" />
          <FormField isEdit={isEdit} name="dateFrom" componentType="DATEPICKER" />
          <FormField isEdit={isEdit} name="dateTo" componentType="DATEPICKER" />
          <FormField isEdit={isEdit} name="purchaseOrganizationLov" componentType="LOV" />
          <FormField isEdit={isEdit} name="inventoryOrganizationId" componentType="LOV" />
          <FormField isEdit={isEdit} name="manufacturer" />
          <FormField isEdit={isEdit} name="remark" resize="both" componentType="TextArea" />
        </Form>
      )}
    </Fragment>
  );
};

export default Index;
