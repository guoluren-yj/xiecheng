/**
 * @description 快速回复列表页
 * @author yan.xie@going-link.com
 * @date 2024-01-17
 */
import React, { useMemo, useCallback, useRef, useImperativeHandle } from 'react';
import { observer } from 'mobx-react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Tooltip, Icon } from 'choerodon-ui';
import { noop } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import DynamicButtons from '_components/DynamicButtons';

import { formatColumnCommandNew } from '@/routes/ssrc/components/ColumnBtnGroup';
import { statusTagRender, getTagColor } from '@/routes/components/StatusTag';
import styles from '@/routes/ssrc/common.less';
import { roundNumberRender } from '@/utils/renderer';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import QuotationModal from './components/QuotationModal/index';
import QuotationQuery from './components/QuotationQuery/index';
import LadderQuotationModal from './components/LadderQuotationModal';
import { QRListCodes, QRListSearchBarCodes, QRQuotationModalButtonCode } from './store/enum';

const QuickReplyTable = (props) => {
  const {
    type,
    qrDsMap,
    customizeTable,
    customizeForm,
    doubleUnitFlag = false,
    handleQuotationButton,
    customizeBtnGroup = noop,
    remote,
    getFilterCreateDataRangeDefaultValue = noop,
    qrContentRef = React.createRef,
  } = props;
  const typeUppderCase = type.toUpperCase();
  const rqCurrentTableDs = qrDsMap[typeUppderCase];

  const isAggregation = Boolean(rqCurrentTableDs.getState('isAggregation'));

  const quotationModalRef = useRef(null);

  const searchBarRef = useRef(null);
  // 报价弹框实例ref
  const quotationEditModalRef = useRef(null);

  const statusRender = useCallback(
    ({ text, record, dataSet }) =>
      text
        ? statusTagRender({
            text,
            record,
            dataSet,
            name: 'quotationStatus',
          })
        : null,
    []
  );

  // 获取搜索参数
  const getCurrentSearchParams = () => {
    const filterParams = filterNullValueObject(searchBarRef?.current?.getQueryParameter() || {});
    return {
      filterCode: QRListSearchBarCodes[typeUppderCase],
      filterParams,
    };
  };

  useImperativeHandle(qrContentRef, () => ({
    getCurrentSearchParams,
  }), [
    searchBarRef,
    rqCurrentTableDs,
  ]);

  const getQuotationModalFooter = () => {
    return [
      {
        name: 'close',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => quotationEditModalRef?.current?.close(),
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'abandonAndClose',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => quotationModalRef?.current?.handleAbandonAndClose(),
        },
        child: intl.get('ssrc.quickInquiry.quickReply.view.button.abandonAndClose').d('放弃并关闭'),
      },
      {
        name: 'abandonAndNext',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => quotationModalRef?.current?.handleAbandonAndNext(),
        },
        child: intl
          .get('ssrc.quickInquiry.quickReply.view.button.abandonAndNext')
          .d('放弃并下一个'),
      },
      {
        name: 'okAndClose',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => quotationModalRef?.current?.handleOkAndClose(),
        },
        child: intl.get('ssrc.quickInquiry.quickReply.view.button.okAndClose').d('确认并关闭'),
      },
      {
        name: 'okAndNext',
        btnType: 'c7n-pro',
        btnProps: {
          color: 'primary',
          onClick: () => quotationModalRef?.current?.handleOkAndNext(),
        },
        child: intl.get('ssrc.quickInquiry.quickReply.view.button.okAndNext').d('确认并下一个'),
      },
    ];
  };

  // edit
  const handleQuotationModal = (record) => {
    const statusTagColor = getTagColor(rqCurrentTableDs, record, 'quotationStatus');

    const searchBarParams = getCurrentSearchParams();

    quotationEditModalRef.current = Modal.open({
      drawer: true,
      key: Modal.key(),
      className: styles['ssrc-large-modal'],
      title: intl.get('ssrc.quickInquiry.quickReply.view.message.title.quotation').d('报价'),
      children: (
        <QuotationModal
          data={{ ...record.toData() }}
          tableDs={rqCurrentTableDs}
          statusTagColor={statusTagColor}
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          quotationModalRef={quotationModalRef}
          handleQuotationButton={handleQuotationButton}
          doubleUnitFlag={doubleUnitFlag}
          searchBarParams={searchBarParams}
          remote={remote}
        />
      ),
      footer: () =>
        customizeBtnGroup(
          {
            code: QRQuotationModalButtonCode,
            pro: true,
          },
          <DynamicButtons buttons={getQuotationModalFooter()} />
        ),
    });
  };

  // view
  const handleQuotationQuery = (record) => {
    const statusTagColor = getTagColor(rqCurrentTableDs, record, 'quotationStatus');

    Modal.open({
      drawer: true,
      key: Modal.key(),
      className: styles['ssrc-large-modal'],
      title: intl.get('ssrc.quickInquiry.quickReply.view.message.title.quotation').d('报价'),
      children: (
        <QuotationQuery
          data={{ ...record.toData() }}
          tableDs={rqCurrentTableDs}
          statusTagColor={statusTagColor}
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          doubleUnitFlag={doubleUnitFlag}
          remote={remote}
        />
      ),
      cancelProps: { color: 'primary' },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => [cancelBtn],
    });
  };

  const getOperationCommand = useCallback(
    ({ record }) => {
      const btnsMap = {
        QUOTE: {
          onClick: () => handleQuotationModal(record),
          wait: 1000,
        },
        QUOTED: {
          onClick: () => handleQuotationQuery(record),
          wait: 1000,
        },
      };

      return formatColumnCommandNew({
        record,
        btnsMap,
        isAggregation,
      });
    },
    [
      handleQuotationModal,
      handleQuotationQuery,
      isAggregation,
      QRListSearchBarCodes,
      typeUppderCase,
      searchBarRef,
    ]
  );

  const handleChangeMode = useCallback(
    (newIsAggregation) => {
      rqCurrentTableDs.setState('isAggregation', newIsAggregation);
    },
    [rqCurrentTableDs]
  );

  // 聚合 or 平铺 渲染
  const tabBarExtraContentRender = useCallback(() => {
    return (
      <div className={styles['ssrc-search-layout']}>
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
        >
          <div
            className={!isAggregation ? 'isActive' : 'isNormal'}
            onClick={() => handleChangeMode(false)}
          >
            <Icon type="reorder" />
          </div>
        </Tooltip>
        <Tooltip
          title={intl.get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView').d('聚合表视图')}
        >
          <div
            className={isAggregation ? 'isActive' : 'isNormal'}
            onClick={() => handleChangeMode(true)}
          >
            <Icon type="view_day" />
          </div>
        </Tooltip>
      </div>
    );
  }, [handleChangeMode, isAggregation]);

  /**
   *查看阶梯报价
   *type="view" source="header" 为了个性化和头-查看报价保持一致
   */
  const handleLadderModal = useCallback(
    (record) => {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.ladderQuotation')
          .d('阶梯报价'),
        className: styles['ssrc-large-modal'],
        children: (
          <LadderQuotationModal
            type="view"
            source="header"
            headRecord={record}
            headData={record.toData() || {}}
            rfqQuotationId={record.get('rfqQuotationId')}
            doubleUnitFlag={doubleUnitFlag}
            customizeTable={customizeTable}
            customizeForm={customizeForm}
          />
        ),
        footer: (_, cancelBtn) => [cancelBtn],
        cancelProps: { color: 'primary' },
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [doubleUnitFlag, customizeTable, customizeForm]
  );

  const renderLadder = useCallback(
    ({ record }) => {
      return record.get('ladderInquiryFlag') ? (
        <Button funcType="link" onClick={() => handleLadderModal(record)}>
          {intl.get('hzero.common.button.view').d('查看')}
        </Button>
      ) : null;
    },
    [handleLadderModal]
  );

  const columns = useMemo(() => {
    const flatColumns = [
      { name: 'itemCode', width: 120 },
      { name: 'itemName', width: 120 },
      { name: 'secondaryUomName', width: 120 },
      { name: 'uomName', width: 120 },
      { name: 'targetPrice', width: 120 },
      { name: 'secondaryTargetPrice', width: 120 },
      { name: 'companyName', width: 200 },
      { name: 'ouName', width: 120 },
      { name: 'invOrganizationName', width: 120 },
      { name: 'purOrganizationName', width: 120 },
      { name: 'supplierCompanyNum', width: 120 },
      { name: 'supplierCompanyName', width: 200 },
      { name: 'contactName', width: 120 },
      { name: 'contactAreaCodeMeaning', width: 120 },
      { name: 'contactMobilephone', width: 120 },
      { name: 'contactMail', width: 120 },
      { name: 'targetPriceTypeMeaning', width: 120 },
      { name: 'taxRate', width: 120 },
      { name: 'currencyCode', width: 120 },
      {
        name: 'ladderInquiryFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'ladderInquiryLink',
        width: 120,
        renderer: renderLadder,
      },
      { name: 'validDateFrom', width: 120 },
      { name: 'validDateTo', width: 120 },
      { name: 'itemCategoryName', width: 120 },
      { name: 'brand', width: 120 },
      { name: 'specs', width: 120 },
      { name: 'minLimitPrice', width: 120 },
      { name: 'maxLimitPrice', width: 120 },
      { name: 'remark', width: 120 },
      { name: 'attachmentUuid', width: 120 },
    ];
    const arregationColumns = [
      {
        name: 'itemInfo1',
        title: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemInfo1').d('物料信息1'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          {
            name: 'itemCode',
          },
          {
            name: 'itemName',
          },
          {
            name: 'secondaryUomName',
          },
          {
            name: 'uomName',
          },
          {
            name: 'targetPrice',
          },
          { name: 'secondaryTargetPrice' },
        ],
      },
      {
        name: 'organizationInfo',
        title: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.organizationInfo')
          .d('客户组织信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          {
            name: 'companyName',
          },
          {
            name: 'ouName',
          },
          {
            name: 'invOrganizationName',
          },
          {
            name: 'purOrganizationName',
          },
        ],
      },
      {
        name: 'supplierInfo',
        title: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.companyInfo')
          .d('公司信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          { name: 'supplierCompanyNum' },
          { name: 'supplierCompanyName' },
          { name: 'contactName' },
          { name: 'contactAreaCodeMeaning' },
          { name: 'contactMobilephone' },
          { name: 'contactMail' },
        ],
      },
      {
        name: 'itemInfo2',
        title: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemInfo2').d('物料信息2'),
        width: 200,
        align: 'left',
        aggregation: true,
        children: [
          { name: 'targetPriceTypeMeaning' },
          { name: 'taxRate' },
          { name: 'currencyCode' },
          {
            name: 'ladderInquiryFlag',
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'ladderInquiryLink',
            renderer: renderLadder,
          },
          { name: 'validDateFrom' },
          { name: 'validDateTo' },
          { name: 'itemCategoryName' },
          { name: 'brand' },
          { name: 'specs' },
          { name: 'minLimitPrice' },
          { name: 'maxLimitPrice' },
        ],
      },
      {
        name: 'otherInfo',
        title: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.otherInfo').d('其他信息'),
        align: 'left',
        aggregation: true,
        children: [{ name: 'remark' }, { name: 'attachmentUuid' }],
      },
    ];
    return [
      {
        name: 'quotationStatusMeaning',
        width: 120,
        renderer: statusRender,
      },
      {
        name: 'action',
        width: 160,
        align: 'left',
        command: getOperationCommand,
      },
      {
        name: 'batchNo',
        width: 210,
      },
      {
        name: 'roundNumber',
        width: 120,
        renderer: roundNumberRender,
      },
      ...(!isAggregation ? flatColumns : arregationColumns),
    ];
  }, [getOperationCommand, statusRender, isAggregation, roundNumberRender, renderLadder]);

  const tableQuery = ({ params }) => {
    rqCurrentTableDs.setState('totalCount', null);
    rqCurrentTableDs.setQueryParameter("defaultParams", params);
    rqCurrentTableDs.query();
  };

  return customizeTable(
    {
      code: QRListCodes[typeUppderCase],
    },
    <SearchBarTable
      className={styles['ssrc-search-bar-table']}
      cacheState
      searchCode={QRListSearchBarCodes[typeUppderCase]}
      searchBarRef={(node) => {
        searchBarRef.current = node;
      }}
      aggregation={isAggregation}
      dataSet={rqCurrentTableDs}
      columns={columns}
      onQuery={tableQuery}
      style={{ maxHeight: `calc(100vh - 260px)` }}
      searchBarConfig={{
        onQuery: tableQuery,
        autoQuery: false,
        right: {
          render: tabBarExtraContentRender,
        },
        onFieldChange: () => {
          rqCurrentTableDs.setState('totalCount', 0);
        },
        onRefresh: () => {
          rqCurrentTableDs.setState('totalCount', 0);
        },
        fieldProps: {
          creationDate: {
            defaultValue: getFilterCreateDataRangeDefaultValue(),
          },
        },
        fieldDefaultValueType: 'custom',
      }}
    />
  );
};

export default remoteHoc({
  code: 'SSRC_QUOTATION_QUICK_REPLY',
})(observer(QuickReplyTable));
