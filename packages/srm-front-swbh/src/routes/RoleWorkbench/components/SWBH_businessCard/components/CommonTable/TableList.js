import React, { Fragment } from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { docImgMap } from '@/routes/utils';
import { renderStatus, tooltipRender, getSpecialStyleData, actionTagRender } from '../utils/common';
import { formatAmount, getEmbedPageLink } from '../utils';
import styles from './index.less';

const List = (props) => {
  const { record, dataSet, openModal, modalRef, modal } = props;

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
      content = <span className={styles['super-list-font']}>{getCustomizeContent(record?.get('tradeBody0'))}</span>;
      return tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';
    content = isTransfer ? (
      <span className={styles['super-list-font']}>
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
      <span className={styles['super-list-font']}>
        {record?.get('supplierName') ? record?.get('supplierName') : record?.get('supplierCompanyName')}
      </span>
    );

    return (
      <>
        <span className={`${styles['super-list-grey']} ${styles['super-list-sup']}`}>
          {intl.get('srm.common.view.message.supply').d('供')}:
        </span>
        {tooltipRender(content)}
      </>
    );
  };

  // 二行一列
  const tradeBody1 = (record) => {
    let content = null;
    if (record?.get('tradeBody1')) {
      content = <span className={styles['super-list-grey']}>{getCustomizeContent(record?.get('tradeBody1'))}</span>;
      return tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = isTransfer ? (
      <span className={`${styles['super-list-grey']}`}>{record?.get('companyName')}</span>
    ) : (
      <span className={`${styles['super-list-grey']}`}>
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
        <span className={`${styles['super-list-grey']} ${styles['super-list-sup']}`}>
          {intl.get('srm.common.view.message.purchase').d('采')}:
        </span>
        {tooltipRender(content)}
      </>
    );
  };

  // 一行二列
  const businessField0 = (record) => {
    let content = null;
    if (record?.get('businessField0')) {
      content = <div className={styles['super-list-font']}>{getCustomizeContent(record?.get('businessField0'))}</div>;
      return tooltipRender(content);
    }
    content = (
      <div className={styles['super-list-font']}>
        {record?.get('itemName') && tooltipRender(record?.get('itemName'))}
      </div>
    );

    return tooltipRender(content);
  };

  // 二行二列
  const businessField1 = (record) => {
    let content = null;
    if (record?.get('businessField1')) {
      content = <div>{getCustomizeContent(record?.get('businessField1'))}</div>;
      return tooltipRender(content);
    }

    const isTransfer = record?.get('entryCode') && record?.get('entryCode') === 'TRANSFER';

    content = (
      <div>
        <span>
          <span className={styles['super-list-font']}>
            {(isTransfer ? record?.get('lineCount') : record?.get('lineNum')) ?? '-'}
          </span>
          <span className={styles['super-list-grey']}>{intl.get('srm.common.view.message.line').d('行')}</span>
          <span className={styles['super-list-grey']} style={{ margin: '0 5px 0 5px' }}>
            /
          </span>
          <span className={styles['super-list-grey']}>{intl.get('srm.common.view.message.joint').d('共')}</span>
          <span className={styles['super-list-font']}>
            {(isTransfer ? record?.get('lineQuantityCount') : record?.get('lineQuantity')) ?? '-'}
          </span>
          <span className={styles['super-list-grey']}>{intl.get('srm.common.view.message.piece').d('件')}</span>
        </span>
        <span className={`${styles['super-list-left']} ${styles['super-list-color']} ${styles['super-list-font']}`}>
          ￥{formatAmount(record.get('taxIncludeAmount'))}
        </span>
      </div>
    );
    return tooltipRender(content);
  };

  // 一行三列
  const contentBody0 = (record) => {
    let content = null;
    if (record?.get('contentBody0')) {
      content = <div className={styles['super-list-font']}>{getCustomizeContent(record?.get('contentBody0'))}</div>;
      return tooltipRender(content);
    }
    content = (
      <div className={styles['super-list-font']}>
        {record?.get('poTypeName') && tooltipRender(record?.get('poTypeName'))}
      </div>
    );

    return tooltipRender(content);
  };

  // 二行三列
  const contentBody1 = (record) => {
    let content = null;
    if (record?.get('contentBody1')) {
      content = <div>{getCustomizeContent(record?.get('contentBody1'))}</div>;
      return tooltipRender(content);
    }
    content = <div>{record?.get('remark') && tooltipRender(record?.get('remark'))}</div>;

    return tooltipRender(content);
  };
  const handleMouseEnter = (e, record, content) => {
    const tipNode = <span>{content}</span>;
    Tooltip.show(e?.currentTarget, {
      title: tipNode,
      theme: 'light',
      placement: 'right',
    });
  };

  const handleMouseLeave = () => {
    Tooltip.hide();
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
          ? record?.get('statusField')?.[0]?.content
          : null;
      content = (
        <>
          <span className={`${styles['super-list-num']} ${styles['super-list-right']}`}>
            {title}
            {status}
          </span>
          <span className={styles['super-list-status']}>{actionTagRender(record?.get('actionList'))}</span>
        </>
      );
    } else {
      content = (
        <>
          <span className={`${styles['super-list-title']} ${styles['super-list-right']}`}>
            {record?.get('docTypeName') ?? intl.get('swbh.common.view.message.purchaseOrde').d('采购订单')}
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
        <Icon type={docImgMap?.get(record?.get('cardCode') ?? 'SODR')?.iconType} className={styles.icon} />
        {/* <span onMouseEnter={e => handleMouseEnter(e, record, content)} onMouseLeave={handleMouseLeave}> */}
        {content}
        {/* </span> */}
      </div>
    );
  };
  return (
    <Fragment>
      <div
        className={styles['super-list-container']}
        onClick={() => {
          const path = record?.get('detailRouteLink');
          const detailParameters = record?.get('detailParameters') ?? {};
          const { params = {}, search = {} } = detailParameters;
          getEmbedPageLink('c7n', path, { ...params }, { ...search }, { dataSet, openModal, modalRef, modal });
        }}
      >
        <div className={styles['super-list-container-time']}>
          {docTitleCell(record)}
          <div className={styles['super-list-grey']}>{record?.get('lastUpdateDate')}</div>
        </div>
        <div className={styles['super-list-container-record']}>
          <Row type="flex" justify="space-between" className={styles['super-list-container-record-row']}>
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
          <Row type="flex" justify="space-between" className={styles['super-list-container-record-row']}>
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
export default observer(List);
