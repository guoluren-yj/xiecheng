import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import querystring from 'querystring';
import { tableDataSet, intlPrompt } from './initialDs';
import { observer } from 'mobx-react-lite';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';

const DeleteButton = observer(({ dataSet } : { dataSet: DataSet }) => {
  const handleDelete = async () => {
    const modalRes = await Modal.confirm({
      title: intl.get(`hzero.common.message.confirm`).d('提示'),
      children: intl.get(`${intlPrompt}.view.deleteConfirmDelete`).d('删除后重新导入请关闭弹窗点击保存后再进行导入'),
    });
    if (modalRes !== 'ok') return;
    dataSet.remove(dataSet.selected, true);
  }

  return <Button
        icon="delete"
        color={ButtonColor.primary}
        funcType={FuncType.flat}
        disabled={dataSet.selected?.length < 1}
        onClick={() => handleDelete()}
      >
        {intl.get(`${intlPrompt}.view.button.batchDelete`).d('批量删除')}
      </Button>
})

const SupplementaryContractInformation = (props) => {
  const { href, modal, pageData } = props;
  const { record } = pageData || {};
  const attributeVarchar28 = record && record.get('attributeVarchar28');
  const attributeLongtext60 = record && record.get('attributeLongtext60');
  const tableDs = useMemo(() => new DataSet(tableDataSet(attributeVarchar28)), [attributeVarchar28]);
  const modalSearch = href?.substr(href?.indexOf('?'), href?.length);
  // type 单据来源 pc【合同】/payment【付款】/prePayment【预付款】
  const { edit, type } = querystring.parse(modalSearch?.substr(1));
  const editorFlag = useMemo(() => edit === '1' ? true : false, [edit]);

  useEffect(() => {
    if (modal) {
      modal.update({
        title: intl.get(`${intlPrompt}.title.supplementaryContractInformation`).d('填写费用中心明细/预算分类明细'),
        footer: (okBtn, cancelBtn) => editorFlag ? [okBtn, cancelBtn] : [cancelBtn],
        okText: intl.get(`${intlPrompt}.view.button.temporarySave`).d('确定'),
        onOk: handleOk,
      });
    }
  }, [modal, editorFlag, tableDs]);

  useEffect(() => {
    initData();
  }, [attributeLongtext60])

  const initData = async () => {
    const result = await request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/PIVCslpaopkUtPAbnIDib2V1wVPyN5el7ZCHZD5WyuP4`, {
      method: 'GET',
      query: { createdBy: record.get('createdBy') },
    })
    if (getResponse(result)) {
      const newData = JSON.parse(attributeLongtext60 || '[]');
      tableDs.getField('costCenterLov')?.set('defaultValue', result)
      tableDs.loadData(newData);
    }
  }

  const handleOk = async () => {
    const validate = await tableDs.validate();
    if (!validate) {
      return false;
    }
    record.set('attributeLongtext60', JSON.stringify(tableDs.toData()));
    tableDs.reset();
  }

  const columns = useMemo(
    () => [
      attributeVarchar28 === 'BAT001' && {
        name: 'costCenterLov',
        editor: editorFlag,
      },
      attributeVarchar28 === 'BAT002' && {
        name: 'budgetLov',
        editor: editorFlag,
      },
      {
        name: 'currencyLov',
        editor: editorFlag,
      },
      {
        name: 'amount',
        editor: editorFlag,
      },
      {
        name: 'exchangeRate',
      },
      {
        name: 'purchaseCurrencyCode',
      },
      {
        name: 'purchaseAmount',
      },
    ].filter(Boolean) as ColumnProps[],
    [editorFlag, attributeVarchar28]);

  // 导入编码
  const importProps = useMemo(() => {
    switch (type) {
      case 'pc':
        return {
          pcHeaderId: record.get('pcHeaderId'),
        };
      case 'payment':
      case 'prePayment':
        return {
          settleHeaderId: record.get('settleHeaderId'),
        };
      default:
        return {};
    }
  }, [type, record]);

  const handleExcelImport = async () => {
    const modalRes = await Modal.confirm({
      title: intl.get(`hzero.common.message.confirm`).d('提示'),
      children: (
        <div>
          <div>
            <span style={{ fontWeight: 'bold' }}>{intl.get(`${intlPrompt}.view.importConfirmMessageLabel1`).d('1. 下载模板')}</span>
            {intl.get(`${intlPrompt}.view.importConfirmMessageValue1`).d('：点击“下载模板”获取导入模板。')}
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>{intl.get(`${intlPrompt}.view.importConfirmMessageLabel2`).d('2. 填写并验证')}</span>
            {intl.get(`${intlPrompt}.view.importConfirmMessageValue2`).d('：在模板中填写内容并上传后，点击“数据验证”检查正确性。系统会提示发现的错误，请根据提示修改表格内容。')}
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>{intl.get(`${intlPrompt}.view.importConfirmMessageLabel3`).d('3. 完成导入')}</span>
            {intl.get(`${intlPrompt}.view.importConfirmMessageValue3`).d('：当所有数据都验证成功后，点击“数据导入”按钮即可完成操作。')}
          </div>
        </div>
      ),
    });
    if (modalRes !== 'ok') return;
    const Props = {
      code: 'SCUX_TRIP_COST_IMPORT',
      organizationId: getCurrentOrganizationId(),
      prefixPatch: SRM_MARMOT,
      args: JSON.stringify({
        tenantId: getCurrentOrganizationId(),
        ...importProps,
      }),
      backPath: '',
      autoRefreshInterval: 5000,
      tenantId: getCurrentOrganizationId(),
      action: 'hzero.common.title.batchImport',
      key: ' /scux/spcm/supplementary-contract-information/SCUX_TRIP_COST_IMPORT',
    };

    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      title: intl.get('hzero.common.button.Import').d('导入'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: async () => {
        const res = await record.dataSet.query(undefined, undefined, true);
        if (res && !res.failed) {
          const { attributeLongtext60 } = res;
          const newData = JSON.parse(attributeLongtext60 || '[]');
          tableDs.loadData(newData);
        }
      },
    });
  };

  // 导入按钮禁用
  const importDisabled = useMemo(() => {
    if (!record) return true;
    if (type === 'pc') {
      return !record.get('pcHeaderId');
    }
    if (type === 'payment' || type === 'prePayment') {
      return !record.get('settleHeaderId');
    }
    return true;
  }, [record]);

  const buttons = useMemo(() => (
    editorFlag ? [
      TableButtonType.add,
      (<DeleteButton dataSet={tableDs} />),
      <Button
        funcType={FuncType.flat}
        onClick={handleExcelImport}
        disabled={importDisabled}
      >
        {intl.get('hzero.common.button.Import').d('导入')}
      </Button>,
    ] : []
  ), [editorFlag, tableDs, importProps])

  return (
    <Fragment>
      <Table
        buttons={buttons}
        border={false}
        customizable
        customizedCode="SCUX.CUSTOMIZEDCODE"
        dataSet={tableDs}
        columns={columns}
      />
    </Fragment>
  );
};

export default formatterCollections({ code: [intlPrompt] })(
  (SupplementaryContractInformation));