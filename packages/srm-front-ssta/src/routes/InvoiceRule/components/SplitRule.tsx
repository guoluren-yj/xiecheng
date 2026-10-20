import React, { Fragment, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Card, Icon, Tooltip, Alert } from 'choerodon-ui';
import { Table, Button, Select } from 'choerodon-ui/pro';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
// import { SRM_SSTA } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

import { statusTagRender } from '../../../utils/renderer';
import { getSelectedNegActConfirmMsg } from '../../../utils/utils';
import styles from '../index.less';

// const organizationId = getCurrentOrganizationId();

const SplitRule = observer(props => {
  const {
    taxTableDs,
    productInfoDs,
    limitAmountDs,
    diffTaxCommodityTableDs,
    excessLineTableDs,
    renderDisabled,
    formDs,
    taxLimitTips,
  } = props;

  const enableRender = useCallback(() => statusTagRender(intl.get('hzero.common.status.enable').d('启用'), 'green'), []);

  const handleAdd = useCallback(type => {
    let ds = productInfoDs;
    if (type === 'amount_limit_split') {
      ds = limitAmountDs;
    } else if (type === 'diff_rate_split') {
      ds = taxTableDs;
    } else if (type === 'diff_tax_commodity_split') {
      ds = diffTaxCommodityTableDs;
    } else if (type === 'excess_line_split') {
      ds = excessLineTableDs;
    }

    const record = ds.create({ ruleType: type }, 0);
    record.setState('editing', true);
  }, [
    productInfoDs,
    limitAmountDs,
    taxTableDs,
    diffTaxCommodityTableDs,
    excessLineTableDs,
  ]);

  const handleDelete = useCallback(
    async type => {
      let ds = productInfoDs;
      if (type === 'amount_limit_split') {
        ds = limitAmountDs;
      } else if (type === 'diff_rate_split') {
        ds = taxTableDs;
      } else if (type === 'diff_tax_commodity_split') {
        ds = diffTaxCommodityTableDs;
      } else if (type === 'excess_line_split') {
        ds = excessLineTableDs;
      }

      const res = await ds.delete(ds.selected, getSelectedNegActConfirmMsg('delete', ds));
      if (res) {
        ds.query();
      }
    },
    [productInfoDs, limitAmountDs, taxTableDs, diffTaxCommodityTableDs, excessLineTableDs]
  );

  const optionsFilter = useCallback(
    option => {
      const scopeData = formDs?.current?.toData();
      let scopeInvoiceType = scopeData?.scopeInvoiceType || [];
      scopeInvoiceType = Array.isArray(scopeInvoiceType)
        ? scopeInvoiceType
        : scopeInvoiceType.split(',');
      const value = option.get('value');
      return scopeInvoiceType.includes(value) || scopeInvoiceType.includes('ALL');
    },
    [formDs]
  );


  const columnstax = useMemo(() => {
    return [
      {
        name: 'ruleData',
        width: 200,
        renderer: enableRender,
      },
      {
        name: 'invoiceType',
        width: 200,
        editor: () =>
          !renderDisabled ? <Select optionsFilter={option => optionsFilter(option)} /> : false,
      },

    ];
  }, [renderDisabled, optionsFilter, enableRender]);
  const columnsLine = useMemo(() => {
    return [
      {
        name: 'status',
        width: 200,
        renderer: enableRender,
      },
      {
        name: 'invoiceType',
        // width: 300,
        width: 200,
        editor: () =>
          !renderDisabled ? <Select optionsFilter={option => optionsFilter(option)} /> : false,
      },
      {
        name: 'ruleData',
        // width: 300,
        editor: !renderDisabled,
      },

    ];
  }, [renderDisabled, optionsFilter, enableRender]);

  const columnsproduct = useMemo(() => {
    return [
      {
        name: 'status',
        width: 200,
        renderer: enableRender,
      },
      {
        name: 'invoiceType',
        width: 200,
        editor: () =>
          !renderDisabled ? <Select optionsFilter={option => optionsFilter(option)} /> : false,
      },
      {
        name: 'commodityLov',
        // width: 200,
        editor: !renderDisabled,
      },

    ];
  }, [renderDisabled, optionsFilter, enableRender]);

  const columnsLimit = useMemo(() => {
    return [
      {
        name: 'status',
        width: 200,
        renderer: enableRender,
      },
      {
        name: 'invoiceType',
        width: 200,
        editor: () =>
          !renderDisabled ? <Select optionsFilter={option => optionsFilter(option)} /> : false,
      },
      {
        name: 'ruleData',
        // width: 200,
        editor: !renderDisabled,
      },

    ];
  }, [renderDisabled, optionsFilter, enableRender]);

  const buttons = useCallback(type => {
    if (renderDisabled) {
      return [];
    }
    return [
      <Button
        icon="playlist_add"
        color={ButtonColor.primary}
        onClick={() => {
          handleAdd(type);
        }}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      ['delete', { icon: 'delete_sweep', onClick: () => handleDelete(type) }],
    ];
  }, [handleAdd, handleDelete, renderDisabled]);

  const cardList = useMemo(() => {
    return [
      {
        title: (
          <Fragment>
            {intl.get(`ssta.invoiceRule.model.invoiceRule.taxSplit`).d('税率拆分')}
            <Tooltip
              title={intl
                .get(`ssta.invoiceRule.view.help.taxSplitCard`)
                .d(
                  '启用后，系统在自动生成开票申请单时，将根据待开票数据行的税率自动分组，拆分为多张单据，使每一张开具成功的税务发票只有唯一税率'
                )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        ),
        children: (
          <Table
            dataSet={taxTableDs}
            selectionMode={renderDisabled ? SelectionMode.none : SelectionMode.rowbox}
            buttons={buttons('diff_rate_split') as any}
            columns={columnstax}
            pagination={false}
            style={{ maxHeight: 310 }}
            customizedCode="SDIM.INVOICE_RULE_DETAIL.SPLIT_TAX"
          />
        ),
      },
      {
        title: (
          <Fragment>
            {intl.get(`ssta.invoiceRule.model.invoiceRule.productSplit`).d('类别拆分')}
            <Tooltip
              title={intl
                .get(`ssta.invoiceRule.view.help.productSplitCard`)
                .d(
                  '启用后，系统在自动生成开票申请单时，将根据待开票数据行物料所映射的税收商品类别自动分组，拆分为多张单据，使每一张开具成功的税务发票只有唯一税收商品类别'
                )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        ),
        children: (
          <Table
            dataSet={diffTaxCommodityTableDs}
            selectionMode={renderDisabled ? SelectionMode.none : SelectionMode.rowbox}
            buttons={buttons('diff_tax_commodity_split') as any}
            columns={columnstax}
            pagination={false}
            style={{ maxHeight: 310 }}
            customizedCode="SDIM.INVOICE_RULE_DETAIL.SPLIT_KIND"
          />
        ),
      },
      {
        title: (
          <Fragment>
            {intl
              .get(`ssta.invoiceRule.model.invoiceRule.specialProductSplit`)
              .d('特殊商品拆分')}
            <Tooltip
              title={intl
                .get(`ssta.invoiceRule.view.help.specialProductSplitCard`)
                .d(
                  '启用后，系统在自动生成开票申请单时，将根据待开票数据行的物料所映射的税收商品自动分组，拆分为多张单据，使配置的特殊商品单独开具为一张税务发票'
                )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        ),
        children: (
          <Table
            dataSet={productInfoDs}
            selectionMode={renderDisabled ? SelectionMode.none : SelectionMode.rowbox}
            buttons={buttons('special_commodity_split') as any}
            columns={columnsproduct}
            pagination={false}
            style={{ maxHeight: 310 }}
            customizedCode="SDIM.INVOICE_RULE_DETAIL.SPLIT_SPECGOOD"
          />
        ),
      },
      {
        title: (
          <Fragment>
            {intl.get(`ssta.invoiceRule.model.invoiceRule.outLine`).d('超行控制')}
            <Tooltip
              title={intl
                .get(`ssta.invoiceRule.view.help.outLineCard`)
                .d(
                  '1、启用后，税务发票明细行超过所设定的行数，将会自动拆分为多张单据；2、单张税务发票明细行超过8行，将自动转换为销货清单格式'
                )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        ),
        children: (
          <Table
            dataSet={excessLineTableDs}
            selectionMode={renderDisabled ? SelectionMode.none : SelectionMode.rowbox}
            buttons={buttons('excess_line_split') as any}
            columns={columnsLine}
            pagination={false}
            style={{ maxHeight: 310 }}
            customizedCode="SDIM.INVOICE_RULE_DETAIL.SPLIT_OUTLINE"
          />
        ),

      },
      {
        title: (
          <Fragment>
            {intl.get(`ssta.invoiceRule.model.invoiceRule.limitSplit`).d('限额拆分')}
            <Tooltip
              title={intl
                .get(`ssta.invoiceRule.view.help.limitSplitCard`)
                .d(
                  '启用后，系统在自动生成开票申请单时，将根据待开票数据行的金额自动分组，拆分为多张单据，使每一张开具成功的税务发票在限额区间内'
                )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        ),
        children: (
          <div className={styles['split-limit-card']}>
            {
              taxLimitTips.length > 0 && (
                <Alert
                  message=""
                  description={(
                    <div>
                      {intl.get(`ssta.invoiceRule.model.invoiceRule.taxLimitTips`).d('根据企业税控信息，')}
                      {
                        taxLimitTips.map((item) => (
                          <div key={item?.taxCtrlHeaderId}>
                            {intl
                              .get('ssta.common.view.help.invoiceLiTips', { taxpayerName: item.taxpayerName, singleInvoiceAmountLimit: item.singleInvoiceAmountLimit})
                              .d('纳税人{taxpayerName}，单张发票开票限额限额为{singleInvoiceAmountLimit}')}
                          </div>
                        ))
                      }
                      {intl.get(`ssta.invoiceRule.model.invoiceRule.taxLimitTipsTitle`).d('建议配置不超过该值的限额')}
                    </div>
                  )}
                  type="info"
                  closable
                />
              )
            }
            <Table
              dataSet={limitAmountDs}
              selectionMode={renderDisabled ? SelectionMode.none : SelectionMode.rowbox}
              buttons={buttons('amount_limit_split') as any}
              columns={columnsLimit}
              pagination={false}
              style={{ maxHeight: 310 }}
            />
          </div>
        ),
      },

    ];
  }, [
    buttons,
    taxTableDs,
    diffTaxCommodityTableDs,
    productInfoDs,
    excessLineTableDs,
    limitAmountDs,
    renderDisabled,
    columnstax,
    columnsproduct,
    columnsLine,
    columnsLimit,
  ]);


  return (
    <div className="strategy-panel-wrapper">

      {
        cardList.map(({ title, children }) => (
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={title}
          >{children}
          </Card>
        )
        )
      }
    </div>
  );

});

export default SplitRule;
