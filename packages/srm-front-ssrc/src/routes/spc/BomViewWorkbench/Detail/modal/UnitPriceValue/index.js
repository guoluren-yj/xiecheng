import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Table, Form, useDataSet } from 'choerodon-ui/pro';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { batchValidateData } from '@/routes/spc/FormulaManage/utils';
import ConstructForm from '../../components/BasicInfo/ConstructForm';
import { InputParamsDS } from './store';
import styles from './style.less';

const Index = (props) => {
  const { isEdit, modal, formDS, bomDetailsLineId } = props;
  const { dimensionType, templateCode, lineExtId } = formDS?.current?.toData() || {};

  const priceFlag = dimensionType === 'PRICE';
  const [loading, setLoading] = useState(true);
  // 输入参数
  const inputParamsDS = useDataSet(
    () => ({
      ...InputParamsDS({ templateCode, bomDetailsLineId, lineExtId }),
      selection: isEdit && DataSetSelection.multiple,
      queryParameter: {
        templateCode,
      },
    }),
    [isEdit, templateCode, bomDetailsLineId, lineExtId]
  );

  useEffect(() => {
    formDS.query().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!lineExtId || !templateCode) return;
    inputParamsDS.query().finally(() => {
      setLoading(false);
    });
  }, [lineExtId]);

  useEffect(() => {
    if (modal) {
      const { update } = modal;
      update({
        footer: () => <FooterBtns dataSet={inputParamsDS} btnLoading={loading} />,
      });
    }
  }, [loading, templateCode, dimensionType]);

  const columns = useMemo(
    () => [
      {
        name: 'dimensionCodeLov',
        width: 120,
        editor: isEdit,
      },
      {
        name: 'dimensionName',
        width: 120,
      },
      {
        name: 'defaultValue',
        editor: isEdit,
      },
    ],
    [isEdit]
  );

  const handleConfirm = async () => {
    const validateArr = [formDS];
    if (inputParamsDS?.length !== 0) {
      validateArr.push(inputParamsDS);
    }
    const validateFlag = await batchValidateData(validateArr);

    if (!validateFlag) return;
    formDS.current.set({
      lineDimList: inputParamsDS.toData(),
    });
    setLoading(true);
    const res = getResponse(
      await formDS.submit().finally(() => {
        setLoading(false);
      })
    );
    if (res) {
      modal.close();
    }
  };


  const FooterBtns = observer(({ dataSet, btnLoading }) => {
    return (
      <>
        {isEdit && (
          <Button
            loading={btnLoading}
            color="primary"
            // 单价为价格库取值，必须存在行才能确认
            // disabled={inputParamsDS?.length || 0}
            onClick={() => handleConfirm()}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        )}
        <Button onClick={() => modal.close()} {...(!isEdit ? { color: 'primary' } : {})}>
          {isEdit
            ? intl.get('hzero.common.button.cancel').d('取消')
            : intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </>
    );
  });

  const handleDelete = async () => {
    const selectedRows = inputParamsDS.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    inputParamsDS.remove(newAddRows);

    if (!isEmpty(existedRows)) {
      // 删除线上数据
      await inputParamsDS.delete(existedRows, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };


  return (
    <>
      <Form
        dataSet={formDS}
        columns={2}
        labelLayout={isEdit ? "float" : "vertical"}
        className={isEdit ? null : 'c7n-pro-vertical-form-display'}
      >
        <ConstructForm formType="Select" isEdit={isEdit} name="dimensionType" />
        {priceFlag ? (
          <ConstructForm formType="Lov" isEdit={isEdit} name="templateIdLov" />
        ) : (
          <ConstructForm formType="TextField" isEdit={isEdit} name="fixedValue" />
        )}
      </Form>
      {priceFlag && (
        <>
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.priceService.view.tab.inputParameters').d('输入参数')}
          </h3>
          <Table
            customizable
            customizedCode="SPC.PRICE_BOM_WORKBENCH.DETAIL.UNIT_PRICE_TABLE"
            dataSet={inputParamsDS}
            buttons={isEdit && ['add', [TableButtonType.delete, { icon: 'delete_sweep', onClick: handleDelete }]]}
            columns={columns}
            style={{
              maxHeight: '340px',
            }}
          />
        </>
      )}
    </>
  );
};

export default observer(Index);
