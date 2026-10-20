import React, { Fragment, useCallback, useContext } from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import matter from '@/assets/matter.svg';

import {
  renderStatus,
  tooltipRender,
  getSpecialStyleData,
  actionTagRender,
  statusTagRender,
  docImgMap,
} from '../utils/common';
import { formatAmount, getEmbedPageLink } from '../utils';
import { getAccessStore } from '../superQueryService';

import { Store } from '../../stores';

import styles from './index.less';

const TableList = (props) => {
  const { record, dataSet, modal } = props;
  const { modalRef = '', openModal = {}, setSeeMore } = useContext(Store);
  /**
   * 访问历史存储
   * @param {*} data
   */
  const accessHistoryStore = async (data) => {
    getResponse(await getAccessStore(data));
  };
  const getCustomizeContent = (data = []) => {
    if (!(data && data?.length > 0)) {
      return;
    }

    return data?.map((item, index) => {
      return item?.content ? (
        <>
          {item?.prefix ? item?.prefix : null}
          {getSpecialStyleData(item?.style ?? null, item?.content)}
          {item?.suffix ? item?.suffix : null}
        </>
      ) : null;
    });
  };
  // 一行一列
  const tradeBody0 = (record) => {
    let content = null;
    if (record?.get('tradeBody0')) {
      content = <span>{getCustomizeContent(record?.get('tradeBody0'))}</span>;
      return tooltipRender('right', content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';
    content = isTransfer ? (
      <span>
        {record?.get('unitName') && record?.get('unitCount') ? (
          <>
            {`${record?.get('unitName') ?? '-'}等`}
            <span style={{ color: '#36C2CF' }}>{record?.get('unitCount') ?? 0}</span>
            {`部门，`}
          </>
        ) : null}
        {record?.get('prRequestedName') && record?.get('prRequestedCount') ? (
          <>
            {`${record?.get('prRequestedName') ?? '-'}等`}
            <span style={{ color: '#36C2CF' }}> {record?.get('prRequestedCount') ?? '-'}</span>
            {`个申请人`}
          </>
        ) : null}
      </span>
    ) : (
      <span>
        {record?.get('supplierName')
          ? record?.get('supplierName')
          : record?.get('supplierCompanyName')}
      </span>
    );

    return (
      <>
        <span className={`${styles['super-list-sup']}`}>
          {intl.get('srm.common.view.message.supply').d('供')}:
        </span>
        {tooltipRender('right', content)}
      </>
    );
  };
  // 一行二列
  const businessField0 = (record) => {
    let content = null;
    if (record?.get('businessField0')) {
      content = <div>{getCustomizeContent(record?.get('businessField0'))}</div>;
      return tooltipRender('right', content);
    }
    content = (
      <div>{record?.get('itemName') && tooltipRender('right', record?.get('itemName'))}</div>
    );

    return tooltipRender('right', content);
  };
  // 一行三列
  const contentBody0 = (record) => {
    let content = null;
    if (record?.get('contentBody0')) {
      content = <div>{getCustomizeContent(record?.get('contentBody0'))}</div>;
      return tooltipRender('topRight', content);
    }
    content = (
      <div>{record?.get('poTypeName') && tooltipRender('topRight', record?.get('poTypeName'))}</div>
    );

    return tooltipRender('topRight', content);
  };
  // 二行一列
  const tradeBody1 = (record) => {
    let content = null;
    if (record?.get('tradeBody1')) {
      content = <span>{getCustomizeContent(record?.get('tradeBody1'))}</span>;
      return tooltipRender('right', content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = isTransfer ? (
      <span>{record?.get('companyName')}</span>
    ) : (
      <span>
        {record?.get('companyName')}
        {!isEmpty(record?.get('ouName')) && (
          <span className={styles['super-list-grey']} style={{ margin: '0 5px 0 5px' }}>
            /
          </span>
        )}
        {record?.get('ouName')}
      </span>
    );

    return (
      <>
        <span className={`${styles['super-list-sup']}`}>
          {intl.get('srm.common.view.message.purchase').d('采')}:
        </span>
        {tooltipRender('right', content)}
      </>
    );
  };

  // 二行二列
  const businessField1 = (record) => {
    let content = null;
    if (record?.get('businessField1')) {
      content = <div>{getCustomizeContent(record?.get('businessField1'))}</div>;
      return tooltipRender('right', content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = (
      <div>
        <span>
          <span className={styles['super-list-font']}>
            {(isTransfer ? record?.get('lineCount') : record?.get('lineNum')) ?? '-'}
          </span>
          <span>{intl.get('srm.common.view.message.line').d('行')}</span>
          <span style={{ margin: '0 5px 0 5px' }}>/</span>
          <span>{intl.get('srm.common.view.message.joint').d('共')}</span>
          <span className={styles['super-list-font']}>
            {(isTransfer ? record?.get('lineQuantityCount') : record?.get('lineQuantity')) ?? '-'}
          </span>
          <span>{intl.get('srm.common.view.message.piece').d('件')}</span>
        </span>
        <span
          className={`${styles['super-list-left']} ${styles['super-list-color']} ${styles['super-list-font']}`}
        >
          ￥{formatAmount(record.get('taxIncludeAmount'))}
        </span>
      </div>
    );
    return tooltipRender('right', content);
  };
  // 二行三列
  const contentBody1 = (record) => {
    let content = null;
    if (record?.get('contentBody1')) {
      content = <div>{getCustomizeContent(record?.get('contentBody1'))}</div>;
      return tooltipRender('topRight', content);
    }
    content = (
      <div>{record?.get('remark') && tooltipRender('topRight', record?.get('remark'))}</div>
    );

    return tooltipRender('topRight', content);
  };
  const docTitleCell = (record) => {
    let content = null;

    if (record?.get('titleField') && record?.get('titleField')?.length > 0) {
      const title = record?.get('titleField')?.map((item, index) => {
        return item?.content ? (
          <>
            {item?.prefix ? item?.prefix : null}
            {getSpecialStyleData(item?.style ?? null, item?.content)}
            {item?.suffix ? item?.suffix : null}
          </>
        ) : null;
      });
      const status =
        record?.get('statusField') && record?.get('statusField')?.length > 0
          ? record?.get('statusField')?.[0]
            ? statusTagRender(
                record?.get('statusField')?.[0]?.style,
                record?.get('statusField')?.[0]?.content
              )
            : null
          : null;
      content = (
        <>
          <span className={`${styles['super-list-num']} ${styles['super-list-right']}`}>
            {title}
            {status}
          </span>
          <span className={styles['super-list-status']}>
            {actionTagRender(record?.get('actionList'))}
          </span>
        </>
      );
    } else {
      content = (
        <>
          <span className={`${styles['super-list-title']} ${styles['super-list-right']}`}>
            {record?.get('docTypeName') ??
              intl.get('swbh.common.view.message.purchaseOrder').d('采购订单')}
            {record?.get('todoTitle') ? ` - ${record?.get('todoTitle')} :` : ''}
          </span>
          <span className={`${styles['super-list-grey']} ${styles['super-list-right']}`}>
            {record?.get('displayPoNum')}
          </span>
          <span className={styles['super-list-status']}>
            {renderStatus(record?.get('statusCode'), record?.get('statusCodeMeaning'))}
            {actionTagRender(record?.get('actionList'))}
          </span>
        </>
      );
    }
    return (
      <div>
        <Icon
          type={docImgMap?.get(record?.get('cardCode') ?? 'SODR')?.iconType}
          className={styles.icon}
        />
        {record?.get('cardCode') === 'SMDM' && (
          <img src={matter} alt="matter" className={styles['wu-liao']} />
        )}
        {content}
      </div>
    );
  };

  /**
   * @record 解构出来mobx类型
   * 存储时对@params @search解构在赋值
   */
  const handleDetailPage = useCallback(() => {
    const { combineCode, documentId, detailRouteLink, detailParameters } =
      record?.get(['combineCode', 'documentId', 'detailRouteLink', 'detailParameters']) ?? {};
    const { params = {}, search = {} } = detailParameters || {};
    const parameters = {
      params: { ...params },
      search: { ...search },
    };
    const data = {
      combineCode,
      documentId,
      link: detailRouteLink,
      detailParameters: parameters,
    };
    accessHistoryStore(data);
    getEmbedPageLink(
      'workBench',
      detailRouteLink,
      { ...params },
      { ...search },
      setSeeMore,
      dataSet,
      openModal,
      modalRef,
      modal
    );
  }, [setSeeMore, dataSet, openModal, modalRef, modal]);
  return (
    <Fragment>
      <div className={styles['super-list-container']} onClick={handleDetailPage}>
        <div className={styles['super-list-container-time']}>
          {docTitleCell(record)}
          <div className={styles['super-list-grey']}>{record?.get('lastUpdateDate')}</div>
        </div>
        <div className={`${styles['super-list-container-record']} ${styles['super-list-grey']}`}>
          <Row
            type="flex"
            justify="space-between"
            className={styles['super-list-container-record-row']}
          >
            <Col span={4} order={1}>
              {tradeBody0(record)}
            </Col>
            <Col span={4} order={2}>
              {businessField0(record)}
            </Col>
            <Col span={4} order={3}>
              {contentBody0(record)}
            </Col>
          </Row>
          <Row
            type="flex"
            justify="space-between"
            className={styles['super-list-container-record-row']}
          >
            <Col span={4} order={1}>
              {tradeBody1(record)}
            </Col>
            <Col span={4} order={2}>
              {businessField1(record)}
            </Col>
            <Col span={4} order={3}>
              {contentBody1(record)}
            </Col>
          </Row>
        </div>
      </div>
    </Fragment>
  );
};
export default observer(TableList);
