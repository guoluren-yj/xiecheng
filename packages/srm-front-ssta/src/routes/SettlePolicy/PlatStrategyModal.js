/*
 * @Description: 结算策略列表页平台策略弹窗
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { useState, useEffect, useCallback } from 'react';
import { Picture, Button, Tooltip, Modal } from 'choerodon-ui/pro';
import { Card, Spin } from 'choerodon-ui';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import {
  getResponse,
  getRequestId,
  getAccessToken,
  filterNullValueObject,
  getCurrentOrganizationId,
} from 'utils/utils';

import Detail from './Detail';
import styles from './index.less';
import { fetchPlatStrategy, quotePlatStrategy } from '@/services/settleStrategyServices';

const accessToken = getAccessToken();
const requestId = getRequestId();
const organizationId = getCurrentOrganizationId();
const fileParams = stringify(
  filterNullValueObject({
    bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    access_token: accessToken,
    'H-Request-Id': requestId,
    directory: 'settle-strategy',
  })
);

/**
 * @description: 平台策略弹窗
 * @param {Object} props
 * @return {ReactNode}
 */
const PlatStrategyModal = ({ onToDetail }) => {
  const [dataSource, setDataSource] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleQueryData();
  }, []);

  /**
   * @description: 查询平台策略数据
   * @param {*}
   * @return {*}
   */
  const handleQueryData = async () => {
    const res = getResponse(await fetchPlatStrategy({ page: 0, size: 1000 }));
    setLoading(false);
    if (res?.content) {
      setDataSource(res.content);
    }
  };

  /**
   * 引用平台策略接口
   * @param {*}
   * @return {*}
   */
  const handleQuote = useCallback(
    async (record) => {
      const res = getResponse(await quotePlatStrategy([record]));
      if (res) {
        notification.success();
        onToDetail(res[0]?.settleConfigId, 'edit');
      }
    },
    [onToDetail]
  );

  /**
   * @description: 平台策略详情预览
   * @param {String} 结算策略主键
   * @return {*}
   */
  const handleDetailPreview = useCallback(
    async (item) => {
      const { settleConfigId } = item;
      Modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: styles['strategy-detail-modal'],
        title: intl.get(`ssta.settleStrategy.view.button.detailPerview`).d('详情预览'),
        children: <Detail sourceCode="platModal" settleConfigId={settleConfigId} />,
        okText: intl.get('ssta.settleStrategy.view.button.quote').d('引用'),
        onOk: () => handleQuote(item),
      });
    },
    [handleQuote]
  );

  /**
   * @description: 格式化图片预览接口
   * @param {String} 云地址
   * @return {String} 预览地址
   */
  const getAttachmentUrl = (url) =>
    `${HZERO_FILE}/v1/${organizationId}/files/download?${fileParams}&url=${encodeURIComponent(
      url
    )}`;

  return (
    <Spin spinning={loading}>
      {dataSource.map((item) => {
        const {
          remark,
          settleConfigNum,
          settleConfigName,
          settleConfigProcessUrl,
          settleConfigId,
        } = item;
        return (
          <Card key={settleConfigId}>
            <Picture objectFit="fill" src={getAttachmentUrl(settleConfigProcessUrl)} />
            <div className="plat-strategy-content">
              <div className="plat-strategy-header">
                <span className="plat-strategy-name">{settleConfigName}</span>
                <Button
                  size="small"
                  funcType="link"
                  color="primary"
                  onClick={() => handleDetailPreview(item)}
                >
                  {intl.get('ssta.settleStrategy.view.button.detailPerview').d('详情预览')}
                </Button>
                <Button
                  size="small"
                  funcType="link"
                  color="primary"
                  onClick={() => handleQuote(item)}
                >
                  {intl.get('ssta.settleStrategy.view.button.quote').d('引用')}
                </Button>
              </div>
              <span>{settleConfigNum}</span>
              <Tooltip title={remark} placement="left">
                {remark}
              </Tooltip>
            </div>
          </Card>
        );
      })}
    </Spin>
  );
};

export default PlatStrategyModal;
