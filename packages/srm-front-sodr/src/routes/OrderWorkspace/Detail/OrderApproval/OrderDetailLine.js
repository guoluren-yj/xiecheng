/**
 * @Description:订单明细信息
 * @Date: 2021-09-16
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import { Modal, Tooltip, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import DocFlow from '_components/DocFlow';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';

import Bom from '@/routes/components/Bom';
import { renderStatus, viewCostInformation } from '@/routes/components/utils';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';

import {
  priceChangeTip,
  useAmountRender,
  useQuantityRender,
  useLocalAmountRender,
  useLocalPriceRender,
} from '@/routes/OrderWorkspace/hooks';
import styles from '../index.less';

const SHIED_FIELDS = [
  'unitPrice',
  'enteredTaxIncludedPrice',
  'lineAmount',
  'taxIncludedLineAmount',
  'domesticTaxIncludedPrice',
  'domesticUnitPrice',
  'domesticTaxIncludedLineAmount',
  'domesticLineAmount',
];

const yesNoRender = (text) =>
  intl
    .get(`${'hzero.common'}${Number(text) === 1 ? '.status.yes' : '.status.no'}`)
    .d(text === 1 ? '是' : '否');
const BOOL_FIELDS = ['consignedFlag', 'returnedFlag', 'freeFlag', 'immedShippedFlag'];
const MULTI_TEXT_FIILD = ['remark'];
const DetailInfo = (props) => {
  const {
    ds,
    basicInfoDs,
    customizeTable,
    bySourceCode,
    displayDocAndDocFlow = {},
    remote,
    isApprovalFlag,
  } = props;
  const basicCurrent = basicInfoDs?.current;
  const { displayPoNum, fundTermDimension } =
    basicCurrent?.get(['displayPoNum', 'fundTermDimension']) || {};
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  // 显示变更信息提示
  const renderChangeTip = (data, content) => {
    const { record, name, text } = data;
    const map = record.get('changeMap') || {};
    const priceShieldFlag = record.get('priceShieldFlag');
    const shieldFlag = priceShieldFlag === 1 && SHIED_FIELDS.includes(name);
    const dom = content || text;
    const defaultPlacement = 'topLeft';
    if (name in map) {
      let tipValue = map[name] || '【】';
      const placement = MULTI_TEXT_FIILD.includes(name) ? 'left' : defaultPlacement;
      if (BOOL_FIELDS.includes(name)) {
        [1, 0, '0', '1'].includes(map[name]);
        tipValue = yesNoRender(map[name]);
      }
      const tipContent = `${intl
        .get('sodr.common.model.common.beforeUpdate')
        .d('变更前')} : ${tipValue}`;
      if (shieldFlag) {
        return <span style={{ color: 'red' }}>{dom}</span>;
      } else {
        return (
          <Tooltip
            theme="light"
            placement={placement}
            title={tipContent}
            autoAdjustOverflow
            popupClassName={styles['change-tip-tooltip']}
          >
            {dom}
          </Tooltip>
        );
      }
    }
    return dom;
  };

  const columns = useMemo(() => {
    const lineColumns = [
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: (data) => {
          const { record } = data;
          const dom = renderStatus(
            record.get('displayStatusCode'),
            record.get('displayStatusMeaning')
          );
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'displayLineNum',
        width: 80,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'itemName',
        width: 150,
        renderer: renderChangeTip,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        renderer: (data) => {
          const dom = useQuantityRender(null, 'secondaryUomPrecision')(data);
          return renderChangeTip(data, dom);
        },
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'quantity',
        width: 150,
        renderer: (data) => {
          const dom = useQuantityRender()(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'uomCodeAndName',
        width: 150,
        renderer: renderChangeTip,
      },
      // {
      //   name: 'quantity',
      //   width: 150,
      //   renderer: (data) => {
      //     const dom = useQuantityRender()(data);
      //     return renderChangeTip(data, dom);
      //   },
      // },
      // {
      //   name: 'uomCodeAndName',
      //   width: 150,
      //   renderer: renderChangeTip,
      // },
      {
        name: 'needByDate',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'unitPrice',
        width: 150,
        align: 'right',
        renderer: (data) => {
          const dom = priceChangeTip(data, basicCurrent);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: (data) => {
          const dom = useAmountRender(basicCurrent, { bySourceCode })(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        // renderer: priceChangeTip,
        renderer: (data) => {
          const dom = priceChangeTip(data, basicCurrent);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        // renderer: useAmountRender(),
        renderer: (data) => {
          const dom = useAmountRender(basicCurrent, { bySourceCode })(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'taxRate',
        width: 80,
        renderer: renderChangeTip,
      },
      {
        name: 'unitPriceBatch',
        width: 80,
        renderer: renderChangeTip,
      },
      {
        name: 'currencyCode',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'promiseDeliveryDate',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'categoryName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'invOrganizationName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'inventoryName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'locationName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'consignedFlag',
        width: 150,
        // renderer: ({ value }) => yesOrNoRender(value),
        renderer: (data) => {
          const { value } = data;
          const dom = yesOrNoRender(value);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'returnedFlag',
        width: 150,
        // renderer: ({ value }) => yesOrNoRender(value),
        renderer: (data) => {
          const { value } = data;
          const dom = yesOrNoRender(value);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'freeFlag',
        width: 150,
        // renderer: ({ value }) => yesOrNoRender(value),
        renderer: (data) => {
          const { value } = data;
          const dom = yesOrNoRender(value);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'exemptInspectionFlag',
        width: 150,
        renderer: (data) => {
          const { value } = data;
          const dom = yesOrNoRender(value);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'bom',
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
        ),
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
      },
      {
        name: 'sourceNumAndLine',
        width: 150,
        renderer: ({ record }) => record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      },
      {
        name: 'contractNum',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: (data) => {
          const { record } = data;
          const dom = record.get('purReqAppliedName');
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'productNum',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'productName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'catalogName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'departmentName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'costName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'projectCategory',
        width: 150,
        renderer: (data) => {
          const { record } = data;
          const dom = record.get('projectCategoryMeaning');
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'remark',
        width: 150,
        tooltip: 'none',
        renderer: (data) => {
          const { text } = data;
          if (!text) return;
          const dom =
            text.length > 7 ? (
              <Tooltip
                theme="light"
                placement="topLeft"
                title={text}
                autoAdjustOverflow
                popupClassName={styles['change-tip-tooltip']}
              >
                {text}
              </Tooltip>
            ) : (
              dom
            );
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      {
        name: 'accountSubjectName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'wbs',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
        renderer: (data) => {
          const dom = useLocalPriceRender(basicCurrent)(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: (data) => {
          const dom = useLocalAmountRender(basicCurrent, { bySourceCode })(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
        renderer: (data) => {
          const dom = useLocalPriceRender(basicCurrent)(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: (data) => {
          const dom = useLocalAmountRender(basicCurrent, { bySourceCode })(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'exchangeRate',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'receiveTelNum',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'brand',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'specifications',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'model',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'skuType',
        width: 120,
        renderer: renderChangeTip,
      },
      {
        name: 'customUomName',
        width: 120,
        renderer: renderChangeTip,
      },
      {
        name: 'customQuantity',
        width: 120,
        renderer: renderChangeTip,
      },
      {
        name: 'packageQuantity',
        width: 120,
        renderer: renderChangeTip,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'customSpecs',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'productSpecs',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'productSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },

      {
        name: 'productBrand',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'productModel',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'packingList',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'priceSource',
        width: 150,
        renderer: (data) => {
          const { record } = data;
          const text = record.get('priceSourceMeaning');
          return renderChangeTip(data, text);
        },
      },
      {
        name: 'priceSourceNum',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'priceSourceLineNum',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'accountAssignTypeCode',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'budgetAccountName',
        width: 150,
        renderer: renderChangeTip,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'projectTaskId',
        width: 150,
        renderer: ({ record }) => record.get('projectTaskName'),
      },
      {
        name: 'costInformation',
        renderer: ({ record }) => {
          return (
            <Button
              funcType="link"
              onClick={() =>
                viewCostInformation({
                  record,
                  displayPoNum,
                  lineCode: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.COSTINFORMATION',
                  viewOnly: true,
                })
              }
            >
              {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
            </Button>
          );
        },
      },
      {
        name: 'originalPoLineId',
        width: 150,
        renderer: ({ record }) => record.get('displayOriginalPoAndLineNum'),
      },
      fundTermDimension === 'PO_LINE' && {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ]
      .filter((i) => i)
      .map((i) => ({ ...i, onCell: (record) => onCell(record, i.name) }));
    return remote.process('processColumns', lineColumns, { basicInfoDs, isApprovalFlag });
  }, [doubleUnitEnabled, basicCurrent, displayPoNum, fundTermDimension]);

  const openBom = (record) => {
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('sodr.workspace.view.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          readOnly
          record={record}
          customizeTable={customizeTable}
          code="SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BOM"
          sourcePage="approval"
          compatible={{ queryPara: { creatFlag: 1 } }}
        />
      ),
    });
  };

  const onCell = ({ record }, fieldCode) => {
    const map = record.get('changeMap') || {};
    const priceShieldFlag = record.get('priceShieldFlag');
    // const tipValue = map[fieldCode];
    const fieldFlag = fieldCode in map;
    const shieldFlag = priceShieldFlag === 1 && SHIED_FIELDS.includes(fieldCode);
    const cellObj =
      fieldFlag && !shieldFlag
        ? { style: { color: 'red' }, className: styles['red-tip'] }
        : { style: {} };
    return cellObj;
  };

  const handleMouseEnter = (e) => {
    return Tooltip.show(e.currentTarget, {
      placement: 'topLeft',
      mouseLeaveDelay: 0.01,
      autoAdjustOverflow: true,
      popupClassName: styles['change-line-tip'],
      title: intl.get('sodr.common.model.common.newChangeLine').d('新增-变更行'),
    });
  };

  const handleMouseLeave = () => Tooltip.hide();

  const onRow = ({ record }) => {
    const map = record.get('changeMap') || {};
    if ('insertFlag' in map) {
      return {
        style: { backgroundColor: 'rgba(242,85,53,0.10)' },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      };
    }
  };

  const buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const btns = [];
      const button = remote?.process('SODR.WORKBENCH_DETAIL_ORDERAPPROVAL_DETAILLINE_BTNS', btns, {
        basicInfoDs,
        lineDs: dataSet,
      });
      return <DynamicButtons buttons={button} />;
    });
    return [<Buttons dataSet={ds} />];
  };

  return (
    <>
      {customizeTable(
        {
          code: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.DETAILINFO', // 拦截个性化renderer展示。
          extTextRenderIntercept: (_props, dom) => {
            const { record, name } = _props;
            const { changeMap = {} } = record.get(['changeMap']);
            if (name in changeMap) {
              const tipValue = changeMap[name] || '【】';
              const tipContent = `${intl
                .get('sodr.common.model.common.beforeUpdate')
                .d('变更前')} : ${tipValue}`;
              return (
                <Tooltip
                  title={tipContent}
                  popupClassName={styles['change-tip-tooltip']}
                  theme="light"
                >
                  {<span style={{ color: 'red' }}>{dom}</span>}
                </Tooltip>
              );
            }
            return dom;
          },
        },
        <SearchBarTable
          searchCode="SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.DETAILINFO_FILTER"
          dataSet={ds}
          onRow={onRow}
          onCell={onCell}
          columns={columns}
          buttons={buttons()}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: '450px' }}
          virtual
          virtualCell
          searchBarConfig={{
            // autoQuery: false,
            checkDataSetStatus: false,
            closeFilterSelector: true,
          }}
        />
      )}
    </>
  );
};

export default DetailInfo;
