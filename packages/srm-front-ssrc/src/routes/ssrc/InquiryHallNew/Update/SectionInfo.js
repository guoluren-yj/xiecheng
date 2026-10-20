import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { CheckBox, DataSet, Modal, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { noop } from 'lodash';

import { tableDS } from './SectionTableDS';
import SectionItemDetail from './SectionItemDetail';

const SectionInfo = (props) => {
  const {
    onRef,
    header,
    rfxId,
    match,
    applyToInquiryNewFlag,
    organizationId,
    fetchInquiryHeader,
    rfxInfoDS,
    customizeTable,
    custLoading,
    customizeForm,
    clearProperties,
    configSheet,
    rfx = {},
    doubleUnitFlag = false,
    getBatchUpdateFlag = noop,
    setBatchMainItems = noop,
    resetBatchMainItems = noop,
    handleSetHeaderData = noop,
    isNewBiddingFlag = noop,
    remote,
    isNewTemplateConfigFlag = false,
    sourceResultsData = [],
    biddingUnitPrice = false,
  } = props;
  const { projectLineSections, mergeType } = header;
  const { sourceKey } = rfx;
  const sectionInfoDS = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SECTION_TABLE_DS',
              tableDS(header.projectLineSections || [])
            )
          : tableDS(header.projectLineSections || [])
      ),
    []
  );
  const updateHeaderInfo = useCallback(
    (innerProjectLineSections) => {
      sectionInfoDS.loadData(innerProjectLineSections || projectLineSections || []);
    },
    [sectionInfoDS, projectLineSections]
  );
  // 计算头上预估金额
  const onUpdateSectionInfo = useCallback(
    (value) => {
      sectionInfoDS.current.set('sectionEstimatedAmount', value);
    },
    [sectionInfoDS]
  );

  const sectionItemDetail = useRef({});

  const bindRef = useCallback((ref) => {
    sectionItemDetail.current = ref || {};
  }, []);

  const viewItemDetail = useCallback(
    (record) => {
      record.set('viewItemDetail', true);
      const sectionItemDetailProps = {
        match,
        header,
        record: record.toData(),
        updateHeaderInfo,
        onUpdateSectionInfo,
        rfxId,
        rfxInfoDS,
        applyToInquiryNewFlag,
        organizationId,
        fetchInquiryHeader,
        customizeTable,
        customizeForm,
        custLoading,
        clearProperties,
        onRef: bindRef,
        configSheet,
        rfx,
        doubleUnitFlag,
        getBatchUpdateFlag,
        setBatchMainItems,
        resetBatchMainItems,
        remote,
        handleSetHeaderData,
        isNewTemplateConfigFlag,
        sourceResultsData,
        biddingUnitPrice,
        isNewBiddingFlag,
      };
      Modal.open({
        key: Modal.key(),
        destroyOnClose: true,
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.editItemDetail').d('编辑物料'),
        children: <SectionItemDetail {...sectionItemDetailProps} />,
        drawer: true,
        style: { width: '1090px' },
        closable: true,
        // okCancel: false,
        onOk: () => sectionItemDetail.current?.saveItemLine(),
      });
    },
    [
      header,
      rfxId,
      applyToInquiryNewFlag,
      organizationId,
      fetchInquiryHeader,
      rfxInfoDS,
      customizeTable,
      custLoading,
      customizeForm,
      doubleUnitFlag,
      clearProperties,
      updateHeaderInfo,
      onUpdateSectionInfo,
      handleSetHeaderData,
      isNewTemplateConfigFlag,
      sourceResultsData,
      biddingUnitPrice,
    ]
  );

  const columns = useMemo(() => {
    return [
      !mergeType && {
        name: 'createSourceFlag',
        width: 100,
        align: 'left',
        editor: () => {
          return <CheckBox />;
        },
      },
      {
        name: 'sectionCode',
        width: 200,
      },
      {
        name: 'sectionName',
        width: 200,
      },
      {
        name: 'viewItemDetail',
        width: 200,
        renderer: ({ record }) => (
          <a onClick={() => viewItemDetail(record)}>
            {`${intl
              .get('ssrc.inquiryHall.model.inquiryHall.viewItemDetail')
              .d('查看物料')}(${record.get('projectItemCount')})`}
          </a>
        ),
      },
      {
        name: 'sectionRemark',
        width: 200,
      },
      {
        name: 'sectionEstimatedAmount',
        width: 200,
      },
      {
        name: 'sectionAttachmentUuid',
        width: 150,
      },
    ].filter(Boolean);
  }, [mergeType, viewItemDetail, biddingUnitPrice]);

  useEffect(() => {
    onRef({
      sectionInfoDS,
      updateHeaderInfo,
    });
  }, [onRef, sectionInfoDS, updateHeaderInfo]);

  return customizeTable(
    { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION_ITEM` },
    <Table
      bordered
      dataSet={sectionInfoDS}
      columns={columns}
      custLoading={custLoading}
      pagination={false}
      style={{ maxHeight: '450px' }}
    />
  );
};
export default memo(SectionInfo);
