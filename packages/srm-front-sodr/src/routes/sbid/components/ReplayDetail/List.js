/**
 * ExpertScoring/BidHall - 澄清单详情表格信息展示
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { Pagination, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';

import intl from 'utils/intl';
import UploadModal from 'components/Upload/index';

import { BUCKET_NAME } from '@/routes/components/utils/constant';
import questionIcon from '@/assets/questionIcon.svg';

class TableList extends Component {
  renderList(dataSource = []) {
    if (dataSource.length > 0) {
      return dataSource.map((item) => {
        return (
          <div style={{ width: '100%', marginTop: '16px', float: 'left' }}>
            <div>
              <div style={{ width: '32px', height: '32px', float: 'left', marginRight: '8px' }}>
                <img src={questionIcon} alt="" style={{ width: '100%', height: '100%' }} />
              </div>
              <div style={{ float: 'left', marginTop: '6px', width: '95%' }}>
                <div style={{ width: '50%', display: 'inline-flex' }}>
                  <Popover content={item.leaderDescription || item.description}>
                    <span
                      style={{
                        display: 'inline-block',
                        maxWidth: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`${item.leaderLineNum} . ${item.leaderDescription || item.description}`}
                    </span>
                  </Popover>
                  <span style={{ marginRight: '6px' }} />
                  {(item.leaderAttachmentUuid || item.attachmentUuid) && (
                    <Popover
                      content={intl
                        .get(`ssrc.expertScoring.model.expertScoring.questionAttachment`)
                        .d('问题附件')}
                    >
                      {''}
                      <UploadModal
                        btnText=""
                        viewOnly
                        bucketName={BUCKET_NAME}
                        bucketDirectory="ssrc-rfx-quotationheader"
                        attachmentUUID={item.leaderAttachmentUuid || item.attachmentUuid || null}
                      />
                    </Popover>
                  )}
                </div>
                <div style={{ display: 'inline-flex', float: 'right' }}>
                  {item.validAttachmentUuid && (
                    <UploadModal
                      icon="download"
                      viewOnly
                      bucketName={BUCKET_NAME}
                      bucketDirectory="ssrc-rfx-quotationheader"
                      attachmentUUID={item.validAttachmentUuid || null}
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              style={{
                // marginLeft: '40px',
                width: '98%',
                // overflow: 'hidden',
                // textOverflow: 'ellipsis',
                // whiteSpace: 'nowrap',
                wordWrap: 'break-word',
              }}
            >
              {/* <Popover autoAdjustOverflow={false} placement='topLeft' title={item.validAnswer}>回复结果:{item.validAnswer}</Popover> */}
              {intl.get(`ssrc.expertScoring.view.expertScoring.replayResult`).d('回复结果')}:
              {item.validAnswer}
            </div>
          </div>
        );
      });
    } else {
      return (
        <div style={{ height: '32px', lineHeight: '32px', textAlign: 'center', color: '#aaa' }}>
          {intl.get(`ssrc.expertScoring.view.expertScoring.noData`).d('没有数据')}
        </div>
      );
    }
  }

  @Bind()
  onChange(page) {
    const { pagination, queryClarifyNotifyList } = this.props;
    pagination.current = page;
    queryClarifyNotifyList(pagination);
  }

  @Bind()
  onShowSizeChange(current, size) {
    const { pagination, queryClarifyNotifyList } = this.props;
    pagination.current = current;
    pagination.pageSize = size;
    queryClarifyNotifyList(pagination);
  }

  render() {
    const { dataSource, pagination } = this.props;
    return (
      <div>
        <div>{this.renderList(dataSource)}</div>
        {dataSource.length > 0 && (
          <div style={{ float: 'right' }}>
            <Pagination
              {...pagination}
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              style={{ float: 'right' }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default TableList;
