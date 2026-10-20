import React, { useState, useMemo, useEffect } from 'react';
import qs from 'qs';
import { DataSet, Attachment } from 'choerodon-ui/pro';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { setWorkFlowControl } from '@/utils/openCommonTab';
import { SubContent } from './index';
import BaseInfo from './BaseInfo';
import AgreementLine from './AgreementLine';
import Authority from './Authority';
import { workBenchFormUnitCode } from '../../const/uniCode';
import { baseInfoDs, lineDs } from './ds';
import { tableDs as authorityDs } from '../../ProductAuthority/ds';

function WorkFlowDetail(props) {
  const {
    location: { search = '' },
    customizeTable,
    onFormLoaded,
  } = props;
  const { pathname, search: end = '' } = window.location;
  const workFlowBackPath = `${pathname.replace('/app', '')}${end}`;
  const { agreementId: agmId } = qs.parse(search.substr(1));
  const [{ uuid, sourceFrom, agreementNumber, agreementStatus }, setInfo] = useState({});

  const [headerDs, agmTableDs, authoTableDs] = useMemo(() => {
    const hDs = new DataSet(baseInfoDs());
    const lDs = new DataSet(lineDs());
    const authDs = new DataSet(authorityDs());

    hDs.setQueryParameter('agreementId', agmId);
    hDs.setQueryParameter('customizeUnitCode', workBenchFormUnitCode.view);
    lDs.setQueryParameter('agreementId', agmId);
    lDs.selection = false;

    return [hDs, lDs, authDs];
  }, [agmId]);

  useEffect(() => {
    if (agmId) {
      initData();
    }
    setWorkFlowControl(workFlowBackPath);
  }, [agmId, sourceFrom, headerDs, agmTableDs]);

  async function initData() {
    const res = await headerDs.query();
    agmTableDs.setQueryParameter(
      'customizeUnitCode',
      `SAGM.WORKBENCH.AGREEMENT_LINE, ${
        sourceFrom === 'PRICE'
          ? 'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW'
          : 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW'
      }`
    );
    await agmTableDs.query();
    // 表单渲染完后可审批操作
    if (onFormLoaded) {
      onFormLoaded(true);
    }
    if (res) {
      const headerInfo = headerDs.current.toData();
      setInfo(headerInfo);
    }
  }

  return (
    <>
      <Header title={intl.get('small.common.view.agreement.detail').d('协议明细')} />
      <Content style={{ margin: 0, padding: 0 }}>
        <SubContent
          id="sagm_workbench_base"
          title={intl.get('small.common.view.baseInfo').d('基本信息')}
        >
          <BaseInfo readOnly dataSet={headerDs} customizeCode={workBenchFormUnitCode.view} />
        </SubContent>
        {agmId && (
          <SubContent
            id="sagm_workbench_agreement_line"
            title={intl.get('small.mallProtocolManagement.view.agreementLine').d('协议行')}
            showDivide
          >
            <AgreementLine
              dataSet={agmTableDs}
              readOnly
              customizeTable={customizeTable}
              agreementStatus={agreementStatus}
              agreementId={agmId}
              sourceFrom={sourceFrom}
              workFlowBackPath={workFlowBackPath}
            />
          </SubContent>
        )}
        {agmId && (
          <SubContent
            id="sagm_workbench_authority"
            // icon="help"
            showDivide
            title={intl.get('sagm.common.view.buyPermisson').d('采买权限')}
          >
            <Authority
              readOnly
              isWorkFlow
              dataSet={authoTableDs}
              agreementHeaderId={agmId}
              agreementHeaderNum={agreementNumber}
              agreementType="PUR_AGREEMENT"
              viewSkuBackPath={workFlowBackPath}
            />
          </SubContent>
        )}
        {agmId && (
          <SubContent
            id="sagm_workbench_attachment"
            style={{ width: '50%' }}
            showDivide
            title={intl.get('hzero.common.view.title.attachment').d('附件')}
          >
            <Attachment
              value={uuid}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="small-protocol-manage"
              label={intl.get('hzero.common.view.title.attachmentList').d('内部附件')}
              labelLayout="float"
              accept={['.rar', '.zip', '.doc', '.docx', '.pdf', 'image/*']}
              help={intl
                .get('hzero.common.view.title.enableFile')
                .d('支持文件类型： .rar .zip .doc .docx .pdf image/*')}
              readOnly
            />
          </SubContent>
        )}
      </Content>
    </>
  );
}
export default formatterCollections({
  code: ['sagm.common', 'small.common', 'small.mallProtocolManagement', 'sagm.protocolManagement'],
})(
  withCustomize({
    unitCode: [
      workBenchFormUnitCode.edit,
      workBenchFormUnitCode.view,
      workBenchFormUnitCode.history,
      workBenchFormUnitCode.attachment,
      workBenchFormUnitCode.lib_line,
      workBenchFormUnitCode.manual_line,
      workBenchFormUnitCode.line_btns,
    ],
  })(WorkFlowDetail)
);
