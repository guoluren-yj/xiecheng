import React, { useMemo, memo } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const InvoiceCheckRuleModal = memo((props) => {
  const { checkSource } = props;
  const tableDS = useDataSet(() => {
    return {
      autoQuery: true,
      dataToJSON: 'all',
      fields: [
        {
          name: 'invoiceType',
          type: 'string',
          label: intl.get('spfm.configServer.model.configServer.invoiceType').d('发票种类编码'),
        },
        {
          name: 'invoiceTypeCodeMeaning',
          type: 'string',
          label: intl
            .get('spfm.configServer.model.configServer.invoiceTypeCodeMeaning')
            .d('发票种类名称'),
        },
        {
          name: 'allowCheckFlag',
          type: 'boolean',
          label: intl.get('spfm.configServer.model.configServer.allowCheckFlag').d('是否允许查验'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'autoCheckFlag',
          type: 'boolean',
          label: intl.get('spfm.configServer.model.configServer.autoCheckFlag').d('是否自动查验'),
          trueValue: 1,
          falseValue: 0,
        },
        {
          name: 'successCheckFalg',
          type: 'boolean',
          label: intl
            .get('spfm.configServer.model.configServer.successCheckFalg')
            .d('是否需要校验查验成功'),
          trueValue: 1,
          falseValue: 0,
        },
      ],
      transport: {
        read: ({ data }) => {
          return {
            url: `/sfin/v1/${organizationId}/invoice-check-rules/list`,
            method: 'GET',
            data: { ...data, checkSource },
          };
        },
        submit: () => {
          return {
            url: `/sfin/v1/${organizationId}/invoice-check-rules/save`,
            method: 'PUT',
          };
        },
      },
    };
  }, [checkSource]);

  const columns = useMemo(() => {
    return [
      {
        name: 'invoiceType',
        width: 200,
      },
      {
        name: 'invoiceTypeCodeMeaning',
        width: 200,
      },
      {
        name: 'allowCheckFlag',
        width: 200,
        editor: true,
      },
      {
        name: 'autoCheckFlag',
        width: 200,
        editor: true,
        help: intl
          .get('spfm.configServer.model.configServer.help.autoCheckFlag')
          .d(
            '单据提交或审核通过时，系统自动查验当前单据未查验或查验失败的已启用配置种类的税务发票'
          ),
      },
      {
        name: 'successCheckFalg',
        width: 200,
        editor: true,
        help: intl
          .get('spfm.configServer.model.configServer.help.successCheckFalg')
          .d(
            '单据提交或审核通过时，系统将校验当前单据已启用配置种类的税务发票状态是否都为查验成功，若校验失败则禁止下一步操作'
          ),
      },
    ];
  }, []);
  return <Table dataSet={tableDS} columns={columns} buttons={['save']} />;
});

export default InvoiceCheckRuleModal;
