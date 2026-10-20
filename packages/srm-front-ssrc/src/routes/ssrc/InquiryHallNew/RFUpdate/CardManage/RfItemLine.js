import React, { useMemo, useContext, useCallback } from 'react';
import { Table, Lov, Button, Modal, Form, Output, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { debounce, isEmpty } from 'lodash';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import CommonImportNew from 'srm-front-boot/lib/components/Import';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { calculateBasicQty } from '@/utils/utils';
import notification from 'utils/notification';

import Store from '../store/index';
import styles from '../../rfComponents/common.less';

const organizationId = getCurrentOrganizationId();

export default observer(function RfItemLineCard(props) {
  const {
    routerParams: { rfHeaderId, sourceCategory },
    commonDs: { rfItemLineDs, ladderQuotationTableDs, basicFormDs },
    customizeTable,
    history,
    remote,
  } = useContext(Store);

  const { doubleUnitFlag, configSheet } = props;

  // 单据来源为采购申请转立项转寻源
  const purchaseRequestFlag = rfItemLineDs?.some((item) => item && item?.get('prLineId'));

  /**
   * 批量导入
   */
  const handleBatchExport = () => {
    if (!rfHeaderId || rfHeaderId === 'null') {
      return;
    }

    const Props = {
      code: 'SSRC.RF_QUOTATION.ITEM',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfHeaderId,
        templateCode: 'SSRC.RF_QUOTATION.ITEM',
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RF_QUOTATION.ITEM',
      auto: true,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.rf.view.message.tab.itemDetails`).d('物品明细'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: () => rfItemLineDs.query(),
    });
  };

  const showLadderQuotation = (record) => {
    const { itemCode, secondaryUomId, uomId } = record.get(['itemCode', 'secondaryUomId', 'uomId']);
    if (itemCode && doubleUnitFlag) {
      if (!secondaryUomId || !uomId) {
        notification.warning({
          message: intl.get(`ssrc.common.model.inquiryHall.chooseUnit`).d('请先填写单位！'),
        });
        return;
      }
    }
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('rfLineItemId', record.get('rfLineItemId'));
    ladderQuotationTableDs.query();
    const columns = [
      {
        name: 'rfLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 120,
            editor: (ladderRecord) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryLadderFrom"
                  record={ladderRecord}
                  uom="secondaryUomId"
                  onInput={(e = null) =>
                    changeDoubleUnit(record, 'secondaryLadderFrom', e?.target?.value, ladderRecord)
                  }
                />
              );
            },
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 120,
            editor: (ladderRecord) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryLadderTo"
                  record={ladderRecord}
                  uom="secondaryUomId"
                  onInput={(e = null) =>
                    changeDoubleUnit(record, 'secondaryLadderTo', e?.target?.value, ladderRecord)
                  }
                />
              );
            },
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
        editor: true,
      },
      {
        name: 'ladderTo',
        width: 120,
        editor: true,
      },
      {
        name: 'ladderRemark',
        width: 120,
        editor: true,
      },
    ];
    const buttons = [
      ['add', { onClick: () => ladderQuotationTableDs.create({}, ladderQuotationTableDs.length) }],
      ['delete', { onClick: () => handleDeleteItem(ladderQuotationTableDs) }],
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.rf.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      className: styles['rf-ladder-quotation-modal-wrapper'],
      okText: intl.get('ssrc.common.button.save').d('保存'),
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
          <h3 className={styles['ladder-sub-title']} style={{ marginTop: '32px' }}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            dataSet={ladderQuotationTableDs}
            columns={columns}
            buttons={buttons}
            style={{ maxHeight: 'calc(100vh - 370px)' }}
            customizedCode="SSRC.INQUIRY_HALL.RF_EDIT.LINE_LADDER_QUOTATION"
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
      onOk: async () => {
        record.set('ladderOffer', 1);
        await ladderQuotationTableDs.submit();
      },
    });
  };

  const handleDeleteItem = (ds = {}) => {
    const { selected } = ds;

    const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
    if (!unAddSelectedLines?.length) {
      ds.remove(selected, 1);
      // 如果勾选的数据全部为新建的，删除完毕重排行号
      ds.forEach((item, index) => {
        if (!item) {
          return;
        }
        item.set('rfLadderLineNum', index + 1);
      });
    }
    const unAddAllLines = ds.filter((line) => line.status !== 'add');
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
    ds.delete(unAddSelectedLines, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  // 基本数量计算
  const changeDoubleUnit = useCallback(
    debounce((record, type, val, ladderRecord) => {
      const { itemId = '', uomId = '', secondaryUomId = '', rfLineItemId = '' } = record.get([
        'itemId',
        'uomId',
        'secondaryUomId',
        'rfLineItemId',
      ]);
      let secondaryQuantity = record.get('secondaryQuantity');
      if (type && !val) {
        if (type === 'secondaryLadderFrom') {
          ladderRecord.set({ ladderFrom: val });
        } else if (type === 'secondaryLadderTo') {
          ladderRecord.set({ ladderTo: val });
        }
        return;
      } else if (type) {
        secondaryQuantity = val;
      }
      if (secondaryQuantity && itemId && uomId && secondaryUomId && doubleUnitFlag) {
        calculateBasicQty({
          secondaryQuantity,
          itemId,
          businessKey: rfLineItemId || '-1',
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          if (res) {
            if (type === 'secondaryLadderFrom') {
              ladderRecord.set({ ladderFrom: res });
            } else if (type === 'secondaryLadderTo') {
              ladderRecord.set({ ladderTo: res });
            } else {
              record.set({ demandQuantity: res });
            }
          } else if (type === 'secondaryLadderFrom') {
            ladderRecord.set({ ladderFrom: 0 });
          } else if (type === 'secondaryLadderTo') {
            ladderRecord.set({ ladderTo: 0 });
          } else {
            record.set({ demandQuantity: 0 });
          }
        });
      } else if (type) {
        if (type === 'secondaryLadderFrom') {
          ladderRecord.set({ ladderFrom: val });
        } else if (type === 'secondaryLadderTo') {
          ladderRecord.set({ ladderTo: val });
        }
      } else {
        record.set({ demandQuantity: secondaryQuantity });
      }
    }, 500),
    [doubleUnitFlag]
  );

  // 采购申请行跳转
  const linktoPrNumDetail = useCallback(
    (record = {}, prHeaderId = '') => {
      const { sprmOldUiConfig = false } = configSheet;
      const prSourcePlatform = record.get('prSourcePlatform') || null;
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
      let pathUrl = null;
      if (!sprmOldUiConfig) {
        // 采购申请工作台
        pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      } else {
        pathUrl = isErp
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
      }

      history.push({
        pathname: pathUrl,
      });
    },
    [history, configSheet]
  );

  const getTabActiveKey = () => {
    const { sprmOldUiConfig = false } = configSheet;
    let tabKey = '';
    if (!sprmOldUiConfig) {
      tabKey =
        window.dvaApp?._store
          ?.getState?.()
          ?.global?.menuLeafNode?.find?.((i) => i.path === '/sprm/purchase-platform')?.path || null;
    } else {
      tabKey =
        window.dvaApp?._store
          ?.getState?.()
          ?.global?.menuLeafNode?.find?.((i) => i.path === '/sprm/purchase-requisition-inquiry')
          ?.path || null;
    }
    return tabKey;
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfLineItemNum',
          width: 80,
        },
        basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
          ? {
              name: 'sectionCode',
              width: 120,
              editor: (record) => record.status === 'add',
            }
          : null,
        basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
          ? {
              name: 'sectionName',
              width: 120,
            }
          : null,
        {
          name: 'ouIdLov',
          width: 150,
          editor: true,
        },
        {
          name: 'invOrganizationIdLov',
          width: 150,
          editor: true,
        },
        {
          name: 'itemIdLov',
          width: 150,
          editor: (record) => (
            <Lov
              editor
              dataSet={rfItemLineDs}
              name="itemIdLov"
              onChange={() => changeDoubleUnit(record)}
            />
          ),
        },
        {
          name: 'itemName',
          editor: true,
          width: 150,
        },
        {
          name: 'itemCategoryIdLov',
          editor: (
            <Lov
              editor
              dataSet={rfItemLineDs}
              name="itemCategoryIdLov"
              tableProps={{
                selectionMode: 'rowbox',
                virtual: true,
                style: {
                  maxHeight: '500px',
                },
              }}
              // lovEvents={{
              //   query: (itemPorps) => {
              //     const lovDS = itemPorps.dataSet;
              //     lovDS.paging = 'server';
              //   },
              // }}
            />
          ),
          width: 150,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 120,
              editor: (record) => {
                return (
                  <C7nPrecisionInputNumber
                    name="secondaryQuantity"
                    record={record}
                    uom="secondaryUomId"
                    onChange={() => changeDoubleUnit(record)}
                  />
                );
              },
              renderer: ({ value, record }) =>
                numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'secondaryUomIdLov',
              width: 150,
              editor: (record) => (
                <Lov
                  editor
                  dataSet={rfItemLineDs}
                  name="secondaryUomIdLov"
                  textField="uomName"
                  onChange={() => changeDoubleUnit(record)}
                />
              ),
            }
          : null,
        {
          name: 'demandQuantity',
          width: 120,
          editor: (record) => {
            return <C7nPrecisionInputNumber name="demandQuantity" record={record} uom="uomId" />;
          },
          renderer: ({ value, record }) =>
            doubleUnitFlag && record.get('itemId')
              ? numberSeparatorRender(value)
              : numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          name: 'uomIdLov',
          width: 150,
          editor: true,
        },
        {
          name: 'priceBatch',
          width: 150,
          editor: true,
        },
        {
          name: 'taxIncludedFlag',
          width: 100,
          editor: true,
        },
        {
          name: 'taxIdLov',
          width: 150,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="taxIdLov"
                paramMatcher={({ text }) => {
                  return !isNaN(text) ? { taxRate: text } : { taxCode: text };
                }}
              />
            );
          },
          // renderer: ({ record }) => {
          //   return record.get('taxRate') === 0 ? '0' : record.get('taxRate');
          // },
        },
        {
          name: 'demandDate',
          width: 150,
          editor: true,
        },
        {
          name: 'ladderOffer',
          width: 100,
          renderer: ({ record }) =>
            record.status !== 'add' ? (
              <a onClick={() => showLadderQuotation(record)}>
                {intl.get(`ssrc.rf.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
            ) : null,
        },
        purchaseRequestFlag
          ? {
              name: 'prNum',
              width: 150,
              renderer: ({ record, value }) => {
                // const prData = record.get('prData');
                const prHeaderId = record.get('prHeaderId');
                if (prHeaderId) {
                  // if (prData) {
                  //   return JSON.parse(prData).map(prItem => {
                  //     return getTabActiveKey() ? (
                  //       <a onClick={() => linktoPrNumDetail(record, prItem.prHeaderId)}>
                  //         {`${prItem.prNum}|${prItem.lineNum}`}{' '}
                  //       </a>
                  //     ) : (
                  //       `${prItem.prNum}|${prItem.lineNum}`
                  //     );
                  //   });
                  // } else {
                  return getTabActiveKey() ? (
                    <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>
                  ) : (
                    value
                  );
                  // }
                } else {
                  return value;
                }
              },
            }
          : null,
        purchaseRequestFlag
          ? {
              name: 'prDisplayLineNum',
              width: 150,
            }
          : null,
        {
          name: 'projectTaskId',
          width: 150,
          editor: (record) => {
            const otherProps = {
              virtual: true,
              style: {
                maxHeight: '500px',
              },
            };
            return (
              <Lov
                editor
                record={record}
                name="projectTaskId"
                tableProps={{
                  selectionMode: 'rowbox',
                  ...otherProps,
                }}
              />
            );
          },
        },
        {
          name: 'attachmentUuid',
          width: 150,
          editor: true,
          renderer: ({ record }) => (
            <Attachment
              record={record}
              viewMode="popup"
              fileSize={FIlESIZE}
              label={intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')}
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rf-rfitem"
              data={{
                tenantId: organizationId,
              }}
              {...ChunkUploadProps}
            />
          ),
        },
      ].filter(Boolean),
    [basicFormDs?.current, doubleUnitFlag, purchaseRequestFlag, configSheet]
  );

  const standardColumns = remote
    ? remote.process('SSRC_INQUIRY_UPDATE_RF_ITEM_LINE_COLUMNS', columns, {
        rfHeaderId,
        sourceCategory,
        rfItemLineDs,
        ladderQuotationTableDs,
        basicFormDs,
      })
    : columns;

  const buttons = useMemo(
    () => [
      ['add', { name: 'add' }],
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        disabled={isEmpty(rfItemLineDs.selected)}
        onClick={() => handleDeleteItem(rfItemLineDs)}
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      ['save', { name: 'save' }],
      <Button onClick={handleBatchExport} icon="archive" name="itemImport">
        {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
      </Button>,
      <CommonImportNew
        businessObjectTemplateCode="SSRC.RF_QUOTATION.ITEM"
        prefixPatch={SRM_SSRC}
        buttonText={intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
        buttonProps={{
          icon: 'archive',
          funcType: 'flat',
          color: 'primary',
          permissionList: [
            {
              code: `ssrc.new-inquiry-hall.rf-update.${sourceCategory}.button.item-import-new`?.toLowerCase(),
              type: 'button',
              meaning:
                intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('询价工作台') -
                intl.get(`ssrc.inquiryHall.view.button.import`).d('导入'),
            },
          ],
        }}
        args={{
          tenantId: organizationId,
          organizationId,
          rfHeaderId,
          templateCode: 'SSRC.RF_QUOTATION.ITEM',
        }}
        successCallBack={() => rfItemLineDs.query()}
      />,
    ],
    [rfItemLineDs, rfHeaderId, rfItemLineDs?.selected]
  );

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_${sourceCategory}`,
      buttonCode: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_HEADER_BUTTONS_${sourceCategory}`,
    },
    <Table dataSet={rfItemLineDs} columns={standardColumns} buttons={buttons} />
  );
});
