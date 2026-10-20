/**
 * AttachmentTemplate - 附件模板定义
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Table, Attachment, Cascader } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';
import { isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';

export default class AttachmentTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { oldInvestigateTemplateId, newInvestigateTemplateId, tableDs } = this.props;
    tableDs.setQueryParameter('investigateTemplateId', oldInvestigateTemplateId);
    tableDs.setState('newInvestigateTemplateId', newInvestigateTemplateId);
    tableDs.query();
  }

  /**
   * 处理新建
   */
  @Bind()
  handleAdd() {
    const { tableDs } = this.props;
    const currentRow = tableDs.current;
    const { oldInvestigateTemplateId } = this.props;
    if (currentRow) {
      currentRow.set('investigateTemplateId', oldInvestigateTemplateId);
    }
  }

  @Bind()
  getColumns() {
    const { isEdit = true } = this.props;
    const columns = [
      {
        name: 'attachmentFileType',
        editor: record =>
          isEdit && (
            <Cascader
              onChange={data => {
                if (data && isArray(data)) {
                  record.set('parentAttachmentType', data[0]);
                  record.set('attachmentType', data[1]);
                } else {
                  record.set('parentAttachmentType', null);
                  record.set('attachmentType', null);
                }
              }}
            />
          ),
      },
      {
        name: 'description',
        editor: isEdit,
      },
      {
        name: 'purchaseTemplUuid',
        editor: () => (
          <Attachment
            name="purchaseTemplUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-lifecycle"
            funcType="link"
            viewMode="popup"
            readOnly={!isEdit}
          />
        ),
      },
      {
        name: 'orderSeq',
        editor: isEdit,
      },
      {
        name: 'supplierAttFlag',
        editor: isEdit,
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
      {
        name: 'freezeControlFlag',
        editor: isEdit,
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
    ];
    return columns;
  }

  render() {
    const { isEdit = true, tableDs } = this.props;
    const buttons = isEdit
      ? [
          ['add', { afterClick: () => this.handleAdd() }],
          'delete',
          [
            'save',
            {
              onClick: () => {
                tableDs.submit().then(res => {
                  if (res && res.success) {
                    tableDs.query();
                  }
                });
              },
            },
          ],
        ]
      : [];
    return (
      <Table
        dataSet={tableDs}
        columns={this.getColumns()}
        buttons={buttons}
        selectionMode={isEdit ? 'rowbox' : 'click'}
        customizedCode="sslm-investigation-config-detail-file-tempt-definition"
      />
    );
  }
}
