import React, { Component } from 'react';
import { Table, Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { showPrecisionValue, calculateBasicQty } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { validateClarifyLadderQuotation } from '@/services/supplierQutationService';
import notification from 'hzero-front/lib/utils/notification';

export default class LadderLevel extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  /**
   * 修改含税单价
   * @param {!number} val - 值
   * @param {!Object} record - 行数据
   */
  @Bind()
  handleChangeUnitPrice(val = null, record = {}) {
    const { recordData } = this.props;
    const { taxIncludedFlag, taxRate } = recordData || {};
    if (!val && val !== 0) {
      record.set('currentNetLadderPrice', null);
      return;
    }
    let currentNetLadderPrice = null;

    if (taxIncludedFlag && taxRate && taxRate !== 0) {
      currentNetLadderPrice = showPrecisionValue(
        math.div(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentNetLadderPrice = val;
    }

    record.set('currentNetLadderPrice', currentNetLadderPrice);
  }

  /**
   * 修改未税单价
   * @param {!number} val - 值
   * @param {!Object} record - 行数据
   */
  @Bind()
  handleChangeNetPrice(val, record = {}) {
    const { recordData, doubleUnitFlag } = this.props;
    const { taxIncludedFlag, taxRate } = recordData || {};
    if (doubleUnitFlag) {
      return;
    }
    if (val === '' || (!val && val !== 0 && isNaN(val))) {
      record.set('currentLadderPrice', null);
      return;
    }

    let currentLadderPrice = null;

    if (taxIncludedFlag && taxRate && taxRate !== 0) {
      currentLadderPrice = showPrecisionValue(
        math.multipliedBy(val, math.plus(math.div(taxRate, 100), 1)),
        10
      );
    } else {
      currentLadderPrice = val;
    }

    record.set('currentLadderPrice', currentLadderPrice);
  }

  renderHeader() {
    const { recordData = {} } = this.props;

    const { itemCode, itemName } = recordData || {};
    return (
      <Form columns={2}>
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
          value={itemName}
        />
      </Form>
    );
  }

  handleChangeLadder(value, record, name) {
    const { recordData } = this.props;
    const { itemId, uomId, secondaryUomId } = recordData;
    if (itemId && uomId && secondaryUomId) {
      calculateBasicQty({
        secondaryQuantity: value,
        itemId,
        businessKey: -1,
        doublePrimaryUomId: uomId,
        secondaryUomId,
      }).then((res) => {
        record.set(name, res);
      });
    } else {
      record.set(name, value);
    }
  }

  ladderLevelModalTable() {
    const { readOnly = true, recordData, doubleUnitFlag, tenantId } = this.props;
    const { diyLadderQuotationFlag } = recordData || {};

    const Columns = [
      {
        name: 'rfxLadderLineNum',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 100,
            editor:
              !readOnly &&
              ((record) => {
                if (!record.isNew && !diyLadderQuotationFlag) return false;
                return (
                  <C7nPrecisionInputNumber
                    name="secondaryLadderFrom"
                    record={record}
                    uom="uomId"
                    onChange={(value) => this.handleChangeLadder(value, record, 'ladderFrom')}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                );
              }),
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            width: 100,
            name: 'secondaryLadderTo',
            editor:
              !readOnly &&
              ((record) => {
                if (!record.isNew && !diyLadderQuotationFlag) return false;
                return (
                  <C7nPrecisionInputNumber
                    name="secondaryLadderTo"
                    record={record}
                    uom="uomId"
                    onChange={(value) => this.handleChangeLadder(value, record, 'ladderTo')}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                );
              }),
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'ladderFrom',
        width: 100,
        editor:
          !readOnly &&
          ((record) => {
            if (!record.isNew && !diyLadderQuotationFlag) return false;
            return (
              <C7nPrecisionInputNumber
                name="ladderFrom"
                record={record}
                uom="uomId"
                queryPrecisionParams={{ purTenantId: tenantId }}
              />
            );
          }),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        width: 100,
        name: 'ladderTo',
        editor:
          !readOnly &&
          ((record) => {
            if (!record.isNew && !diyLadderQuotationFlag) return false;
            return (
              <C7nPrecisionInputNumber
                name="ladderTo"
                record={record}
                uom="uomId"
                queryPrecisionParams={{ purTenantId: tenantId }}
              />
            );
          }),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      doubleUnitFlag
        ? {
            name: 'currentLadderSecPrice',
            width: 100,
            align: 'left',
            editor:
              !readOnly &&
              ((record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="currentLadderSecPrice"
                    record={record}
                    currency="currencyCode"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                );
              }),
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'currentNetLadderSecPrice',
            width: 100,
            align: 'left',
            editor:
              !readOnly &&
              ((record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="currentNetLadderSecPrice"
                    record={record}
                    currency="currencyCode"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                );
              }),
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('currency_precision')),
          }
        : null,
      {
        name: 'currentLadderPrice',
        width: 100,
        align: 'left',
        editor:
          !readOnly &&
          ((record) => {
            return (
              <C7nPrecisionInputNumber
                name="currentLadderPrice"
                record={record}
                currency="currencyCode"
                disabled={doubleUnitFlag}
                onChange={(value) => this.handleChangeUnitPrice(value, record)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          }),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('currency_precision')),
      },
      {
        name: 'currentNetLadderPrice',
        width: 100,
        align: 'left',
        editor:
          !readOnly &&
          ((record) => {
            return (
              <C7nPrecisionInputNumber
                name="currentNetLadderPrice"
                record={record}
                currency="currencyCode"
                disabled={doubleUnitFlag}
                onChange={(value) => this.handleChangeNetPrice(value, record)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            );
          }),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('currency_precision')),
      },
      {
        name: 'cumulativeFlag',
        width: 100,
        editor: !readOnly,
      },
      {
        name: 'remark',
        width: 180,
        editor: !readOnly && ((record) => record.isNew),
      },
    ].filter(Boolean);

    return Columns;
  }

  @Bind()
  handleCreate() {
    const { ladderLevelModalDS, recordData } = this.props;
    const { sourceQuotationLineId } = recordData || {};
    const lineData = {
      quotationLineId: sourceQuotationLineId,
      rfxLadderLineNum: ladderLevelModalDS?.length + 1,
    };

    if (ladderLevelModalDS?.length) {
      // 上一行的至作为下行的从
      const lastLineRecord = ladderLevelModalDS.get(ladderLevelModalDS.length - 1);
      const nextLineLadderFrom = lastLineRecord ? lastLineRecord.get('ladderTo') : null;
      const nextLineSecondaryLadderFrom = lastLineRecord
        ? lastLineRecord.get('secondaryLadderTo')
        : null;
      lineData.ladderFrom = nextLineLadderFrom;
      lineData.secondaryLadderFrom = nextLineSecondaryLadderFrom;
    }

    ladderLevelModalDS.create(lineData);
  }

  // 删除
  @Bind()
  deleteLadderPrice() {
    const { ladderLevelModalDS } = this.props;
    const { selected } = ladderLevelModalDS || {};

    const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
    if (!unAddSelectedLines?.length) {
      ladderLevelModalDS.remove(selected);
    }

    const unAddAllLines = ladderLevelModalDS.filter((line) => line.status !== 'add');
    const endSelectedLine = unAddAllLines.slice(unAddAllLines.length - unAddSelectedLines.length);

    let matchFlag = 1;
    endSelectedLine.forEach((line) => {
      const rfxLadderLineNum = line.get('rfxLadderLineNum');
      const matchSelectedLine = unAddSelectedLines.find(
        (selectedLine) => selectedLine.get('rfxLadderLineNum') === rfxLadderLineNum
      );
      if (!matchSelectedLine) {
        matchFlag = 0;
      }
    });

    if (!matchFlag) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
      return;
    }

    ladderLevelModalDS.delete(unAddSelectedLines);
  }

  /**
   * 校验阶梯报价
   * ①增加校验1：是否需求数量存在对应阶梯，没匹配到则保存成功，基准价对应单价可编辑修改；
   * ②匹配到有对应阶梯进行校验2：对应阶梯&行上填写单价与阶梯内单价是否一致，不一致时提示：采购方需求数量为{$需求数量}，确定将行上填写的单价改为{$对应阶梯的单价}吗？；点击确定后，根据基准价将单价带出至对应行上单价字段，且行上单价字段置灰不可编辑
   * @returns
   */
  @Bind()
  async validateLadderQuotation() {
    const { ladderLevelModalDS, recordData = {}, LadderCode } = this.props;
    const { sourceQuotationLineId, priceClarifyIssueLineId } = recordData || {};
    // 对data 排序
    const newData = ladderLevelModalDS
      .toData()
      .sort((cur, next) => cur.rfxLadderLineNum - next.rfxLadderLineNum);
    const doValidate = () => {
      return validateClarifyLadderQuotation({
        rfxLadderQuotationList: newData,
        quotationLineId: sourceQuotationLineId,
        priceClarifyIssueLineId,
        querys: {
          customizeUnitCode: LadderCode,
        },
      });
    };

    const doSubmit = () => {
      ladderLevelModalDS.submit();
    };

    const ValidateResult = getResponse(await doValidate());
    if (!ValidateResult) {
      return;
    }
    validatorConfirmModal({
      response: ValidateResult,
      validatorType: 'highestValidatorType',
      validatorArrName: 'validateResults',
      onOk: async () => {
        await doSubmit();
      },
    });
  }

  /**
   * 获取buttons
   */
  get buttons() {
    const { readOnly = true, recordData } = this.props;
    const { diyLadderQuotationFlag } = recordData || {};
    if (readOnly) return [];
    if (!diyLadderQuotationFlag) return [['save', { onClick: this.validateLadderQuotation }]];
    return [
      [
        'add',
        {
          onClick: this.handleCreate,
        },
      ],
      ['delete', { onClick: this.deleteLadderPrice }],
      ['save', { onClick: this.validateLadderQuotation }],
    ];
  }

  render() {
    const { ladderLevelModalDS, customizeTable, LadderCode } = this.props;

    const table = (
      <Table
        rowKey="ladderQuotationId"
        columns={this.ladderLevelModalTable()}
        dataSet={ladderLevelModalDS}
        buttons={this.buttons}
      />
    );

    return (
      <div>
        {this.renderHeader()}
        {customizeTable
          ? customizeTable(
              {
                code: LadderCode,
                dataSet: ladderLevelModalDS,
              },
              table
            )
          : table}
      </div>
    );
  }
}
