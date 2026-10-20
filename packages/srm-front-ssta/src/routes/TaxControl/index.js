/* eslint-disable react/jsx-indent */
/* eslint-disable import/named */
import React, { useMemo, useEffect, useCallback } from 'react';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, Modal, Lov, Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { PermissionDropdown } from '@/routes/Components';
import TaxRecord from '@/routes/Components/InvoiceRecord/TaxRecord';

import { mainTableDs, updateDs, recordDs, searchInfoDs } from './mainDs';
import Styles from '@/routes/common.less';
import SyncTaxCtr from './SyncTaxCtr';

const prefix = `ssta.taxControl`;

const TaxControl = (props) => {
  const { customizeTable } = props;
  const tablesDS = useMemo(() => new DataSet(mainTableDs()), []);
  const updateBillDs = useMemo(() => new DataSet(updateDs()), []);
  const operationDs = useMemo(() => new DataSet(recordDs()), []);
  const searchInfoDS = useMemo(() => new DataSet(searchInfoDs()), []);
  useEffect(() => {
    tablesDS.query();
  }, [tablesDS]);

  const columns = useMemo(() => {
    return [
      { name: 'taxpayerName', width: 160 },
      { name: 'taxpayerNumber', width: 180 },
      { name: 'bankName', width: 160 },
      { name: 'bankAccount', width: 160 },
      { name: 'address', width: 160 },
      { name: 'telephone', width: 160 },
      { name: 'companyTypeMeaning', width: 120 },
      { name: 'taxAuthorityCode', width: 120 },
      { name: 'taxAuthorityName', width: 120 },
      { name: 'issueAreaNumber', width: 120 },
      { name: 'extNumber', width: 120 },
      { name: 'productType', width: 120 },
      { name: 'taxDiskNumber', width: 120 },
      {
        name: 'taxDiskType',
        width: 180,
        renderer: ({ record }) => {
          const { invoiceTerminalCode, invoiceTerminalName } = record.get([
            'invoiceTerminalCode',
            'invoiceTerminalName',
          ]);
          return `${invoiceTerminalCode || ''}${invoiceTerminalName || ''}`;
        },
      },
      { name: 'authorizeExpirationDate', width: 160 },
      { name: 'lastUpdateDate', width: 160 },
      { name: 'curDate', width: 160 },
      { name: 'startDate', width: 160 },
      {
        name: 'operation',
        width: 260,
        renderer: ({ record }) => {
          return (
            <PermissionDropdown
              dataSource={[
                // 志航说同步税控信息和更新操作是一致的，叫我拿掉这个按钮
                // {
                //   type: 'update',
                //   title: intl.get(`${prefix}.model.taxControl.updateTax`).d('更新税控信息'),
                //   onClick: () => updateTaxControl(record),
                //   main: true,
                //   show: true,
                // },
                {
                  type: 'record',
                  title: intl.get(`${prefix}.model.taxControl.viewStockBill`).d('查看库存发票'),
                  onClick: () => updateStockBill(record),
                  main: false,
                  show: true,
                },
                {
                  type: 'approve',
                  title: intl.get('hzero.common.button.operation').d('操作记录'),
                  onClick: () => handleRecord(record),
                  main: false,
                  show: true,
                },
              ]}
            />
          );
        },
      },

      {
        name: 'companySource',
      },
      {
        name: 'taxDiskType',
      },
      {
        name: 'taxProvince',
      },
      {
        name: 'singleInvoiceAmountLimit',
      },
      {
        name: 'requiredPhoneFlag',
      },
      {
        name: 'smsPushType',
      },
      {
        name: 'requiredEmailFlag',
      },
      {
        name: 'emailPushType',
      },
    ];
  }, []);

  const updateColumns = useMemo(() => {
    return [
      { name: 'invoiceTypeMeaning', width: 150 },
      {
        name: 'operation',
        width: 150,
        renderer: ({ record }) => {
          return (
            <PermissionDropdown
              dataSource={[
                {
                  type: 'approve',
                  title: intl.get('hzero.common.button.operation').d('操作记录'),
                  onClick: () => handleRecord(record, true),
                  main: false,
                  show: true,
                },
              ]}
            />
          );
        },
      },
      { name: 'authorizeTaxRate', width: 130 },
      {
        name: 'limitAmount',
        width: 130,
      },
      {
        name: 'offLineLimitAmount',
        width: 130,
      },
      {
        name: 'offLineRemainAmount',
        width: 130,
      },
      { name: 'offLineTime', width: 120 },
      { name: 'offLineExtensionInfo', width: 120 },
      { name: 'uploadDeadLineDate', width: 120 },
      { name: 'lockDate', width: 120 },
      { name: 'curInvoiceNumber', width: 120 },
      { name: 'curInvoiceCode', width: 120 },
      { name: 'curRemainingCount', width: 120, align: 'left' },
      { name: 'totalRemainingCount', width: 120, align: 'left' },
      { name: 'queryDate', width: 120 },

      {
        name: 'invoiceTerminalCode',
      },
      {
        name: 'productType',
      },
      {
        name: 'invoiceMode',
      },
      {
        name: 'digitAccount',
      },
      {
        name: 'digitAccountRole',
      },
    ];
  }, []);

  // const columnsTax = useMemo(() => {
  //   return [
  //     {
  //       name: 'supplierCompanyNum',
  //       width: 130,
  //     },
  //     {
  //       name: 'supplierCompanyName',
  //       width: 160,
  //     },
  //     {
  //       name: 'supUnifiedSocialCode',
  //       width: 160,
  //     },
  //     {
  //       name: 'purchaserCompanyNum',
  //       width: 130,
  //     },
  //     {
  //       name: 'purchaserCompanyName',
  //       width: 160,
  //     },
  //     {
  //       name: 'purUnifiedSocialCode',
  //       width: 160,
  //     },
  //   ];
  // }, []);

  // 点击了更新库存发票(批量)
  // const submitUpdateTax = async (param) => {
  //   const res = getResponse(await updateTaxIncoice(param));
  //   if (res) {
  //     if (res.failed) {
  //       notification.error({
  //         message: res.message,
  //       });
  //     } else {
  //       updateBillDs.query();
  //       tablesDS.query();
  //       notification.success();
  //     }
  //   }
  //   setLoading(false);
  // };

  // 点击了同步税控(单个)
  // const updateTaxControl = record => {
  //   taxDS.query();
  //   Modal.open({
  //     drawer: true,
  //     key: Modal.key(),
  //     closable: true,
  //     className: Styles['ssta-medium-modal'],
  //     title: intl.get(`${prefix}.model.taxControl.updateTax`).d('更新税控信息'),
  //     children: (
  //       <Table dataSet={taxDS} columns={columnsTax} loading={loading} queryFieldsLimit={2} />
  //     ),
  //     onOk: () =>
  //       new Promise(resolve => {
  //         const param = [{ ...record.toData(), ...taxDS.selected[0]?.toData() }];
  //         submitSyncTaxControl(param).then(() => {
  //           resolve();
  //         });
  //       }),
  //   });
  // };

  // 点击了操作记录
  const handleRecord = (record) => {
    const taxCtrlHeaderId = record.get('taxCtrlHeaderId');
    const taxCtrlLineId = record.get('taxCtrlLineId');
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: {
        width: '742px',
      },
      children: (
        <TaxRecord
          taxCtrlHeaderId={taxCtrlHeaderId}
          taxCtrlLineId={taxCtrlLineId}
          operationDs={operationDs}
        />
      ),
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  // 更新库存发票
  const updateStockBill = (record) => {
    const taxCtrlHeaderId = record.get('taxCtrlHeaderId');
    const taxpayerName = record.get('taxpayerName');
    const taxpayerNumber = record.get('taxpayerNumber');
    updateBillDs.setQueryParameter('taxCtrlHeaderId', taxCtrlHeaderId);
    updateBillDs.query();
    Modal.open({
      drawer: true,
      style: {
        width: 1000,
      },
      key: Modal.key(),
      title: `${intl
        .get(`${prefix}.model.taxControl.taxInfo`)
        .d('票种信息')}-${taxpayerName} 【${taxpayerNumber}】`,
      children: customizeTable(
        { code: `SDIM.TAX_CONTROL.LINE_GRID` },
        <Table dataSet={updateBillDs} columns={updateColumns} selectionMode="none" />
      ),
      okFirst: true,
      // onOk: () =>
      //   new Promise((resolve) => {
      //     submitUpdateTax({ taxCtrlHeaderId }).then(() => {
      //       resolve(false);
      //     });
      //   }),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 查询lov
  const changeSearchLov = (value) => {
    tablesDS.setQueryParameter('taxpayerNumber', value?.unifiedSocialCode);
    tablesDS.query();
  };

  const onOk = useCallback(() => {
    tablesDS.query();
  }, [tablesDS]);

  const handleSyncTaxControl = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: Styles['ssta-small-modal'],
      title: intl.get('ssta.taxControl.model.button.syncInfo').d('同步税控信息'),
      children: <SyncTaxCtr onOk={onOk} />,
      okText: intl.get('ssta.taxControl.model.button.syncInfo').d('同步税控信息'),
    });
  }, [onOk]);

  return (
    <>
      <Header title={intl.get('ssta.taxControl.view.title.taxControl').d('税控信息')}>
        <Button icon="sync" color="primary" clearButton={false} onClick={handleSyncTaxControl}>
          {intl.get('ssta.taxControl.model.button.syncInfo').d('同步税控信息')}
        </Button>
      </Header>
      <Content className={Styles['ssta-list-content']}>
        <Form
          dataSet={searchInfoDS}
          useColon={false}
          columns={1}
          // labelLayout="float"
          style={{ marginBottom: '16px' }}
        >
          <Lov
            dataSet={searchInfoDS}
            style={{ width: '320px' }}
            searchAction="blur"
            onChange={(value) => {
              changeSearchLov(value);
            }}
            placeholder={intl.get('ssta.taxControl.model.taxControl.partnerInfo').d('企业信息')}
            name="supplierCompanyLov"
          />
        </Form>
        {customizeTable(
          {
            code: `SDIM.TAX_CONTROL.HEADER_GRID`,
          },
          <Table dataSet={tablesDS} columns={columns} queryFieldsLimit={3} />
        )}
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.common', 'ssta.taxControl', 'ssta.costSheet'],
  }),
  withCustomize({
    unitCode: ['SDIM.TAX_CONTROL.HEADER_GRID', 'SDIM.TAX_CONTROL.LINE_GRID'],
  }),
  observer
)(TaxControl);
