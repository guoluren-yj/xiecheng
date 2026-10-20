import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import { Result } from 'choerodon-ui';
import { getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import { stringify } from 'querystring';
import intl from 'utils/intl';
import { isNumber } from 'lodash';
import noData from '@/assets/none.svg';
import EmbedPage from '../../../EmbedPage';
import styles from './index.less';

/**
 * 金额格式化
 * @param {Number} amount 金额
 * @param {Number} precision 精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatAmount(amount, precision, isSupplement, useGrouping = true) {
  if (isNumber(amount)) {
    const language = getCurrentLanguage().split('_').join('-');
    const options = Object.assign(
      { useGrouping },
      { maximumFractionDigits: isNumber(precision) ? precision : 20 },
      precision && isSupplement ? { minimumFractionDigits: precision } : {}
    );
    return amount.toLocaleString(language, options);
  }
  return amount;
}

/**
 * 详情页抽屉
 * @param {Record} record 行数据
 * @returns
 */
export function getEmbedPageLink(
  val,
  path = '',
  params = {},
  search = {},
  setSeeMore,
  dataSet,
  openModal,
  modalRef,
  modal
) {
  const newSearch = stringify(search);
  const _search = `?${newSearch}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  if (!path) {
    notification.warning({
      message: intl.get(`srm.common.view.message.detailPageLink`).d('请检查详情页链接配置'),
    });
    return;
  }
  if (modal) {
    const { update } = modal;
    update({
      style: { maxWidth: `calc(100vw - 200px)`, minWidth: 996 },
      resizable: true,
    });

    const modalObj = {
      mask: false,
      closable: false,
      maskClosable: true,
      footer: null,
      drawer: true,
      resizable: true,
      customizedCode: 'SWBH.ROLE_WORKBENCH.SUPER_QUERY',
      children: <EmbedPage href={path} {...flexLinkProps} />,
      style: { maxWidth: `calc(100vw - 200px)`, minWidth: 1080 },
      className: styles['detail-link-modal'],
      onClose: () => {
        modalRef.current = '';
        update({
          resizable: false,
          style: { maxWidth: 996, minWidth: 996 },
        });
        dataSet.current.reset();
      },
      afterClose: () => {
        modalRef.current = '';
        dataSet.current.reset();
      },
    };
    openModal(modalObj);
  } else {
    setSeeMore(false);
    Modal.open({
      key: Modal.key(),
      mask: true,
      closable: false,
      maskClosable: false,
      footer: null,
      drawer: true,
      resizable: true,
      customizedCode: 'SWBH.ROLE_WORKBENCH.SUPER_QUERY',
      children: <EmbedPage href={path} {...flexLinkProps} />,
      style: { maxWidth: `calc(100vw - 200px)`, minWidth: 1080 },
      className: styles['detail-link-modal'],
      afterClose: () => {
        if (dataSet) {
          setSeeMore(true);
          if (dataSet.current) {
            dataSet.current.reset();
          }
        }
      },
    });
  }
}

export function sizeChangerRenderer({ text }) {
  return intl
    .get(`srm.common.view.message.numberPage`, {
      num: text,
    })
    .d(`{num}条/页`);
}

export function dataResult() {
  return (
    <div className={styles['data-record-wrapper']}>
      <Result
        status="warning"
        icon={<embed src={noData} type="image/svg+xml" />}
        title={intl.get('srm.common.model.common.noData').d('未查询到相关数据')}
      />
    </div>
  );
}
