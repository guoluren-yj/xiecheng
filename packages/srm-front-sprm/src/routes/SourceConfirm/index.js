import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { DataSet, Form, Table, Lov, Button, Spin, Output } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import request from 'utils/request';
import { closeTab } from 'utils/menuTab';
import querystring from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const SourceConfirm = ({ location }) => {
  const organizationId = getCurrentOrganizationId();
  const { chatId } = querystring.parse(location.search.substr(1) || '') || {};
  const [loading, setLoading] = useState(false);

  // Header Form DataSet: 展示统计信息
  const headerDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        fields: [
          {
            name: 'toBeConfirmedCount',
            type: 'number',
            label: intl.get('sprm.aiSource.model.toBeConfirmedCount').d('本次待确认货源'),
          },
          {
            name: 'confirmedCount',
            type: 'number',
            label: intl.get('sprm.aiSource.model.confirmedCount').d('已确认'),
          },
        ],
        transport: {
          read() {
            return {
              url: `/sprm/v1/${organizationId}/smart-pr-transfer/price-sources/result`,
              method: 'POST',
              data: { chatId, sourcePage: 'CONFIRM' },
              transformResponse(data) {
                const { summary } = JSON.parse(data) || {};
                return {
                  toBeConfirmedCount: summary?.toBeConfirmedCount ?? 0,
                  confirmedCount: summary?.confirmedCount ?? 0,
                  priceEditableFlag: summary.priceEditableFlag,
                };
              },
            };
          },
        },
      }),
    [chatId]
  );

  const disabled = headerDs?.current?.get('priceEditableFlag') === 0;

  // Line Table DataSet: 行数据 + 供应商 Lov
  const lineDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        paging: true,
        selection: false,
        primaryKey: 'prLineId',
        fields: [
          { name: 'prLineId', type: 'string' },
          {
            name: 'displayPrNum',
            type: 'string',
            label: intl.get('sprm.common.model.common.prNum').d('采购申请编号'),
          },
          {
            name: 'displayLineNum',
            type: 'string',
            label: intl.get('sprm.common.model.common.lineNum').d('行号'),
          },
          {
            name: 'prItemCode',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemCode').d('物料编码'),
          },
          {
            name: 'prItemName',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemName').d('物料名称'),
          },
          { name: 'itemId', type: 'string' },
          { name: 'companyId', type: 'string' },
          { name: 'ouId', type: 'string' },
          { name: 'uomId', type: 'string' },
          {
            name: 'prQuantity',
            type: 'number',
            label: intl.get('sprm.common.model.common.quantity').d('数量'),
          },
          {
            name: 'noActionRequiredFlag',
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            label: intl.get('sprm.aiSource.model.noActionRequiredFlag').d('无需处理'),
            dynamicProps: {
              disabled({ record }) {
                return (
                  disabled ||
                  record.get('supplierCompanyId') ||
                  record.get('selectedSupplierCompanyId')
                );
              },
            },
          },
          // 供应商 Lov 字段
          {
            name: 'supplierLov',
            label: intl.get('sprm.common.model.payment.supplierCompanyName').d('供应商'),
            type: 'object',
            lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
            ignore: 'always',
            textField: 'supplierCompanyName',
            dynamicProps: {
              disabled({ record }) {
                return disabled || record.get('noActionRequiredFlag') === 1;
              },
              lovPara({ record }) {
                return {
                  itemId: record.get('itemId'),
                  invOrganizationId: record.get('invOrganizationId'),
                  companyId: record.get('companyId'),
                  ouId: record.get('ouId'),
                  prLineId: record.get('prLineId'),
                  uomId: record.get('uomId'),
                  priceSortFlag: 1,
                };
              },
            },
          },
          { name: 'supplierId', bind: 'supplierLov.supplierId' },
          { name: 'supplierCompanyName', bind: 'supplierLov.supplierCompanyName' },
          { name: 'supplierCompanyId', bind: 'supplierLov.supplierCompanyId' },
          { name: 'priceLibraryId', bind: 'supplierLov.priceLibraryId' },
          {
            name: 'selectedUnitPrice',
            label: intl.get('sprm.aiSource.model.unitPrice').d('货源价格'),
            bind: 'supplierLov.unitPrice',
          },
          {
            name: 'selectedTaxRate',
            label: intl.get('sprm.common.model.common.taxRate').d('税率'),
            bind: 'supplierLov.taxRate',
          },
          {
            name: 'selectedCurrencyCode',
            label: intl.get('sprm.common.model.common.currencyCode').d('币种'),
            bind: 'supplierLov.currencyCode',
          },
        ],
        events: {
          update({ record, name, value }) {
            if (name === 'noActionRequiredFlag' && value === 1) {
              record.set('supplierLov', null);
            }
          },
        },
        transport: {
          read() {
            if (!headerDs.current) return;
            return {
              url: `/sprm/v1/${organizationId}/smart-pr-transfer/material-lines/page`,
              method: 'POST',
              data: { chatId, sourcePage: 'CONFIRM' },
            };
          },
        },
      }),
    [chatId, disabled, headerDs.current]
  );

  // Table 列定义
  const columns = [
    { name: 'displayPrNum' },
    { name: 'displayLineNum' },
    { name: 'prItemCode' },
    { name: 'prItemName' },
    { name: 'prQuantity', width: 100 },
    { name: 'noActionRequiredFlag', editor: true },
    {
      name: 'supplierLov',
      editor: () => <Lov name="supplierLov" />,
    },
    { name: 'selectedUnitPrice' },
    { name: 'selectedTaxRate' },
    { name: 'selectedCurrencyCode' },
  ];

  // 通用提交方法：action = SAVE / SUBMIT
  const handleSubmit = useCallback(
    async action => {
      const confirmations = lineDs.toJSONData();
      if (!confirmations.length && action === 'SAVE') return;

      try {
        setLoading(true);
        const res = getResponse(
          await request(
            `/sprm/v1/${organizationId}/smart-pr-transfer/source-confirmations/confirm`,
            {
              method: 'POST',
              body: { chatId, confirmations, action },
            }
          )
        );
        if (res) {
          notification.success();
          if (action === 'SUBMIT') {
            closeTab('/sprm/source-confirm');
          } else {
            // 保存后刷新数据
            headerDs.query();
            lineDs.query();
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [chatId, lineDs, headerDs]
  );

  // 保存
  const handleSave = useCallback(() => handleSubmit('SAVE'), [handleSubmit]);

  // 确认并提交
  const handleConfirmSubmit = useCallback(() => handleSubmit('SUBMIT'), [handleSubmit]);

  return (
    <>
      <Header title={intl.get('sprm.aiSource.view.title.sourceConfirm').d('确认货源')}>
        <Button color="primary" disabled={disabled} onClick={handleConfirmSubmit}>
          {intl.get(`hzero.common.button.submit`).d('提交')}
        </Button>
        <Button disabled={!lineDs.dirty || disabled} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content>
        <Spin spinning={loading}>
          <Form dataSet={headerDs} columns={2}>
            <Output name="toBeConfirmedCount" />
            <Output name="confirmedCount" />
          </Form>
          <Table dataSet={lineDs} columns={columns} />
        </Spin>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'sprm.aiSource'],
})(observer(SourceConfirm));
