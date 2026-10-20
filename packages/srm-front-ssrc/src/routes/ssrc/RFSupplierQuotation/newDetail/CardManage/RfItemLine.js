import React, { useMemo, useContext, useCallback, useImperativeHandle } from 'react';
import { Badge } from 'choerodon-ui';
import {
  Table,
  Modal,
  Form,
  Output,
  DataSet,
  Attachment,
  Lov,
  CheckBox,
  NumberField,
} from 'choerodon-ui/pro';
import classnames from 'classnames';

import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { calculateBasicQty } from '@/utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';
import { Store } from '../store/index';
import { ladderQuotationTableDS } from '../store/storeDS';
import styles from '../rfComponent/common.less';

const organizationId = getCurrentOrganizationId();

export default observer(function RfItemLineCard(props) {
  const { doubleUnitFlag, financialPrecision, currencyPrecision, caclRule, onRef } = props;
  const {
    remote,
    routerParams: { sourceCategory },
    commonDs: { rfItemLineDs, basicFormDs },
    storeData: { detailFlag, noBackFlag, participateFlag },
    customizeTable,
  } = useContext(Store);

  const tenantId = basicFormDs?.current?.get('tenantId');

  useImperativeHandle(
    onRef,
    () => ({
      dynamicChangePrice,
    }),
    [caclRule, financialPrecision, currencyPrecision]
  );

  const showLadderQuotation = (record) => {
    if (!record) {
      return;
    }

    const ladderQuotationTableDs = new DataSet(
      ladderQuotationTableDS({
        participateFlag,
        detailFlag,
        noBackFlag,
        benchmarkPriceType: record.get('benchmarkPriceType'),
        taxRate: record.get('taxRate'),
        abandonedFlag: record.get('abandonedFlag'),
      })
    );

    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('quotationLineId', record.get('quotationLineId'));
    ladderQuotationTableDs.setQueryParameter(
      'quotationLineVersionId',
      record.get('quotationLineVersionId')
    );
    ladderQuotationTableDs.query();

    const handleDelete = () => {
      const { selected } = ladderQuotationTableDs;

      const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
      if (!unAddSelectedLines?.length) {
        ladderQuotationTableDs.remove(selected, 1);
        // 如果勾选的数据全部为新建的，删除完毕重排行号
        ladderQuotationTableDs.forEach((item, index) => {
          if (!item) {
            return;
          }
          item.set('rfLadderLineNum', index + 1);
        });
      }
      const unAddAllLines = ladderQuotationTableDs.filter((line) => line.status !== 'add');
      const endSelectedLine = unAddAllLines.slice(unAddAllLines.length - unAddSelectedLines.length);
      let matchFlag = 1;
      endSelectedLine.forEach((line) => {
        const rfLadderLineNum = line.get('rfLadderLineNum');
        const matchSelectedLine = unAddSelectedLines.find(
          (selectedLine) => selectedLine.get('rfLadderLineNum') === rfLadderLineNum
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
      ladderQuotationTableDs.delete(unAddSelectedLines, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
      });
    };

    const columns = [
      {
        name: 'rfLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 120,
            editor: (line) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="secondaryLadderFrom"
                    record={line}
                    headerRecord={record}
                    uom="secondaryUomId"
                    onBlur={(val) => changeQty(val, record, line, 'secondaryLadderFrom')}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ record: _record, value }) => {
              return numberSeparatorRender(value, _record.getState('uom_precision'));
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 120,
            editor: (line) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="secondaryLadderTo"
                    record={line}
                    headerRecord={record}
                    uom="secondaryUomId"
                    onBlur={(val) => changeQty(val, record, line, 'secondaryLadderTo')}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ record: _record, value }) => {
              return numberSeparatorRender(value, _record.getState('uom_precision'));
            },
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
        editor: (line) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                name="ladderFrom"
                record={line}
                headerRecord={record}
                uom="uomId"
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ record: _record, value }) => {
          return doubleUnitFlag && record.get('uomId') !== record.get('secondaryUomId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, _record.getState('uom_precision'));
        },
      },
      {
        name: 'ladderTo',
        width: 120,
        editor: (line) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                name="ladderTo"
                record={line}
                headerRecord={record}
                uom="uomId"
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ record: _record, value }) => {
          return doubleUnitFlag && record.get('uomId') !== record.get('secondaryUomId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, _record.getState('uom_precision'));
        },
      },
      doubleUnitFlag
        ? {
            name: 'validLadderSecondaryPrice',
            width: 120,
            editor: (line) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="validLadderSecondaryPrice"
                    record={line}
                    currency="currencyCode"
                    headerRecord={basicFormDs?.current}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ value, record: _record }) =>
              numberSeparatorRender(value, _record.getState('currency_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetLadderSecPrice',
            width: 120,
            editor: (line) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="validNetLadderSecPrice"
                    record={line}
                    currency="currencyCode"
                    headerRecord={basicFormDs?.current}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ value, record: _record }) =>
              numberSeparatorRender(value, _record.getState('currency_precision')),
          }
        : null,
      {
        name: 'validLadderPrice',
        width: 120,
        editor: (line) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                name="validLadderPrice"
                record={line}
                currency="currencyCode"
                headerRecord={basicFormDs?.current}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ value, record: _record }) =>
          numberSeparatorRender(value, _record.getState('currency_precision')),
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
        editor: (line) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                name="validNetLadderPrice"
                record={line}
                headerRecord={basicFormDs?.current}
                currency="currencyCode"
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ value, record: _record }) => {
          return numberSeparatorRender(value, _record.getState('currency_precision'), {
            omitZeroFlag: 1,
          });
        },
      },
      {
        name: 'remark',
        editor: !detailFlag,
      },
    ].filter(Boolean);
    const buttons = [
      ['add', { onClick: () => ladderQuotationTableDs.create({}, ladderQuotationTableDs.length) }],
      ['delete', { onClick: handleDelete, icon: 'delete_sweep' }],
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.rf.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 1090,
      },
      drawer: true,
      cancelButton: !detailFlag,
      onOk: () => ladderQuotationTableDs.submit(),
      okText: !detailFlag
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.close').d('关闭'),
      closable: true,
      className: styles['rf-ladder-quotation-modal-wrapper'],
      children: (
        <React.Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={2}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get('ssrc.rf.model.rf.itemCode').d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get('ssrc.rf.model.rf.itemName').d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            dataSet={ladderQuotationTableDs}
            columns={columns}
            buttons={!detailFlag && buttons}
            style={{ maxHeight: 'calc(100vh - 370px)' }}
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
        rfItemLineDs.query();
      },
    });
  };

  // render status -TODO 后边整改为查询meaning
  const renderStatus = (value) => {
    // let display = '';
    let meaning = '';

    switch (value) {
      case 'NEW':
        // display = (
        //   <Tag className="notSubmitted">
        //     {intl.get('ssrc.rf.view.card.subtitle.notSubmitted').d('未提交')}
        //   </Tag>
        // );
        meaning = intl.get('ssrc.rf.view.card.subtitle.notSubmitted').d('未提交');
        break;
      case 'SUBMITTED':
        // display = (
        //   <Tag className="submitted">
        //     {intl.get('ssrc.rf.view.card.subtitle.submitted').d('已提交')}
        //   </Tag>
        // );
        meaning = intl.get('ssrc.rf.view.card.subtitle.submitted').d('已提交');
        break;
      case 'ABANDONED':
        // display = (
        //   <Tag className="abandoned">
        //     {intl.get('ssrc.rf.view.card.subtitle.abandoned').d('已放弃')}
        //   </Tag>
        // );
        meaning = intl.get('ssrc.rf.view.card.subtitle.abandoned').d('已放弃');
        break;
      default:
        break;
    }

    return renderStatusTag({
      status: value,
      statusMeaning: meaning,
    });
  };

  // 可供数量
  const changeQty = useCallback(
    async (val, record, line, type) => {
      // 根据数量从、至，可供数量设置基本数量从、至，基本可供数量
      const setLineValue = (value) => {
        if (type === 'secondaryLadderFrom') {
          line.set('ladderFrom', value ?? '');
        } else if (type === 'secondaryLadderTo') {
          line.set('ladderTo', value ?? '');
        } else {
          record.set('validQuotationQuantity', value ?? '');
          dynamicChangePrice(record);
        }
      };
      // 在这个地方单独计算数量是因为精度组件会触发两次ds的update
      let secondaryQuantity = record.get('validQuotationSecQuantity');
      if (type && !val) {
        return;
      } else if (type) {
        secondaryQuantity = ['secondaryLadderFrom', 'secondaryLadderTo'].includes(type)
          ? line.get(type)
          : record.get(type);
      }
      if (record.get('itemId') && doubleUnitFlag) {
        if (record.get('secondaryUomId')) {
          const res = await calculateBasicQty({
            secondaryQuantity,
            itemId: record.get('itemId'),
            businessKey: record.get('rfxLineItemId') || record.id,
            doublePrimaryUomId: record.get('uomId'),
            secondaryUomId: record.get('secondaryUomId'),
            tenantId: basicFormDs?.current?.get('tenantId'),
          });
          setLineValue(res);
        }
      } else {
        setLineValue(secondaryQuantity);
      }
    },
    [doubleUnitFlag, basicFormDs?.current]
  );

  // 按照基准价动态计算价格
  const dynamicChangePrice = (record = {}) => {
    const benchmarkPriceType = record?.get('benchmarkPriceType');
    const isUnTaxPriceFlag = benchmarkPriceType === 'NET_PRICE';

    if (!isUnTaxPriceFlag) {
      handleChangeQuotationPrice(record);
    } else {
      handleChangeNetPrice(record);
    }
  };

  // 改变价格后统一数据处理
  const changePriceGetCommonProps = (record) => {
    if (!record) {
      return;
    }

    const {
      taxRate,
      taxIncludedFlag,
      validQuotationQuantity,
      validQuotationSecQuantity,
      benchmarkPriceType,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxRate',
        'validQuotationQuantity',
        'validQuotationSecQuantity',
        'benchmarkPriceType',
        'priceBatchQuantity',
        'taxRateType',
      ]) || {};

    const currentCurrencyPrecision = record.get('defaultPrecision') ?? currencyPrecision;
    const currentFinancialPrecision = record.get('financialPrecision') ?? financialPrecision;

    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'TAX_INCLUDED_PRICE';
    const COMMONS = {
      hasTax: isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision: currentFinancialPrecision,
      defaultPrecision: currentCurrencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const taxRateNew = taxIncludedFlag ? taxRate : 0;

    const CurrentQuantity = !doubleUnitFlag ? validQuotationQuantity : validQuotationSecQuantity;
    COMMONS.quantity = CurrentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;

    // 数量不存在，修改计算场景
    if (!CurrentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    return COMMONS;
  };

  // 改变含税后，计算价格
  const handleChangeQuotationPrice = (record) => {
    if (!record) {
      return;
    }

    let currentQuotationPrice = record.get('validQuotationPrice');
    if (doubleUnitFlag) {
      currentQuotationPrice = record.get('validQuotationSecPrice');
    }

    const CurrentPriceCOMMONS = {};
    CurrentPriceCOMMONS.taxUnitPrice = currentQuotationPrice;
    const CommonProps = changePriceGetCommonProps(record) || {};
    const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      validNetPrice: calcNetUnitPrice,
      totalAmount: calcTaxAmount,
      netAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.validNetSecondaryPrice = calcNetUnitPrice;
    }

    record.set(priceValueObject);
  };

  // change net price
  const handleChangeNetPrice = (record) => {
    if (!record) {
      return;
    }

    const { validNetPrice } = record?.get(['validNetPrice']) || {};

    let netPrice = validNetPrice;
    if (doubleUnitFlag) {
      netPrice = record.get('validNetSecondaryPrice');
    }

    const CurrentPriceCOMMONS = {};
    CurrentPriceCOMMONS.netUnitPrice = netPrice;
    const CommonProps = changePriceGetCommonProps(record) || {};
    const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
    const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      validQuotationPrice: calcTaxUnitPrice,
      totalAmount: calcTaxAmount,
      netAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.validQuotationSecPrice = calcTaxUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 改变税率
  const changeTax = (data, record) => {
    const { taxRate = null, taxId = null, taxRateType = null } = data || {};
    record.set({
      taxId,
      taxRate,
      taxRateType,
    });
    dynamicChangePrice(record);
  };

  // 改变含税标识
  const onChangeTaxIncludedFlag = (result, record) => {
    if (!result) {
      record.set({
        taxId: null,
        taxIdLov: null,
        taxRate: null,
        taxRateType: null,
      });
    }
    dynamicChangePrice(record);
  };

  // 修改可供数量
  const changeCurrentQuotationQuantity = (record) => {
    dynamicChangePrice(record);
  };

  // 价格批量
  const changePriceBatchQuantity = (_, record) => {
    dynamicChangePrice(record);
  };

  const columns = useMemo(
    () => [
      {
        name: 'quotationLineStatus',
        width: 100,
        renderer: ({ value }) => renderStatus(value),
      },
      {
        name: 'lineNum',
        width: 80,
      },
      basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionCode',
            width: 120,
          }
        : null,
      basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionName',
            width: 120,
          }
        : null,
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'abandonedFlag',
        width: 100,
        renderer: ({ value, record }) => {
          if (detailFlag) {
            return yesOrNoRender(value);
          }

          return <CheckBox name="abandonedFlag" record={record} />;
        },
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 120,
            editor: (record) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    headerRecord={basicFormDs?.current}
                    name="validQuotationSecPrice"
                    record={record}
                    currency="currencyCode"
                    onChange={() => handleChangeQuotationPrice(record)}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ value, dataSet }) => {
              const currentPrecision = currencyPrecision ?? dataSet.getState('currency_precision');
              return numberSeparatorRender(value, currentPrecision);
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 120,
            editor: (record) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    headerRecord={basicFormDs?.current}
                    name="validNetSecondaryPrice"
                    record={record}
                    currency="currencyCode"
                    onChange={() => handleChangeNetPrice(record)}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ value, dataSet }) => {
              const currentPrecision = currencyPrecision ?? dataSet.getState('currency_precision');
              return numberSeparatorRender(value, currentPrecision);
            },
          }
        : null,
      {
        name: 'validQuotationPrice',
        width: 120,
        editor: (record) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                headerRecord={basicFormDs?.current}
                name="validQuotationPrice"
                record={record}
                currency="currencyCode"
                onChange={() => handleChangeQuotationPrice(record)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ value, dataSet }) => {
          const currentPrecision = currencyPrecision ?? dataSet.getState('currency_precision');
          return numberSeparatorRender(value, currentPrecision);
        },
      },
      {
        name: 'validNetPrice',
        width: 120,
        editor: (record) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                headerRecord={basicFormDs?.current}
                name="validNetPrice"
                record={record}
                currency="currencyCode"
                onChange={() => handleChangeNetPrice(record)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ value, dataSet }) => {
          const currentPrecision = currencyPrecision ?? dataSet.getState('currency_precision');
          return numberSeparatorRender(value, currentPrecision);
        },
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value, record }) => {
          if (detailFlag) {
            return yesOrNoRender(value);
          }

          return (
            <CheckBox
              name="taxIncludedFlag"
              record={record}
              onChange={(e) => onChangeTaxIncludedFlag(e, record)}
            />
          );
        },
      },
      {
        name: 'taxIdLov',
        width: 150,
        align: 'right',
        editor: (record) => {
          if (detailFlag) {
            return false;
          }

          return (
            <Lov name="taxIdLov" record={record} onChange={(data) => changeTax(data, record)} />
          );
        },
        renderer: ({ record }) => {
          return record.get('taxRate') === 0 ? '0' : record.get('taxRate');
        },
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 120,
            align: 'right',
            editor: (record) => {
              return (
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="validQuotationSecQuantity"
                    record={record}
                    uom="secondaryUomId"
                    onBlur={(val) => changeQty(val, record)}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )
              );
            },
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'validQuotationQuantity',
        width: 120,
        align: 'right',
        editor: (record) => {
          return (
            !detailFlag && (
              <C7nPrecisionInputNumber
                name="validQuotationQuantity"
                record={record}
                uom="uomId"
                onChange={() => changeCurrentQuotationQuantity(record)}
                queryPrecisionParams={{
                  purTenantId: tenantId,
                }}
              />
            )
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <>
              {record.get('ladderInquiryRequireFlag') ? <Badge status="error" /> : null}
              <a onClick={() => showLadderQuotation(record)} disabled={record.get('abandonedFlag')}>
                {intl.get(`ssrc.rf.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
            </>
          ),
      },
      {
        name: 'totalAmount',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netAmount',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 120,
          }
        : null,
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'demandQuantity',
        width: 120,
      },
      {
        name: 'priceBatchQuantity',
        width: 150,
        // editor: !detailFlag,
        editor: (record) => {
          return (
            !detailFlag && (
              <NumberField
                name="priceBatchQuantity"
                record={record}
                onChange={(val) => changePriceBatchQuantity(val, record)}
              />
            )
          );
        },
      },
      {
        name: 'demandDate',
        width: 150,
      },
      {
        name: 'purchaseAttachmentUuid',
        width: 150,
        renderer: ({ record }) => (
          <Attachment
            readOnly
            record={record}
            viewMode="popup"
            sortable={false}
            fileSize={FIlESIZE}
            name="purchaseAttachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-rfitem"
            data={{
              tenantId: organizationId,
            }}
            funcType="link"
            className="ssrc-attachment-upload-component"
          />
        ),
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ record }) => (
          <Attachment
            record={record}
            viewMode="popup"
            sortable={false}
            fileSize={FIlESIZE}
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-rfitem"
            data={{
              tenantId: organizationId,
            }}
            funcType="link"
            className="ssrc-attachment-upload-component"
            {...ChunkUploadProps}
          />
        ),
      },
    ],
    [doubleUnitFlag, basicFormDs?.current, caclRule, financialPrecision, currencyPrecision]
  );

  const standardColumns = remote
    ? remote.process('SSRC_RF_SUPPLIER_QUOTATION_NEW_DETAIL_QUOTATION_LINE_COLUMNS', columns, {
        sourceCategory,
        rfItemLineDs,
        basicFormDs,
      })
    : columns;

  return customizeTable(
    {
      code: noBackFlag
        ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.QUOTATION_LINE`
        : detailFlag
        ? `SSRC.SUPPLIER_REPLY.RF_DETAIL.${sourceCategory}_QUOTATION_LINE`
        : `SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_LINE`,
    },
    <Table
      dataSet={rfItemLineDs}
      columns={standardColumns}
      className={classnames(styles['rfline-table'])}
      style={{ maxHeight: '430px' }}
    />
  );
});
