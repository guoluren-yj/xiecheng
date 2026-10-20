import React, { useMemo, useCallback } from 'react';
import { Table, Form, Output, Icon } from 'choerodon-ui/pro';
import { Alert, Popover } from 'choerodon-ui';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';

import Styles from '../index.less';

const Content = (props = {}) => {
  const {
    tableLineDS,
    formDS,
    currentLineRecord,
    readOnly = false, // 只读内容
    customizeTable = noop,
    customizeUnitCode = null, // 个性化编码
    customizeFlag = 0, // 是否需要个性化
    headerDS = {},
    pageName,
    doubleUnitFlag = false,
    quotationRemote,
    remotePrefixCode,
  } = props;

  const { existBargainedFlag = 0 } = headerDS?.current
    ? headerDS.current.get(['existBargainedFlag'])
    : {};

  const renderAlert = useCallback(() => {
    return (
      <Alert
        message={
          <span style={{ color: '#3095F2' }}>
            {intl
              .get('ssrc.inquiryHall.view.ladderPriceIncludeMinMax')
              .d('阶梯价格区间包含最小采购量和需求数量！')}
          </span>
        }
        type="info"
        showIcon
        iconType="help"
        closable
        style={{
          marginLeft: '-20px',
          marginRight: '-20px',
          marginTop: '-20px',
          marginBottom: '20px',
          border: 'none',
          height: '40px',
          lineHeight: '20px',
        }}
        closeText={<Icon type="close" style={{ color: '#3095f2' }} />}
      />
    );
  }, [currentLineRecord]);

  // 参与页面阶梯报价
  const appyQuotationColumns = useMemo(
    () => [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      {
        name: 'secondaryLadderFrom',
        width: 140,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'secondaryLadderTo',
        width: 140,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'ladderFrom',
        width: 140,
      },
      {
        name: 'ladderTo',
        width: 140,
      },
      {
        name: 'remark',
      },
    ],
    [readOnly, pageName, doubleUnitFlag]
  );

  let columns = [
    {
      name: 'rfxLadderLineNum',
      width: 80,
      lock: 'left',
    },
    {
      name: 'secondaryLadderFrom',
      width: 140,
      hidden: !doubleUnitFlag,
    },
    {
      name: 'secondaryLadderTo',
      width: 140,
      hidden: !doubleUnitFlag,
    },
    {
      name: 'ladderFrom',
      width: 140,
    },
    {
      name: 'ladderTo',
      width: 140,
    },
    // {
    //   name: 'currentLadderPrice',
    //   width: 140,
    //   renderer: ({ record, value }) =>
    //     numberSeparatorRender(value, record.getState('currency_precision')),
    // },
    // {
    //   name: 'currentNetLadderPrice',
    //   width: 140,
    //   renderer: ({ record, value }) =>
    //     numberSeparatorRender(value, record.getState('currency_precision')),
    // },
    {
      name: 'cumulativeFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'validLadderSecPrice',
      hidden: !doubleUnitFlag,
      // hidden: isUnTaxPriceFlag,
      renderer: ({ value }) => numberSeparatorRender(value),
      width: 180,
      align: 'right',
    },
    {
      name: 'validNetLadderSecPrice',
      hidden: !doubleUnitFlag,
      // hidden: !isUnTaxPriceFlag,
      width: 180,
      renderer: ({ value }) => numberSeparatorRender(value),
      align: 'right',
    },
    {
      name: 'validLadderPrice',
      renderer: ({ value }) => numberSeparatorRender(value),
      width: 180,
      align: 'right',
    },
    {
      name: 'validNetLadderPrice',
      width: 180,
      renderer: ({ value }) => numberSeparatorRender(value),
      align: 'right',
    },
    {
      name: 'validBargainPrice',
      width: 180,
      hidden: !existBargainedFlag,
      renderer: ({ value }) => numberSeparatorRender(value),
    },
    {
      name: 'validBargainRemark',
      // width: 200,
      hidden: !existBargainedFlag,
      renderer: ({ value }) => (
        <Popover placement="topLeft" content={value}>
          {value}
        </Popover>
      ),
    },
    {
      name: 'remark',
    },
  ];

  columns =
    quotationRemote && remotePrefixCode
      ? quotationRemote.process(`${remotePrefixCode}_LADDER_COLUMNS`, columns, {
          headerDS,
        })
      : columns;

  // table render
  const renderTable = useCallback(() => {
    let currentColumn = columns;
    if (pageName === 'applyQuotation') {
      currentColumn = appyQuotationColumns; // 参与页面阶梯报价表格
    }
    if (pageName === 'quotationHistory') {
      currentColumn = columns;
    }

    const tableContent = (
      <Table
        // border
        columns={currentColumn}
        dataSet={tableLineDS}
        rowKey="rfxLadderLineNum"
        buttons={[]}
      />
    );

    if (!customizeFlag) {
      return tableContent;
    }

    return <div>{customizeTable({ code: customizeUnitCode }, tableContent)}</div>;
  }, [readOnly, columns, tableLineDS, pageName]);

  return (
    <div>
      {renderAlert()}
      <div className={Styles['form-content-common-wrap']}>
        {/* <h3 className={Styles['item-title']}>
          <div className={Styles['item-title-symbol']} />
          {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
        </h3> */}
        <Form
          dataSet={formDS}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          columns={3}
        >
          <Output name="itemCode" />
          <Output name="itemName" />
          <Output name="currencyCode" />
          <Output name="taxRate" />
        </Form>
      </div>

      <div className={Styles['table-content']}>
        <h3 className={Styles['item-title']}>
          <div className={Styles['item-title-symbol']} />
          {intl.get('ssrc.inquiryHall.view.title.ladderAndPriceTitle').d('阶梯与价格')}
        </h3>
        {renderTable()}
      </div>
    </div>
  );
};

export default observer(Content);
