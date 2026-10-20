import React, { useMemo, useEffect, useState, useRef } from 'react';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Modal, DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { connect } from 'dva';
import qs from 'qs';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getSearchBarCache } from '_components/SearchBarTable/util/cache';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryDoubleUomConfig } from '@/services/spcm/contractCommonService';
// import Multiple from './components/MultipleTextField';

import showLadderQuote from './Modal/LadderOfferModal';
import ApplicationScope from './components/ContractSubject/ApplicationOrganization';

// 引用寻源结果创建
const ReferenceDocument = (props) => {
  const { location, customizeTable = noop, sourcingResultsDs } = props;
  const { search } = location || {};
  const { sourceNum } = qs.parse(search?.substr(1));
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  // const inputRef = useRef();
  const searchBarRef = useRef();

  console.log('sourceNum', sourceNum);

  useEffect(() => {
    if (sourceNum) {
      handleBindSearchBarRef();
    }
  }, [sourceNum]);

  const handleBindSearchBarRef = (ref) => {
    searchBarRef.current = ref;
    // const { searchInputDs = new DataSet() } = ref;
    const searchInputDs = ref?.searchInputDs || new DataSet();
    if (!searchInputDs?.current) {
      console.log('ref', ref);
      // eslint-disable-next-line no-unused-expressions
      searchInputDs?.create({
        _mergeField: sourceNum,
      });
      return;
    }
    // eslint-disable-next-line no-unused-expressions
    searchInputDs?.current?.init('_mergeField', sourceNum);
  };

  useEffect(() => {
    fetchDoubleUnitFlag(); // 获取业务规则配置的双单位数据
  }, []);

  const fetchDoubleUnitFlag = async () => {
    const result = await queryDoubleUomConfig();
    if (getResponse(result)) {
      sourcingResultsDs.setState({ doubleUnitEnabled: Number(result) });
      setDoubleUnitEnabled(Number(result));
    }
  };

  // 查看适用范围
  const viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
      style: { width: '1200px' },
    });
  };

  const onQuerySourcing = ({ filter: { unitCode }, params, dataSet }, ds) => {
    // 获取 searchCode 对应的筛选器缓存
    const queryArr = ['createDateFrom', 'createDateTo'];
    const queryDsData = getSearchBarCache(unitCode)?.queryDsData || {};
    const { supplierId } = queryDsData.supplierCompanyId || {};
    const { supplierCompanyId } = params || {};
    const otherParams = supplierCompanyId ? dataSet.getState('params') : null;
    queryArr.forEach((item) => {
      if (params[item]) {
        // eslint-disable-next-line no-param-reassign
        params[item] = moment(params[item]).format(DATETIME_MIN);
      }
    });

    if (!ds?.queryDataSet) return;
    ds.queryDataSet.loadData([{ ...params, supplierId, supplierCompanyId, ...otherParams }]);
    ds.query();
  };

  // 应该是供应商特别的LOV造成的，需要做特别的处理
  const onFieldChange = ({ name, value, dataSet }) => {
    if (name === 'tempKey') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
    if (name === 'supplierCompanyId') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
  };

  //
  const columns = useMemo(() => {
    return [
      {
        label: intl.get(`sodr.workspace.model.common.sourceNumAndLines`).d('寻源单号-行号'),
        name: 'sourceNum',
        width: 150,
        renderer: ({ record }) => {
          return `${record.get('sourceNum')}-${record.get('itemNum')}`;
        },
      },
      {
        name: 'projectTaskId',
        width: 150,
        renderer: ({ record }) => record.get('projectTaskName'),
      },
      {
        label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
        name: 'itemNum',
        width: 120,
      },
      {
        label: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
        name: 'companyNum',
        width: 150,
        renderer: ({ record }) => record.get('supplierCompanyNum'),
      },
      {
        label: intl.get('entity.company.name').d('公司名称'),
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        label: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
        name: 'supplierNum',
        width: 150,
      },
      {
        label: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
        name: 'supplierName',
        width: 150,
      },
      {
        label: intl.get('spcm.common.model.common.termId').d('付款条款'),
        name: 'termsName',
        width: 150,
      },
      {
        label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
        name: 'organizationName',
        width: 160,
      },
      {
        label: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
        name: 'itemCode',
        width: 160,
      },
      {
        label: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
        name: 'itemName',
        width: 120,
      },
      {
        label: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
        name: 'categoryName',
        width: 170,
      },
      {
        label: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
        name: 'currencyCode',
        width: 120,
      },
      {
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        name: 'uomName',
        width: 120,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      doubleUnitEnabled && {
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        name: 'secondaryUomId',
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
        width: 120,
      },
      {
        label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        name: 'quantity',
        width: 120,
        align: 'right',
      },
      doubleUnitEnabled && {
        label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        name: 'secondaryQuantity',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
        name: 'occupationQuantity',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
        name: 'availableQuantity',
        width: 120,
        align: 'right',
        renderer: ({ record }) =>
          doubleUnitEnabled
            ? record.get('secondaryAvailableQuantity')
            : record.get('availableQuantity'),
      },
      {
        label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        name: 'taxRate',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.noTaxPrice2`).d('单价(不含税)'),
        name: 'unitPrice',
        width: 120,
        align: 'right',
      },
      doubleUnitEnabled && {
        name: 'secondaryUnitPrice',
        width: 150,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.noTaxAmount2`).d('金额(不含税)'),
        name: 'amountExcludingTax',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.TaxPrice2`).d('单价(含税)'),
        name: 'taxIncludedUnitPrice',
        width: 120,
        align: 'right',
      },
      doubleUnitEnabled && {
        name: 'taxIncludedSecondaryUnitPrice',
        width: 150,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.TaxAmount2`).d('金额(含税)'),
        name: 'taxAmount',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
        name: 'validPromisedDate',
        width: 120,
        renderer: ({ value }) => dateRender(value),
      },
      {
        label: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
        name: 'ladderOffer',
        width: 120,
        renderer: ({ record }) =>
          record.get('quotationLineId') ? (
            <a
              onClick={() =>
                showLadderQuote({
                  editable: false,
                  doubleUnitEnabled,
                  sourceInfo: record.toJSONData(),
                })
              }
            >
              {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
            </a>
          ) : (
            '-'
          ),
      },
      {
        label: intl.get(`entity.company.tag`).d('公司'),
        name: 'companyName',
        width: 120,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
          .d('适用其他组织'),
        name: 'sourceAppScopeLineDTOs',
        width: 120,
        renderer: ({ value }) => {
          return (
            <a onClick={() => viewApplicationOrgModal(value)} disabled={!value}>
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
                .d('适用其他组织')}
            </a>
          );
        },
      },
      {
        label: intl.get(`entity.business.tag`).d('业务实体'),
        name: 'ouName',
        width: 150,
      },
      {
        label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
        name: 'purchaseOrganizatioName',
        width: 120,
      },
      // {
      //   label: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
      //   name: 'purchaseAgentName',
      //   width: 120,
      // },
      {
        label: intl.get(`entity.roles.creator`).d('创建人'),
        name: 'realName',
        width: 120,
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
        name: 'creationDate',
        width: 150,
      },
      {
        label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
        name: 'prLineNum',
        width: 150,
        renderer: ({ record }) => {
          const prNum = record.get('prNum');
          const prLineNum = record.get('prLineNum');
          if (!prNum && !prLineNum) {
            return null;
          }
          return `${prNum || ''}-${prLineNum || ''}`;
        },
      },
      {
        label: intl.get(`spcm.common.model.common.displayPrNumLineNum`).d('采购申请展示单号-行号'),
        name: 'prDisplayLineNum',
        width: 150,
        renderer: ({ record }) => {
          const { prDisplayNum, prDisplayLineNum } =
            record?.get(['prDisplayNum', 'prDisplayLineNum']) || {};
          if (!prDisplayNum && !prDisplayLineNum) {
            return null;
          }
          return `${prDisplayNum || ''}-${prDisplayLineNum || ''}`;
        },
      },
      {
        label: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
        name: 'rfxRoleMan',
        width: 120,
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'itemRemark',
        width: 120,
      },
      {
        name: 'sourceItemRemark',
        width: 120,
      },
      {
        label: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
        name: 'contractPendingFlag',
        width: 100,
        renderer: ({ record }) => record.get('contractPendingFlagMeaning'),
      },
      {
        label: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
        name: 'resultStatus',
        width: 150,
        renderer: ({ record }) => record.get('resultStatusMeaning'),
      },
      {
        name: 'occupyStatus',
        width: 150,
      },
    ];
  }, [doubleUnitEnabled]);

  return customizeTable(
    { code: 'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS' },
    <SearchBarTable
      searchCode="SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS.FILTER"
      style={{ maxHeight: `calc(100vh - 280px)` }}
      columns={columns}
      dataSet={sourcingResultsDs}
      searchBarRef={handleBindSearchBarRef}
      searchBarConfig={{
        onQuery: (e) => onQuerySourcing(e, sourcingResultsDs),
        onFieldChange,
        editorProps: {
          pendingFlag: {
            clearButton: false,
          },
        },
        fieldProps: {
          supplierCompanyId: {
            lovPara: { tenantId: getCurrentOrganizationId() },
          },
          itemCode: {
            lovPara: { tenantId: getCurrentOrganizationId() },
          },
          sourceNum: {
            defaultValue: sourceNum,
          },
        },
        // left: {
        //   render: () => (
        //     <Multiple
        //       name="sourceNum"
        //       dataSet={sourcingResultsDs}
        //       onRef={(node) => {
        //               inputRef.current = node;
        //           }}
        //       placeholder='请输入寻源单号查询'
        //       defaultValue={sourceNum}
        //     />
        //   ),
        // },
      }}
    />
  );
};

export default compose(
  connect(({ workSpace }) => ({
    workSpace,
  })),
  formatterCollections({
    code: [
      'spcm.workspace',
      'spcm.common',
      'ssta.purchaseSettle',
      'sodr.workspace',
      'spcm.contractMaintain',
      'entity.supplier',
      'sodr.sendOrder',
      'sprm.common',
      'entity.business',
    ],
  }),
  withCustomize({
    unitCode: ['SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS'],
  }),
  observer
)(ReferenceDocument);
