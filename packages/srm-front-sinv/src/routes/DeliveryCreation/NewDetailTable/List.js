import React, { Fragment, useCallback, useRef } from 'react';
import { Table, NumberField, TextArea, Button, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { isNil, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { CustModal } from '@/routes/components/C7nCustomModal';
import ImageList from '@/routes/components/ImageList';
import { Addlist } from './AddList';
import { LogisticsForm } from './LogisticsForm';
import { showBigNumber } from '@/routes/components/utils';
import BomModal from './BomModal';

const { TabPane } = Tabs;

const List = (props) => {
  const {
    phone,
    addListDs,
    lineListDs,
    logisticsFormDs,
    customizeForm,
    asnHeaderId,
    customizeTable,
    customizeBtnGroup,
    saveList = (e) => e,
    lineDelete = (e) => e,
    // attachmentUuidList = (e) => e,
  } = props;

  const bomModal = useRef(null);

  const splitLine = (record) => {
    const { data } = record;
    const dataList = {
      ...data,
      asnLineId: null,
      shipQuantity: record.get('shipQuantity'),
      displayAsnLineNum: null,
      _status: 'create',
      _token: null,
    };
    lineListDs.create(dataList);
  };

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   * @param {string} uomType -单位类型
   */

  const showUomText = (record, uomType) => {
    let _code;
    let _name;
    let text;
    const unitCodeIsShow = record.get('unitCodeIsShow');
    if (uomType === 'weightUom') {
      _code = record.get('weightUomCode');
      _name = record.get('weightUomName');
    } else if (uomType === 'uom') {
      _code = record.get('uomCode');
      _name = record.get('uomName');
    }
    text = _name && _code ? <span>{`${_code}/${_name}`}</span> : null;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && _code && _name ? `${_code}/${_name}` : _name;
    }
    return text;
  };

  // 处理浮点数乘法
  // const floatMultiply = (arg1, arg2) => {
  //   if (arg1 == null || arg2 == null) {
  //     return null;
  //   }
  //   let r1;
  //   let r2; // 小数位数
  //   try {
  //     r1 = arg1.toString().split('.')[1].length;
  //   } catch (e) {
  //     r1 = 0;
  //   }
  //   try {
  //     r2 = arg2.toString().split('.')[1].length;
  //   } catch (e) {
  //     r2 = 0;
  //   }
  //   const n1 = Number(arg1.toString().replace('.', ''));
  //   const n2 = Number(arg2.toString().replace('.', ''));
  //   return (n1 * n2) / 10 ** (r1 + r2);
  // };

  // const attachmentUuidLists = (val, record) => {
  //   attachmentUuidList(val, record);
  // };

  const openModal = useCallback(() => {
    const listProps = {
      addListDs,
      asnHeaderId,
    };
    if (addListDs.queryDataSet) {
      addListDs.queryDataSet.reset();
    }
    Modal.open({
      closable: true,
      title: intl.get('sinv.common.view.message.title.addItemInfo').d('新增物料信息'),
      drawer: true,
      size: 'large',
      children: <Addlist {...listProps} />,
      onOk: () => saveList(),
    });
  });

  const openModalBom = useCallback((record) => {
    const listProps = {
      asnHeaderId,
      asnLineId: record.get('asnLineId'),
    };
    Modal.open({
      closable: true,
      title: `${intl.get(`sinv.common.view.title.titleBom`).d('外协BOM')}【${record?.get(
        'itemCode'
      )}/${record?.get('itemName')}】`,
      drawer: true,
      size: 'large',
      children: <BomModal ref={bomModal} {...listProps} />,
      okText: intl.get(`slod.shipmentsConfiguration.view.title.detail.save`).d('保存'),
      onOk: () => bomModal.current.saveOnChange(),
    });
  });

  const columns = [
    {
      name: 'action',
      with: 80,
      renderer: ({ record }) => {
        return (
          <a onClick={() => splitLine(record)}>
            {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
          </a>
        );
      },
    },
    {
      name: 'displayAsnLineNum',
      with: 120,
      sortable: true,
    },
    {
      name: 'itemCode',
      with: 150,
      sortable: true,
    },
    {
      name: 'itemName',
      with: 200,
    },
    {
      name: 'supplierItemNum',
      with: 120,
    },
    {
      name: 'supplierItemDesc',
      with: 140,
    },
    {
      name: 'quantity',
      with: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'canShipQuantity',
      with: 140,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'uomName',
      with: 120,
      renderer: ({ record }) => showUomText(record, 'uom'),
    },
    {
      name: 'shipQuantity',
      with: 120,
      editor: (record) => (
        <NumberField
          min={0}
          numberGrouping
          onBlur={() => {
            // 行金额=本次发货数量*订单行原币含税单价/订单行的每
            const unitPriceBatch = record.get('unitPriceBatch');
            const _shipQuantity = record.get('shipQuantity');
            const enteredTaxIncludedPrice = record.get('enteredTaxIncludedPrice');
            let taxIncludedLineAmount = math.multipliedBy(enteredTaxIncludedPrice, _shipQuantity);
            if (unitPriceBatch) {
              taxIncludedLineAmount = math.div(taxIncludedLineAmount, unitPriceBatch);
            }
            if (!isNil(record.get('financialPrecision')) && !isNil(taxIncludedLineAmount)) {
              taxIncludedLineAmount = math.plus(
                math.toFixed(taxIncludedLineAmount, record.get('financialPrecision')),
                0
              );
            }
            if (_shipQuantity && !isNil(enteredTaxIncludedPrice) && !isNil(taxIncludedLineAmount)) {
              record.set({
                taxIncludedLineAmount,
              });
            }
            // 件数=本次发货数量/单包装数     尾数=本次数量-单包装数*件数
            const _theShipQuantity = record.get('shipQuantity');
            const _unitPackageQuantity = record.get('unitPackageQuantity');
            if (!isNil(_theShipQuantity) && _unitPackageQuantity) {
              const packageQuantity = math.floor(math.div(_theShipQuantity, _unitPackageQuantity));
              const _remainderQuantity = math.minus(
                _theShipQuantity,
                math.multipliedBy(
                  _unitPackageQuantity,
                  math.floor(math.div(_theShipQuantity, _unitPackageQuantity))
                )
              );
              record.set({
                packageQuantity,
                remainderQuantity: _remainderQuantity,
              });
            }
          }}
        />
      ),
    },
    {
      name: 'taxIncludedLineAmount',
      with: 120,
      editor: (record) =>
        !isNil(record.get('uomPrecision')) ? (
          <NumberField
            min={0}
            disabled
            numberGrouping
            precision={record.get('financialPrecision')}
          />
        ) : (
          <NumberField min={0} disabled numberGrouping />
        ),
    },
    {
      name: 'grossWeightStandard',
      with: 120,
      editor: () => <NumberField min={0} numberGrouping />,
    },
    {
      name: 'netWeightStandard',
      with: 120,
      editor: true,
    },
    {
      name: 'weightUomId',
      with: 200,
      editor: true,
    },
    {
      name: 'unitPackageQuantity',
      with: 130,
      editor: (record) => (
        <NumberField
          min={0}
          onBlur={(event) => {
            const max = record.get('shipQuantity');
            if (math.gt(event.target.value, max)) {
              record.set({ unitPackageQuantity: '' });
            }
            // 件数=本次发货数量/单包装数     尾数=本次数量-单包装数*件数
            const _theShipQuantity = record.get('shipQuantity');
            const _unitPackageQuantity = record.get('unitPackageQuantity');
            if (!isNil(_theShipQuantity) && _unitPackageQuantity) {
              const packageQuantity = math.floor(math.div(_theShipQuantity, _unitPackageQuantity));
              const _remainderQuantity = math.minus(
                _theShipQuantity,
                math.multipliedBy(
                  _unitPackageQuantity,
                  math.floor(math.div(_theShipQuantity, _unitPackageQuantity))
                )
              );
              record.set({
                packageQuantity,
                remainderQuantity: _remainderQuantity,
              });
            }
          }}
        />
      ),
    },
    {
      name: 'packageQuantity',
      with: 120,
      editor: true,
    },
    {
      name: 'remainderQuantity',
      with: 120,
      editor: true,
    },
    {
      name: 'lotNum',
      with: 120,
      editor: true,
    },
    {
      name: 'productionDate',
      with: 120,
      editor: true,
    },
    {
      name: 'shelfLife',
      with: 120,
      editor: true,
    },
    {
      name: 'lotExpirationDate',
      with: 120,
      editor: true,
    },
    {
      name: 'serialNum',
      with: 120,
      editor: true,
    },
    {
      name: 'invoiceNum',
      with: 120,
      editor: true,
    },
    {
      name: 'supplierRemark',
      with: 170,
      editor: () => <TextArea rows={1} />,
    },
    {
      name: 'displayPoNum',
      with: 80,
    },
    {
      name: 'displayReleaseNum',
      with: 80,
    },
    {
      name: 'displayLineNum',
      with: 80,
    },
    {
      name: 'displayLineLocationNum',
      with: 80,
    },
    {
      name: 'versionNum',
      with: 80,
    },
    {
      name: 'batchNo',
      with: 80,
    },
    {
      name: 'neededDate',
      with: 80,
    },
    {
      name: 'promisedDate',
      with: 80,
    },
    {
      name: 'inventoryName',
      with: 80,
    },
    {
      name: 'locationName',
      with: 80,
    },
    {
      name: 'productionOrderNum',
      with: 80,
    },
    {
      name: 'contactInfo',
      with: 80,
    },
    {
      name: 'productNum',
      with: 80,
    },
    {
      name: 'productName',
      with: 80,
    },
    {
      name: 'catalogueName',
      with: 80,
    },
    {
      name: 'purchaseRemark',
      with: 80,
    },
    {
      name: 'otherAttachmentUuid',
      with: 80,
      // renderer: ({ val, record }) => (
      //   <a onClick={() => attachmentUuidLists(val, record)}>
      //     {intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看')}
      //     <Tag
      //       color="#108ee9"
      //       style={{
      //         height: 'auto',
      //         lineHeight: '15px',
      //         marginLeft: '4px',
      //       }}
      //     >
      //       {/* {record.get('picNums')} */}
      //       {0}
      //     </Tag>
      //   </a>
      // ),
    },
    {
      name: 'supplierItemCode',
      with: 80,
    },
    {
      name: 'supplierItemName',
      with: 80,
    },
    {
      name: 'attachmentUuid',
      with: 80,
      editor: true,
    },
    {
      name: 'purchaseAgentName',
      with: 80,
    },
    {
      name: 'commonName',
      with: 80,
    },
    {
      name: 'bom',
      // with: 80,
      renderer: ({ record }) => (
        <a onClick={() => openModalBom(record)}>{intl.get(`hzero.common.button.view`).d('查看')}</a>
      ),
    },
    {
      name: 'customSpecsJson',
      with: 80,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
    {
      name: 'attachmentUrlList',
      with: 80,
      renderer: ({ value }) => {
        return <ImageList imageDTO={value.slice() || []} />;
      },
    },
  ];

  const formProps = {
    phone,
    customizeForm,
    logisticsFormDs,
  };
  const LineBtn = observer(({ dataSet }) => {
    return customizeBtnGroup({ code: `SINV.DELIVERY_CREATION_DETAIL.BBUTTONS.BASIC_BTN` }, [
      <Button
        data-name="add"
        icon="playlist_add"
        type="c7n-pro"
        color="primary"
        funcType="flat"
        onClick={() => openModal(true)}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        data-name="delete"
        icon="delete"
        type="c7n-pro"
        color="primary"
        funcType="flat"
        disabled={isEmpty(dataSet?.selected)}
        onClick={() => lineDelete()}
      >
        {intl.get(`hzero.common.button.delete`).d('删除')}
      </Button>,
    ]);
  });
  return (
    <Fragment>
      <Content style={{ marginTop: 0, marginBottom: 8, padding: 20 }}>
        <Tabs animated={false}>
          <TabPane
            tab={intl.get(`sinv.common.view.message.title.itemInfo`).d('基础信息')}
            key="itemInfo"
          >
            {customizeTable(
              {
                code: `SINV.DELIVERY_CREATION_DETAIL.LINE_BASIC`,
                __force_record_to_update__: true,
              },
              <Table
                virtual
                dataSet={lineListDs}
                columns={columns}
                style={{ maxHeight: 400 }}
                buttons={[<LineBtn dataSet={lineListDs} />]}
              />
            )}
          </TabPane>
          <TabPane
            forceRender
            tab={intl.get(`sinv.common.view.message.title.logistics`).d('物流信息')}
            key="logisticsInfo"
          >
            <LogisticsForm {...formProps} />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export { List };
