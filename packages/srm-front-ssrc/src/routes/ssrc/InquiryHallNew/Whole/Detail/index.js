import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataSet, Spin, useModal } from 'choerodon-ui/pro';
import { isEmpty, noop, compose, isArray, debounce } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Card } from 'choerodon-ui';

import remoteHoc from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { Header } from 'components/Page';
import { SRM_SSRC } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import querystring from 'querystring';
// import { numberSeparatorRender } from '@/utils/renderer';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import { TopSection } from '_components/Section';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';

// import CommonStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';

import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { isText } from '@/utils/utils';
import { queryEnableDoubleUnit, querySslmLifeCycleConfig } from '@/services/commonService';
import { fetchWholeHeader, wholeReSubmit } from '@/services/inquiryHallNewService';

import Style from '../Update/index.less';

import BasicForm from './Page/BasicForm';
import Attachments from './Page/Attachments';
import QuotationLineTable from './Page/QuotationLineTable';

import { formDS } from './Stores/formDS';
import { lineDataSet } from './Stores/lineDataSet';

const WholeDetail = (props = {}) => {
  const {
    match: { path, params = {} },
    location: { search, pathname },
    customizeTable = noop,
    customizeForm = noop,
    customizeCollapseForm = noop,
    customizeBtnGroup = noop,
    custLoading = false,
    history,
    remote,
    getHocInstance,
  } = props;
  const { rfxId } = params || {};

  const uModal = useModal();

  const { openModal } = useOperationRecordModal();

  const [loading, setLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 判断是否开启双单位
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(true); // 判断360查询配置表标识

  const organizationId = getCurrentOrganizationId();
  const activeTabKey = getActiveTabKey();

  const basicFormDS = useMemo(
    () =>
      new DataSet(
        formDS({
          organizationId,
        })
      ),
    [pathname, search, organizationId]
  );

  const lineDSProps = lineDataSet({
    organizationId,
  });

  const lineDS = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SSRC_WHOLE_OFFLINE_ENTRY_DETAIL_LINE_DS_PROPS', lineDSProps, {
              basicFormDS,
              pageProps: props,
            })
          : lineDSProps
      ),
    [pathname, search, organizationId]
  );

  const { rfxNum = null, rfxStatus } = basicFormDS.current
    ? basicFormDS.current?.get(['rfxNum', 'rfxStatus'])
    : {};

  // 触发页面loading
  const toggleLoading = (loadFlag = false) => {
    setLoading(loadFlag);
  };

  useEffect(() => {
    idValidation(rfxId); // 校验主键

    initPage();
    queryDoubleUnit(organizationId);
    handleSearchSslmLifeCycleConfig();
  }, [pathname, search, organizationId]);

  // init page
  const initPage = useCallback(() => {
    fetchHeader();
  }, [pathname, search, fetchHeader]);

  // header
  const fetchHeader = useCallback(async () => {
    idValidation(rfxId);
    const routerParam = querystring.parse(search.substr(1));
    const { permissionFilterFlag = 0 } = routerParam;
    const param = {
      organizationId,
      rfxHeaderId: rfxId,
      customizeUnitCode: getCustomizeUnitCode(['baseForm', 'attachment']),
      permissionFilterFlag,
    };
    let result = null;
    toggleLoading(true);
    try {
      result = await fetchWholeHeader(param);
      result = getResponse(result);

      toggleLoading();
      if (!result) {
        return;
      }

      const { sourceFrom, purchaseRequestFlag } = result || {};
      const purchaseTurnFlag = sourceFrom === 'DEMAND_POOL' || purchaseRequestFlag === 1; // 申请转标识

      basicFormDS.loadData([result || {}]);
      lineDS.setState('header', result || {});
      lineDS.setState('purchaseTurnFlag', purchaseTurnFlag);
      lineDS.setQueryParameter('commonProps', {
        ...param,
        customizeUnitCode: getCustomizeUnitCode(['table']),
      });
      queryLine();
    } catch (e) {
      throw e;
    } finally {
      toggleLoading();
    }
  }, [pathname, search, getCustomizeUnitCode, lineDS, basicFormDS]);

  // 查询双单位是否开启
  const queryDoubleUnit = async (tenantId) => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
      tenantId,
    });
    if (isText(res)) {
      const currentDoubleFlag = !!Number(res);
      lineDS.setState('doubleUnitFlag', currentDoubleFlag);
      setDoubleUnitFlag(currentDoubleFlag);
    }
  };

  /**
   * 查询开启新360页面的租户
   */
  const handleSearchSslmLifeCycleConfig = async () => {
    const result = getResponse(await querySslmLifeCycleConfig());
    if (result) {
      setSslmLifeCycleFlag(!!result?.length);
    }
  };

  // 查看适用范围
  const viewApplicationOrgModal = useCallback(
    debounce((param = {}) => {
      const { current } = basicFormDS || {};
      if (!current) {
        return;
      }

      idValidation(rfxId);

      const { applicationScopeFlag } = current?.get(['applicationScopeFlag']);
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxId,
          sourceFrom: 'RFX',
          applicationScopeFlag,
          ...param,
        },
        sourceHeaderId: rfxId,
        organizationId,
      };

      return uModal.open({
        destroyOnClose: true,
        closable: true,
        drawer: true,
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        okText: intl.get('hzero.common.button.close').d('关闭'),
        bodyStyle: {
          padding: 0,
        },
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '70%' },
        footer: (okBtn) => okBtn,
      });
    }, 800),
    [rfxId, basicFormDS, lineDS, params]
  );

  /**
   * 获取对应的个性化编码
   * @param type null string | string[]
   * @return null | string
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['buttons', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.BUTTONS'], // 头部按钮组
        ['baseForm', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.BASE_INFO'], // 基础信息
        ['table', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE'], // 报价行表格
        ['batchMaintain', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_BATCH'], // 报价行表格批量维护
        ['tableButtons', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_HEADER_BUTTONS'], // 报价行表格-阶梯报价-表格
        ['itemTable', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_ITEM'], // 报价行历史
        ['supplierTable', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_SUPPLIER'], // 报价行-筛选器
        ['attachment', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.ATTACHMENT'], // 附件,
        ['attachmentCard', 'SSRC.INQUIRY_HALL_WHOLE_DETAIL.ATTACHMENT_CARD'], // 附件卡片
      ]);

      let currentUnitCode = null;

      if (typeof type === 'string') {
        currentUnitCode = RfxCodeMap.get(type);
      }

      if (isArray(type)) {
        const codeSet = new Set();
        type.forEach((unitCode) => {
          codeSet.add(RfxCodeMap.get(unitCode));
        });

        currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
      }

      return currentUnitCode;
    },
    [pathname, search]
  );

  // 跳转到列表页
  const directionList = useCallback(
    (param = {}) => {
      const { listSearch = null } = param || {};
      const currentActiveTabKey = getActiveTabKey();

      history.push({
        pathname: `${currentActiveTabKey}/list`,
        search: listSearch,
      });
    },
    [pathname, search]
  );

  // re submit
  const submit = useCallback(
    debounce(async () => {
      idValidation(rfxId); // 校验主键
      let result = null;
      const data = {
        rfxHeaderId: rfxId,
        queryParams: {
          customizeUnitCode: getCustomizeUnitCode([
            'baseForm',
            'table',
            'attachment',
            'itemTable',
            'supplierTable',
          ]),
        },
        organizationId,
      };
      toggleLoading(true);
      try {
        result = await wholeReSubmit(data);
        result = getResponse(result);
        toggleLoading();
        if (!result) {
          return;
        }

        notification.success();
        directionList();
      } catch (e) {
        throw e;
      }
    }, 800),
    [directionList, rfxId, organizationId, getCustomizeUnitCode]
  );

  // 打开操作记录弹框
  const handleShowOperationRecordModal = useCallback(
    debounce(() => {
      openModal({
        rfxHeaderId: rfxId,
        // rfx: this.rfx,
      });
    }, 800),
    [rfxId]
  );

  // header buttons
  const getHeaderButtons = useCallback(() => {
    let headerButtons = [
      {
        name: 'print',
        btnComp: PrintProButton,
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            icon: 'print',
          },
          hidden: ['NEW', 'RELEASE_REJECTED', 'CANCELED'].includes(rfxStatus),
          buttonText: intl.get('ssrc.inquiryHall.view.message.button.print').d('打印'),
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/print-token?rfxHeaderId=${rfxId}`,
          method: 'POST',
          outType: 'PDF',
          data: {
            rfxHeaderId: rfxId,
            templateCode: 'SSRC_RFX_OFFLINE_WHOLE',
          },
        },
      },
      rfxStatus === 'IN_QUOTATION'
        ? {
            name: 'submit',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'check',
              color: 'primary',
              wait: 800,
              waitType: 'debounce',
              loading,
              onClick: () => submit(),
              // disabled: !rfxStatus || rfxStatus !== 'IN_QUOTATION',
            },
            child: intl.get('hzero.common.button.submit').d('提交'),
          }
        : null,
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: handleShowOperationRecordModal,
        },
      },
    ];

    headerButtons = remote
      ? remote.process('SSRC_WHOLE_OFFLINE_ENTRY_DETAIL_PROCESS_HEADER_BUTTONS', headerButtons, {
          basicFormDS,
          initPage,
          lineDS,
          loading,
          toggleLoading,
          pageProps: props,
        })
      : headerButtons;
    headerButtons = (headerButtons || []).filter(Boolean);
    return headerButtons;
  }, [rfxStatus, rfxId, handleShowOperationRecordModal, loading]);

  // 报价行查询
  const queryLine = useCallback(() => {
    lineDS.query();
  }, [search, lineDS]);

  // title back path
  const getBackPath = useCallback(() => {
    const IsPublic = path && path.includes('/pub');
    if (IsPublic) {
      return;
    }

    const queryParams = querystring.parse(search.split('?')[1]);

    const parentPath = `${activeTabKey}/list`;

    if (activeTabKey === '/ssrc/new-project-setup' && queryParams?.sourceProjectId) {
      // 来源于立项明细
      return `${activeTabKey}/detail/${queryParams.sourceProjectId}`;
    }
    return parentPath;
  }, [pathname, search, activeTabKey, path]);

  // common props
  const CommonProps = {
    basicFormDS,
    organizationId,
    rfxHeaderId: rfxId,
    path,
    getCustomizeUnitCode,
    doubleUnitFlag,
    viewApplicationOrgModal,
    remote,
    history,
  };

  // 表单props
  const FormProps = {
    ...CommonProps,
    customizeCollapseForm,
    custLoading,
    customizeForm,
  };

  // 报价行props
  const quotationLineProps = {
    ...CommonProps,
    lineDS,
    customizeTable,
    custLoading,
    customizeForm,
    doubleUnitFlag,
    initPage,
    queryLine,
    history,
    sslmLifeCycleFlag,
  };

  return (
    <React.Fragment>
      <Header
        backPath={getBackPath()}
        title={
          <span>
            {intl
              .get(`ssrc.supplierQuotation.view.message.title.offlineWholeInputDetail`)
              .d('线下整单录入明细')}
            {rfxNum ? `-${rfxNum}` : ''}
          </span>
        }
      >
        {customizeBtnGroup(
          {
            code: getCustomizeUnitCode('buttons'),
            pro: true,
          },
          <DynamicButtons trigger="hover" buttons={getHeaderButtons()} />
        )}
      </Header>
      <div className={classnames(Style['supplier-content'], Style['whole-content'])}>
        <div className={classnames(Style['whole-detail-list-card'])}>
          <Card
            id="rfxBasicInfo"
            title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            bordered={false}
          >
            <Spin spinning={loading}>
              <BasicForm {...FormProps} />
            </Spin>
          </Card>
          <Card
            id="rfxResultInput"
            title={intl.get('ssrc.inquiryHall.view.title.resultInput').d('结果录入')}
            bordered={false}
          >
            <QuotationLineTable {...quotationLineProps} />
          </Card>

          <TopSection
            title={intl.get('ssrc.common.attachment').d('附件')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('attachmentCard')}
            className={Style['ssrc-common-top-section-card']}
          >
            <Attachments {...FormProps} />
          </TopSection>
        </div>
      </div>
    </React.Fragment>
  );
};

const hocComponent = (NewComponent) => {
  const unitCodes = [
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.BUTTONS', // 按钮组
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.BASE_INFO', // 基本信息
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE', // 行信息
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_HEADER_BUTTONS', // 行信息按钮组
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_ITEM', // 物料表格
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.LINE_SUPPLIER', // 供应商表格
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.ATTACHMENT', // 附件
    'SSRC.INQUIRY_HALL_WHOLE_DETAIL.ATTACHMENT_CARD', // 附件卡片
  ];

  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
        'ssrc.rf',
        'sscux.common',
        'ssrc.offlineResultEntry',
        'ssrc.resultsQuery',
      ],
    }),
    withCustomize({
      unitCode: unitCodes,
    }),
    remoteHoc({
      code: 'SSRC_WHOLE_OFFLINE_ENTRY_DETAIL',
      name: 'remote',
    })
  )(observer(NewComponent));
};

export default hocComponent(WholeDetail);
export { hocComponent, WholeDetail };
