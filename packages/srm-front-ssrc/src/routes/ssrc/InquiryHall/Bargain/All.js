import React, { PureComponent, Fragment } from 'react';
import { Popover, Badge } from 'choerodon-ui';
import { Attachment, Modal, DataSet, Button, CheckBox, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isNil, noop } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { numberSeparatorRender, invalidSupplierSymbol } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { PRIVATE_BUCKET } from '_utils/config';

import { saveBarginLadderLevel, saveBarginLadderLevelOffline } from '@/services/inquiryHallService';
import { INQUIRY } from '@/utils/globalVariable';
import {
  calculateBasicQty,
  // getTableFixSelfAdaptStyle
} from '@/utils/utils';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevel from './LadderLevelC7n/index';
import { ladderQuotationTableDS } from './LadderLevelC7n/tableDS';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

class All extends PureComponent {
  /**
   * 渲染第几轮淘汰
   * @param {Object} params 参数
   */
  roundEliminate({ value, record }) {
    const { supplierStatus } = record?.get(['supplierStatus']);

    return (
      <div className={styles['round-eliminate']}>
        <span className={styles['round-eliminate-supplier']}>{value}</span>
        <>
          {record.get('eliminateRoundNumber') ? (
            <div className={styles['round-quotation-container']}>
              <span className={styles['round-quotation']}>
                {Number(record.get('eliminateRoundNumber')) === 1
                  ? intl.get('ssrc.inquiryHall.model.inquiryHall.firstEliminate').d('首轮淘汰')
                  : `${intl.get('ssrc.inquiryHall.model.inquiryHall.theThird').d('第')}${record.get(
                      'eliminateRoundNumber'
                    )}${intl.get('ssrc.inquiryHall.model.inquiryHall.roundEliminate').d('轮淘汰')}`}
              </span>
            </div>
          ) : null}
        </>
        {invalidSupplierSymbol({ supplierStatus })}
      </div>
    );
  }

  // 浮窗渲染
  popoverRender({ value }) {
    return (
      <Popover content={value} placement="topLeft">
        {value}
      </Popover>
    );
  }

  @Bind()
  async saveBarginLadderLine(ladderQuotationTableDs) {
    const { isOfflineFlag, AllTableDS } = this.props;
    const newParams = ladderQuotationTableDs.toData();
    const res = getResponse(
      await (isOfflineFlag
        ? saveBarginLadderLevelOffline({ newParams, organizationId })
        : saveBarginLadderLevel({ newParams, organizationId }))
    );
    if (res) {
      notification.success();
      ladderQuotationTableDs.query();
      // 刷新外部列表
      AllTableDS.query();
    }
    return false;
  }

  @Bind()
  // 打开阶梯报价
  viewLadderLevel(record) {
    const {
      bargainHeader,
      isOfflineFlag,
      doubleUnitFlag,
      bargainFlag,
      remote,
      sourceKey,
    } = this.props;

    const {
      quotationLineStatus,
      supplierStatus,
      eliminateRoundNumber,
      supplierCompanyId,
    } = record.get([
      'quotationLineStatus',
      'supplierStatus',
      'eliminateRoundNumber',
      'supplierCompanyId',
    ]);

    const disabledFlag =
      quotationLineStatus === 'BARGAINED' ||
      quotationLineStatus === 'ABANDONED' ||
      supplierStatus === 'QUOTATION_INVALID' ||
      supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
      eliminateRoundNumber ||
      (bargainFlag && !supplierCompanyId);

    const ladderQuotationTableDs = new DataSet(
      remote
        ? remote.process(
            'SSRC_BARGAIN_PROCESS_LADDER_TABLE_DS',
            ladderQuotationTableDS({
              lineRecord: record,
              isUnTaxPriceFlag: bargainHeader?.priceTypeCode === 'NET_PRICE',
              disabledFlag,
            }),
            {
              bidFlag: sourceKey === 'BID',
              bargainHeader,
              lineRecord: record,
            }
          )
        : ladderQuotationTableDS({
            lineRecord: record,
            isUnTaxPriceFlag: bargainHeader?.priceTypeCode === 'NET_PRICE',
            disabledFlag,
          })
    );

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 1100,
      },
      drawer: true,
      closable: true,
      children: (
        <LadderLevel
          record={record}
          ladderQuotationTableDs={ladderQuotationTableDs}
          isOfflineFlag={isOfflineFlag}
          doubleUnitFlag={doubleUnitFlag}
          disabledFlag={disabledFlag}
          remote={remote}
          remoteCode="SSRC_BARGAIN"
          bargainHeader={bargainHeader}
        />
      ),
      okText: !disabledFlag
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.confirm').d('确认'),
      onOk: !disabledFlag ? () => this.saveBarginLadderLine(ladderQuotationTableDs) : () => {},
    });
  }

  @Bind()
  // 阶梯报价渲染
  ladderInquiryrender({ value, record }) {
    const { isOfflineFlag } = this.props;
    if (Number(value)) {
      return (
        <Fragment>
          <a onClick={() => this.viewLadderLevel(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
          </a>
          {isOfflineFlag && record.get('ladderInquiryRequire') === 1 && (
            <Badge style={{ marginLeft: '2px' }} status="error" />
          )}
        </Fragment>
      );
    } else {
      return null;
    }
  }

  changeCurrentQuotationSecondaryQuantity(val, record) {
    const { doubleUnitFlag, dynamicChangePrice = noop } = this.props;
    const { value } = val?.target;
    if (value) {
      const { itemId, quotationLineId, uomId, secondaryUomId } = record.get([
        'itemId',
        'quotationLineId',
        'uomId',
        'secondaryUomId',
      ]);
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: value,
          itemId,
          businessKey: quotationLineId,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.set('currentQuotationQuantity', res);
        });
      } else {
        record.set('currentQuotationQuantity', value);
      }
    } else if (value === 0) {
      record.set('currentQuotationQuantity', value);
    }

    if (typeof dynamicChangePrice === 'function') {
      dynamicChangePrice({ record });
    }
  }

  suggestedFlagChange(value, record) {
    if (value) {
      record.set('freightIncludedFlag', 1);
      record.set('freightAmount', '');
    } else {
      record.set('freightIncludedFlag', 0);
    }
  }

  @Bind()
  renderRedMinPrice({ value, record, name, isNeedSeparator = true }) {
    const { remote } = this.props;
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    const redField = record.get('redField');
    const colorRemote = remote
      ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_ALL_TABLE_COLOR', 'red')
      : 'red';
    return redField === name ? (
      <span style={{ color: colorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }

  @Bind()
  getColumns() {
    const {
      isOfflineFlag,
      doubleUnitFlag = false,
      newQuotationFlag,
      remote,
      AllTableDS,
      sourceKey,
      dynamicChangePrice = noop,
      bargainHeader = {},
    } = this.props;
    const colorRemote = remote
      ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_ALL_TABLE_COLOR', 'red')
      : 'red';
    const columns = [
      {
        name: 'quotationLineStatusMeaning',
        width: 120,
      },
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
        renderer: this.roundEliminate,
      },
      doubleUnitFlag
        ? isOfflineFlag
          ? {
              name: 'currentQuotationSecPrice',
              width: 100,
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="currentQuotationSecPrice"
                    currency="quotationCurrencyCode"
                    record={record}
                    omitZeroFlag
                    onChange={() => dynamicChangePrice({ record })}
                  />
                );
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('currency_precision'), {
                  omitZeroFlag: true,
                }),
            }
          : {
              name: 'validQuotationSecPrice',
              width: 100,
            }
        : null,
      doubleUnitFlag
        ? isOfflineFlag
          ? {
              name: 'netSecondaryPrice',
              width: 100,
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="netSecondaryPrice"
                    currency="quotationCurrencyCode"
                    record={record}
                    omitZeroFlag
                    onChange={() => dynamicChangePrice({ record })}
                  />
                );
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('currency_precision'), {
                  omitZeroFlag: true,
                }),
            }
          : {
              name: 'validNetSecondaryPrice',
              width: 100,
            }
        : null,
      isOfflineFlag
        ? {
            name: 'currentQuotationPrice',
            width: 100,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationPrice"
                  currency="quotationCurrencyCode"
                  record={record}
                  omitZeroFlag
                  onChange={() => dynamicChangePrice({ record })}
                />
              );
            },
            renderer: ({ record, value, name }) => {
              const highlightField = record.get('highlightField');
              const redFlag = highlightField === name;

              return (
                <span style={{ color: !redFlag ? '' : colorRemote }}>
                  {numberSeparatorRender(value, record.getState('currency_precision'), {
                    omitZeroFlag: true,
                  })}
                </span>
              );
            },
          }
        : {
            name: 'validQuotationPrice',
            width: 100,
            renderer: ({ record, value }) =>
              this.renderRedMinPrice({ value, record, name: 'validQuotationPrice' }),
          },
      isOfflineFlag
        ? {
            name: 'netPrice',
            width: 100,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netPrice"
                  currency="quotationCurrencyCode"
                  record={record}
                  omitZeroFlag
                  onChange={() => dynamicChangePrice({ record })}
                />
              );
            },
            renderer: ({ record, value, name }) => {
              const highlightField = record.get('highlightField');
              const redFlag = highlightField === name;

              return (
                <span style={{ color: !redFlag ? '' : colorRemote }}>
                  {numberSeparatorRender(value, record.getState('currency_precision'), {
                    omitZeroFlag: true,
                  })}
                </span>
              );
            },
          }
        : {
            name: 'validNetPrice',
            width: 100,
            renderer: ({ record, value }) =>
              this.renderRedMinPrice({ value, record, name: 'validNetPrice' }),
          },
      {
        name: 'preQuotationPrice',
        width: 100,
      },
      {
        name: 'priceFluctuation',
        width: 100,
      },
      !isOfflineFlag && {
        name: 'currentBargainPrice',
        width: 120,
        editor: (line) => {
          return (
            <C7nPrecisionInputNumber
              name="currentBargainPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      !isOfflineFlag && {
        name: 'currentBargainRemark',
        width: 100,
        editor: true,
      },
      !isOfflineFlag && {
        name: 'validBargainPrice',
        width: 130,
      },
      !isOfflineFlag && {
        name: 'validBargainRemark',
        width: 120,
        // renderer: this.popoverRender,
      },
      isOfflineFlag
        ? {
            name: 'taxIncludedFlag',
            width: 100,
            editor: (record) => {
              return <CheckBox onChange={() => dynamicChangePrice({ record })} />;
            },
          }
        : {
            name: 'taxIncludedFlag',
            width: 100,
            renderer: ({ value }) => yesOrNoRender(Number(value)),
          },
      isOfflineFlag
        ? {
            name: 'taxId',
            editor: (record) => {
              return (
                <Lov
                  paramMatcher={({ text }) => {
                    return !isNaN(text) ? { taxRate: text } : { taxCode: text };
                  }}
                  onChange={() => dynamicChangePrice({ record })}
                />
              );
            },
          }
        : {
            name: 'taxRate',
            width: 100,
          },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: this.ladderInquiryrender,
      },
      // 此列二开，禁止修改字段名
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => (
          <Fragment>
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              uiType="c7n"
              allowBuyerViewFlag
              bidFlag={sourceKey === 'BID'}
            />
            {/* {isOfflineFlag && record.get('quotationDetailRequire') === 1 && (
              <Badge style={{ marginLeft: '2px' }} status="error" />
            )} */}
          </Fragment>
        ),
      },
      isOfflineFlag
        ? {
            name: 'currentQuotationRemark',
            width: 100,
            editor: true,
          }
        : null,
      isOfflineFlag
        ? {
            name: 'validQuotationRemark',
            width: 100,
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 100,
      },
      isOfflineFlag
        ? {
            name: 'currentQuotationQuantity',
            width: 100,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationQuantity"
                  uom="uomId"
                  record={record}
                  onChange={() => dynamicChangePrice({ record })}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : {
            name: 'validQuotationQuantity',
            width: 100,
          },
      {
        name: 'uomName',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? isOfflineFlag
          ? {
              name: 'currentQuotationSecQuantity',
              width: 100,
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="currentQuotationSecQuantity"
                    uom="secondaryUomId"
                    record={record}
                    onBlur={(val) => this.changeCurrentQuotationSecondaryQuantity(val, record)}
                  />
                );
              },
              renderer: ({ record, value }) =>
                doubleUnitFlag && record.get('itemId')
                  ? numberSeparatorRender(value)
                  : numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : {
              name: 'validQuotationSecQuantity',
              width: 100,
            }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      isOfflineFlag
        ? {
            name: 'currentExpiryDateFrom',
            width: 120,
            editor: true,
          }
        : {
            name: 'validExpiryDateFrom',
            width: 120,
          },
      isOfflineFlag
        ? {
            name: 'currentExpiryDateTo',
            width: 120,
            editor: true,
          }
        : {
            name: 'validExpiryDateTo',
            width: 120,
          },
      isOfflineFlag
        ? {
            name: 'currentPromisedDate',
            width: 120,
            editor: true,
          }
        : {
            name: 'validPromisedDate',
            width: 120,
          },
      isOfflineFlag
        ? {
            name: 'currentDeliveryCycle',
            width: 120,
            editor: true,
          }
        : {
            name: 'validDeliveryCycle',
            width: 120,
          },
      {
        name: 'minPurchaseQuantity',
        width: 100,
        editor: isOfflineFlag,
      },
      {
        name: 'minPackageQuantity',
        width: 100,
        editor: isOfflineFlag,
      },
      isOfflineFlag
        ? {
            name: 'freightIncludedFlag',
            width: 100,
            renderer: ({ record }) => {
              return (
                <CheckBox
                  name="freightIncludedFlag"
                  record={record}
                  onChange={(value) => this.suggestedFlagChange(value, record)}
                />
              );
            },
          }
        : {
            name: 'freightIncludedFlag',
            width: 100,
            renderer: ({ value }) => yesOrNoRender(Number(value)),
          },
      {
        name: 'freightAmount',
        width: 100,
        editor: isOfflineFlag,
      },
      {
        name: 'minPrice',
        width: 150,
        hidden: !isOfflineFlag,
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'newPrice',
        width: 150,
      },
      {
        name: 'companyName',
        width: 120,
        // renderer: this.popoverRender,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 180,
        renderer: ({ record }) => {
          return !newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              readOnly
              viewMode="popup"
              record={record}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              data={{
                tenantId: organizationId,
              }}
              funcType="link"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_BARGAIN_PROCESS_ALL_ONLINE_COLUMN', columns, {
          isOfflineFlag,
          AllTableDS,
          bidFlag: sourceKey === 'BID',
          bargainHeader,
        })
      : columns;
  }

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderOnRow() {}

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  getTableProps(tableProps) {
    return tableProps;
  }

  render() {
    const {
      AllTableDS,
      customizeTable,
      isOfflineFlag,
      sourceKey = INQUIRY,
      onSearchBarRef,
      handleEditCounterOffers = () => {},
      bargainFlag,
      remote,
      bargainHeader = {},
      rfxHeaderId,
    } = this.props;

    let tableProps = {
      searchBarRef: onSearchBarRef,
      dataSet: AllTableDS,
      columns: this.getColumns(),
      showAllPageSelectionButton: bargainFlag,
      searchBarConfig: {
        right: {
          render: () =>
            bargainFlag ? (
              <Button color="primary" onClick={handleEditCounterOffers}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.button.fillCounteroffers`)
                  .d('批量填写还价')}
              </Button>
            ) : (
              <span />
            ),
        },
        onQuery: ({ params }) => {
          AllTableDS.queryDataSet.loadData([params]);
          AllTableDS.query(undefined, undefined, true);
        },
        checkDataSetStatus: false, // 解决出现【当前操作将会清空变更过的数据，是否继续？】弹框提示
      },
      searchCode: isOfflineFlag
        ? `SSRC.${sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`
        : `SSRC.${sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY`,
      onRow: this.renderOnRow,
      // style: getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight,
      style: {
        maxHeight: 'calc(100vh - 350px)',
      },
    };

    tableProps = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_ALL_ONLINE_TABLEPROPS', tableProps, {
          AllTableDS,
          bargainHeader,
          rfxHeaderId,
          that: this,
        })
      : tableProps;
    tableProps = tableProps || {};

    return customizeTable(
      {
        code: isOfflineFlag
          ? `SSRC.${sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE`
          : `SSRC.${sourceKey}_HALL_BARGAIN.ALLQUOTATION`,
      },
      <SearchBarTable {...this.getTableProps(tableProps)} />
    );
  }
}

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: ['SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION'],
  })(Com);
};

export default HOCComponent(All);
export { All, HOCComponent };
