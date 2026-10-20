import React, { Fragment, useMemo, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import { flow, isFunction } from 'lodash';
import { Collapse } from 'choerodon-ui';
import { useDataSet, Spin } from 'choerodon-ui/pro';
import Viewer from 'react-viewer';
import { DataSetStatus, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import withRemote from 'utils/remote';

import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';

import { getConfig, getInvoiceConfig, getBusinessRules } from '../../../services/invoicePurPoolService';
import { formatDynamicBtns, previewPdf } from '../../../utils/utils';
import commonStyles from '../../../routes/common.less';
import InvoiceHeaderAdd from './Components/InvoiceHeaderAdd';
import InvoiceLineAdd from './Components/InvoiceLineAdd';
import { newLineDs, newDs } from '../newDS';

interface CreateProps {
  history: any;
  customizeTable: Function;
  location: { search: String };
  customizeForm: Function;
  remote: any;
}

interface SearchProps {
  action: string;
  invoiceHeaderId: string | undefined;
  status: string;
  layoutType: string;
}

const lineUnitCodes = {
  add: 'SSTA.SUPINVOICE_POOL_LIST.LINE_CREATE',
  edit: 'SSTA.SUPINVOICE_POOL_LIST.HEAD_EDIT.LINE_CREATE',
};
const headUnitCodes = {
  add: 'SSTA.SUPINVOICE_POOL_LIST.HANDLE_CREATE',
  edit: 'SSTA.SUPINVOICE_POOL_LIST.HANDLE_EDIT',
};

const tenantId = getCurrentOrganizationId();
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';

const defaultActiveKey = ['head', 'line'];
const { Panel } = Collapse;

const CreateDetail = (props: CreateProps) => {
  const {
    location: { search },
    customizeForm,
    customizeTable,
    remote,
    history,
    location,
  } = props;
  const { action, invoiceHeaderId, status, layoutType } = (queryString.parse(search.substring(1))) as unknown as SearchProps;

  const [enableTaxInvoiceLineCreateFlag, setEnableTaxInvoiceLineCreateFlag] = useState(true);
  const [viewVisible, setViewVisible] = useState(false);// ocr图片查看弹窗
  const invoiceLineAddDS = useDataSet(() => newLineDs(lineUnitCodes[action]) as any, [action]);
  // 新增头行结构
  const headerAddDS = useDataSet(() => ({
    ...newDs([headUnitCodes[action], lineUnitCodes[action]].join(), action),
    children: { invoiceLineList: invoiceLineAddDS },
  }) as any, [action, invoiceLineAddDS]);

  const { ocrFileUrl } = headerAddDS?.current?.get(['ocrFileUrl']) || {};
  const ocrFileUrlForImg = headerAddDS.getState('ocrFileUrlForImg');
  const loading = headerAddDS.status !== DataSetStatus.ready;

  const title = useMemo(() => action === 'add'
    ? intl.get('ssta.invoiceSheet.view.title.message.createInvoice').d('新建发票')
    : intl.get('ssta.invoiceSheet.view.title.message.editInvoice').d('编辑发票'), [action]);

  // 根据供应商和公司查询业务规则定义是否启用发票查验
  const computeDateProps = useCallback(async (record) => {
    const { belongCompanyId: companyId, belongSupplierCompanyId: supplierCompanyId } = record.get([
      'belongCompanyId',
      'belongSupplierCompanyId',
    ]);
    if (companyId && supplierCompanyId) {
      try {
        headerAddDS.status = DataSetStatus.loading;
        const res = getResponse(
          await getBusinessRules({
            cnfCode: 'SITE.SSTA.ENABLE_INVOICE_CHECK',
            companyId,
            supplierCompanyId,
          })
        );
        record.setState('enableCheckFlag', Boolean(res));
      } finally {
        headerAddDS.status = DataSetStatus.ready;
      }
    } else if (record.getState('enableCheckFlag')) {
      record.setState('enableCheckFlag', false);
    }
  }, [headerAddDS]);

  useEffect(() => {
    // 获取发票号码，发票代码的配置信息
    getInvoiceConfig().then((res) => {
      if (getResponse(res)) {
        headerAddDS.setState('invoiceConfigMap', res);
      }
    });
  }, [headerAddDS]);

  useEffect(() => {
    if (remote && remote.event) {
      const cleanupFunc = remote.event.fireEvent('onEffect', {
        history,
        location,
        headerDs: headerAddDS,
      });
      if (isFunction(cleanupFunc)) return cleanupFunc;
    }
  }, [remote, history, location, headerAddDS]);

  const handleUpdateNew = useCallback(({ record, name }) => {
    if (['belongCompanyIdLov', 'belongSupplierCompanyIdLov'].includes(name)) {
      computeDateProps(record);
    }
    if (['invoiceType'].includes(name)) {
      // 发票类型发生变化，发票代码清空
      record.set('invoiceCode', record.getField('invoiceCode').get('defaultValue'));
    }
  }, [computeDateProps]);

  useEffect(() => {
    if (action === 'edit') {
      headerAddDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      headerAddDS.query().then((res) => {
        if (res) {
          // 编辑进来，1.校验
          computeDateProps(headerAddDS?.current);
        }
      });
      // 2.查询行接口
      invoiceLineAddDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      invoiceLineAddDS.query();
    } else {
      headerAddDS.create({});
    }
    // 查询业务规则定义，判断是否显示行
    getConfig().then((res) => {
      if (getResponse(res)) {
        const { enableTaxInvoiceLineCreateFlag: newEnableTaxInvoiceLineCreateFlag } = res || {};
        setEnableTaxInvoiceLineCreateFlag(newEnableTaxInvoiceLineCreateFlag);
      }
    });
  }, [
    headerAddDS,
    computeDateProps,
    invoiceLineAddDS,
    action,
    invoiceHeaderId,
    setEnableTaxInvoiceLineCreateFlag,
  ]);

  useEffect(() => {
    headerAddDS.addEventListener('update', handleUpdateNew);
    return () => {
      headerAddDS.removeEventListener('update', handleUpdateNew);
    };
  }, [handleUpdateNew, headerAddDS]);

  const handleSave = useCallback(async () => {
    // 校验头行信息
    const validateFlag = await headerAddDS.validate();
    if (!validateFlag) return;
    headerAddDS.dataToJSON = DataToJSON.all;
    const res = await headerAddDS.submit();
    headerAddDS.dataToJSON = DataToJSON.dirty;
    if (res) {
      // 返回列表页
      history.push({
        pathname: `/ssta/supply-invoice-pool/list`,
        search: queryString.stringify({ status, layoutType }),
      });
    }
  }, [headerAddDS, history, status, layoutType]);

  // 关闭Modal
  const hideModal = useCallback(() => {
    setViewVisible(false);
  }, [setViewVisible]);

  // 显示Madal
  const showModal = useCallback(() => {
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);

    headerAddDS.setState('ocrFileUrlForImg', getAttachmentUrl(
      ocrFileUrl,
      bucketName,
      tenantId,
      bucketDirectory,
      ''
    ));
    setViewVisible(true);
  }, [ocrFileUrl, headerAddDS, setViewVisible]);

  const panelList = useMemo(() => {
    const normalList = [
      {
        key: 'head',
        header: intl.get('ssta.invoiceSheet.view.title.invoiceHeaderInfo').d('发票头信息'),
        content: (
          <InvoiceHeaderAdd
            headerAddDS={headerAddDS}
            customizeForm={customizeForm}
            customizeCode={headUnitCodes[action]}
            showModal={showModal}
            remote={remote}
            invoiceLineAddDS={invoiceLineAddDS}
          />
        ),
      },
      (Number(enableTaxInvoiceLineCreateFlag) === 1 && {
        key: 'line',
        header: intl.get('ssta.invoiceSheet.view.title.invoiceHeaderLineInfo').d('发票行信息'),
        content: (
          <InvoiceLineAdd
            invoiceLineAddDS={invoiceLineAddDS}
            customizeTable={customizeTable}
            customizeCode={lineUnitCodes[action]}
            headerAddDS={headerAddDS}
          />
        ),
      }) as any,
    ];
    const processList = remote
      ? remote.process('SSTA_SUPINVOICE_POOL_DETAIL_ACTION.PANEL_LIST', normalList, {
        headerDs: headerAddDS,
        location,
      })
      : normalList;
    return processList.filter(Boolean);
  }, [
    remote,
    action,
    location,
    showModal,
    headerAddDS,
    customizeForm,
    customizeTable,
    invoiceLineAddDS,
    enableTaxInvoiceLineCreateFlag,
  ]);

  const headerBtns = useMemo(() => {
    const normalBtns = [
      {
        name: 'publish',
        child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          icon: 'publish2',
          onClick: handleSave,
          loading,
          wait: 800,
        },
      },
    ];
    const processBtns = remote
      ? remote.process('SSTA_SUPINVOICE_POOL_DETAIL_ACTION.HEAD_BTNS', normalBtns, {
        headerDs: headerAddDS,
        history,
        location,
      })
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, history, location, loading, headerAddDS, handleSave]);

  if (!headerAddDS?.current) return <Spin spinning />;

  return (
    <Fragment>
      <Header title={title} backPath={`/ssta/supply-invoice-pool/list?status=${status}&layoutType=${layoutType}`}>
        <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns} />
      </Header>
      <Content
        className={commonStyles[`collapse-content`]}
        wrapperClassName={commonStyles[`collapse-content-wrap`]}
      >
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          {panelList.map((item) => {
            const { content, ...panelProps } = item;
            return (
              <Panel forceRender showArrow={false} {...panelProps}>
                {content}
              </Panel>
            );
          })}
        </Collapse>
        {ocrFileUrlForImg && (
          <Viewer
            noImgDetails
            noNavbar
            scalable={false}
            changeable={false}
            visible={viewVisible}
            onClose={hideModal}
            downloadable
            images={[
              {
                src: ocrFileUrlForImg,
                alt: '',
                downloadUrl: ocrFileUrlForImg,
              },
            ]}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default flow(
  observer,
  withRemote({
    code: 'SSTA_SUPINVOICE_POOL_DETAIL_ACTION',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      ...Object.values(lineUnitCodes),
      ...Object.values(headUnitCodes),
    ],
  }),
  formatterCollections({
    code: ['ssta.invoiceSheet',
      'hzero.common',
      'ssta.costSheet',
      'ssta.purchaseInvoicePool',
      'ssta.common',
    ],
  }))(CreateDetail);

