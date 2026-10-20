import { compose } from 'lodash';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import { Spin } from 'choerodon-ui';
// import { Collapse, Icon } from 'choerodon-ui';
import { Collapse, Icon } from 'hzero-ui';
import React, { Fragment, useMemo, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { numberSeparatorRender } from '@/routes/components/utils';
import BasicInfo from '../components/BasicInfo';
import ComposeTable from '../components/ComposeTable';
import { basicInfoDS, listLineDS } from './stores/detailDS';
import { getLogisticsFormDS, getLogisticsTableDS } from './stores/getLogisticsInfoDS';
import LogisticsInfo from './LogisticsInfo';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const Detail = ({
  remote,
  dispatch,
  match: { params: { detailReqId, reqStatus } = {} } = {},
  customizeTable,
  customizeForm,
  custLoading,
  location,
}) => {
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const backPath = useMemo(() => `${isPub ? '/pub' : ''}/sslm/supplier-apply-query/list`, [isPub]);
  const formDs = useMemo(() => new DataSet(basicInfoDS({ detailReqId })), [detailReqId]);
  const tableDs = useMemo(() => new DataSet(listLineDS({ detailReqId })), [detailReqId]);

  // 物流信息补录
  const logisticsFormDs = useMemo(() => new DataSet(getLogisticsFormDS({ detailReqId })), [
    detailReqId,
  ]);
  const logisticsTableDs = useMemo(() => new DataSet(getLogisticsTableDS({ detailReqId })), [
    detailReqId,
  ]);
  logisticsTableDs.bind(logisticsFormDs, 'infoDtoList');

  const routerParam = queryString.parse(location.search.substr(1));
  const { isSupplier } = routerParam;
  const isSupplierFlag = useMemo(() => !!Number(isSupplier), []);

  const headerCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLIER_BASIC_INFO'
    : 'SSLM.SAMPLE_DELIVERY_RECEIVED.BASIC_INFO';
  const lineCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLIER_SAMPLE_INFO'
    : 'SSLM.SAMPLE_DELIVERY_RECEIVED.SAMPLE_INFO';

  const formCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLER_SAMPLE_FORMINFO'
    : 'SSLM.SAMPLE_DELIVERY_RECEIVED.SAMPLE_FORMINFO';

  const customizeUnitCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLER_SAMPLE_FORMINFO'
    : 'SSLM.SAMPLE_DELIVERY_RECEIVED.BASIC_INFO,SSLM.SAMPLE_DELIVERY_RECEIVED.SAMPLE_FORMINFO';

  const [spinning, setSpinning] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);

  useEffect(() => {
    setSpinning(true);
    formDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
    tableDs.setQueryParameter('customizeUnitCode', lineCode);
    formDs.query().finally(() => setSpinning(false));
    tableDs.query();
  }, []);

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  // 跳转供应商附件
  const handleJumpDetail = useCallback(record => {
    const {
      data: { reqId, sampleId },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sslm/supplier-apply-query/attach-upload/${sampleId}/${reqId}`,
        search: queryString.stringify({
          isView: true,
        }),
        state: {
          backPath: `${
            isPub ? '/pub' : ''
          }/sslm/supplier-apply-query/detail/${detailReqId}/${reqStatus}`,
          title: intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件'),
        },
      })
    );
  }, []);

  // 物流信息补录
  const handleLogistics = useCallback(() => {
    logisticsFormDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
    logisticsFormDs.query();
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      style: { width: 1000 },
      title: intl.get('sslm.sample.view.btn.logisticsCollection').d('物流信息补录'),
      children: (
        <LogisticsInfo logisticsFormDs={logisticsFormDs} logisticsTableDs={logisticsTableDs} />
      ),
      onOk: async () => {
        const response = await logisticsFormDs.submit();
        if (response && response.success) {
          setSpinning(true);
          formDs.query().finally(() => setSpinning(false));
          tableDs.query();
        } else {
          return response;
        }
      },
    });
  }, []);

  const columns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'itemDesc',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'uomName',
      width: 100,
      tooltip: 'overflow',
      renderer: ({ record = {} }) => {
        const isShowUomCodeFlag = formDs?.current?.get('isShowUomCodeFlag');
        const { data: { uomCodeAndName, uomName } = {} } = record;
        return !isShowUomCodeFlag ? uomName : uomCodeAndName;
      },
    },
    {
      name: 'itemCategoryCode',
      width: 200,
    },
    {
      name: 'itemCategoryName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'reqQuantity',
      width: 120,
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'sendTypeCode',
      width: 140,
    },
    {
      name: 'trackingNumber',
      width: 200,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
    },
    {
      name: 'sampleResultMeaning',
      width: 160,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
      renderer: ({ record }) => (
        <Upload
          viewOnly
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          attachmentUUID={record.get('trialResultsUuid')}
          filePreview
        />
      ),
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'option',
      lock: 'right',
      align: 'center',
      width: 300,
      renderer: ({ record }) => {
        return (
          <Fragment>
            <Upload
              icon=""
              viewOnly
              btnText={intl.get(`sslm.sample.model.evaluation.checkBuyer`).d('查看采购方附件')}
              tenantId={organizationId}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sslm-deliver"
              attachmentUUID={record.get('buyerAttachmentUuid')}
              filePreview
            />
            <a onClick={() => handleJumpDetail(record)} style={{ marginLeft: 16 }}>
              {intl.get(`sslm.sample.model.evaluation.checkSupplier`).d('查看供应商附件')}
            </a>
          </Fragment>
        );
      },
    },
  ];

  const supplierColumns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'itemDesc',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'uomName',
      width: 100,
      tooltip: 'overflow',
      renderer: ({ record = {} }) => {
        const { data: { uomCodeAndName } = {} } = record;
        return uomCodeAndName;
      },
    },
    {
      name: 'itemCategoryCode',
      width: 200,
    },
    {
      name: 'itemCategoryName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'reqQuantity',
      width: 120,
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'sendTypeCode',
      width: 140,
    },
    {
      name: 'trackingNumber',
      width: 200,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
    },
    {
      name: 'sampleResultMeaning',
      width: 160,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      renderer: ({ record }) => (
        <Upload
          viewOnly={reqStatus !== 'FEEDBACKED'}
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          attachmentUUID={record.get('trialResultsUuid')}
          afterOpenUploadModal={attUuid => {
            record.set('trialResultsUuid', attUuid);
          }}
          filePreview
        />
      ),
    },
  ];

  const logisticsBtnView = useMemo(
    () => ['FEEDBACKED', 'CONFIRMED', 'CONFIRM_REJECT', 'CONFIRM_APPROVING'].includes(reqStatus),
    [reqStatus]
  );

  return (
    <Spin spinning={spinning}>
      <Header
        title={intl.get('sslm.sample.view.title.sampleApplyCheck').d('送样申请单查看')}
        backPath={backPath}
      >
        {logisticsBtnView && (
          <PermissionButton
            type="c7n-pro"
            icon="border_color"
            color="primary"
            permissionList={[
              {
                code: 'srm.partner.buyer-apply-publish.supplier-apply-query.button.delivery',
                type: 'button',
                meaning: '送样申请查看（供）-物流信息补录',
              },
            ]}
            onClick={() => handleLogistics()}
            wait={500}
            waitType="throttle"
          >
            {intl.get('sslm.sample.view.btn.logisticsCollection').d('物流信息补录')}
          </PermissionButton>
        )}
      </Header>
      {remote.render('SSLM_SAMPLE_DELIVERY_RECEIVED_DETAIL_EXTRA_NODE', null, { isPub, formDs })}
      <Content>
        <div className="ued-detail-wrapper">
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapsedKeys}
            onChange={handleCollapseChange}
          >
            <Panel
              key="basicInfo"
              showArrow={false}
              header={
                <Fragment>
                  <h3>{intl.get(`sslm.sample.view.message.basicInfo`).d('送样申请基础信息')}</h3>
                  <a style={{ marginLeft: 20 }}>
                    {collapsedKeys.includes('basicInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                    {<Icon type={collapsedKeys.includes('basicInfo') ? 'up' : 'down'} />}
                  </a>
                </Fragment>
              }
            >
              <BasicInfo
                formDs={formDs}
                reqStatus={reqStatus}
                custLoading={custLoading}
                customizeForm={customizeForm}
                code={headerCode}
                isShowConfirmation={false}
              />
            </Panel>
            <Panel
              key="sampleInfo"
              showArrow={false}
              header={
                <Fragment>
                  <h3>{intl.get(`sslm.sample.view.message.sampleInfo`).d('样品信息')}</h3>
                  <a style={{ marginLeft: 20 }}>
                    {collapsedKeys.includes('sampleInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                    {<Icon type={collapsedKeys.includes('sampleInfo') ? 'up' : 'down'} />}
                  </a>
                </Fragment>
              }
            >
              <ComposeTable
                tableDs={tableDs}
                columns={isSupplierFlag ? supplierColumns : columns}
                tableFormDs={formDs}
                custLoading={custLoading}
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                code={lineCode}
                formCode={formCode}
              />
            </Panel>
          </Collapse>
        </div>
      </Content>
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample'],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_RECEIVED_DETAIL',
    name: 'remote',
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_RECEIVED.SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_RECEIVED.BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLIER_SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLIER_BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_RECEIVED.SUPPLER_SAMPLE_FORMINFO',
      'SSLM.SAMPLE_DELIVERY_RECEIVED.SAMPLE_FORMINFO',
    ],
  })
)(Detail);
