/**
 * @description 提交中止，确认完成弹窗
 */

import React, { Component } from 'react';
import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import { TextField, DatePicker, Form, TextArea, DataSet, Table } from 'choerodon-ui/pro'; // Table
import formatterCollections from 'utils/intl/formatterCollections';
import { Card } from 'choerodon-ui';

import classnames from 'classnames';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import style from './index.less';

@formatterCollections({
  code: ['sprm.semandReport', 'sprm.common', 'entity.item', 'sprm.cux3sbio'],
})
export default class SubmitForm extends Component {
  render() {
    const { dataSet, type, projectReqHeaderId } = this.props;
    this.tableDs = new DataSet({
      autoQuery: true,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'processTab',
          label: intl.get('sprm.project.model.common.changeTab').d('变更页签'),
        },
        {
          name: 'changeDetail',
          label: intl.get(`sprm.project.model.common..changeDetail`).d('变更内容'),
        },
      ],
      transport: {
        read: ({ data }) => {
          if (projectReqHeaderId && type === 'change') {
            return {
              url: `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project-req/change-content/${projectReqHeaderId}`,
              method: 'GET',
              data: { submitFlag: 1, ...data },
            };
          }
        },
      },
    });
    return (
      <div className={style['sprm-project-change-info']}>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get('sprm.purchaseRequest.title.changeBaseInfo').d('申请单基本信息')}
        >
          <Form dataSet={dataSet} useColon={false} labelLayout="float" columns={2}>
            <TextField name="reqNum" />
            <TextField name="reqType" />
            <TextField name="createdByName" />
            <DatePicker name="creationDate" />
            <TextField name="reqStatus" />
            <TextArea name="reqReason" resize="vertical" />
          </Form>
        </Card>

        {type === 'change' && (
          <Card
            bordered={false}
            className={classnames(DETAIL_CARD_CLASSNAME, 'change-last-card')}
            title={intl.get('sprm.purchaseRequest.title.changeInfo').d('变更信息')}
          >
            <Table
              style={{ maxHeight: 'calc(100vh - 520px)' }}
              dataSet={this.tableDs}
              border={false}
              columns={[
                {
                  name: 'changeDetail',
                  renderer: ({ record }) => {
                    const key = {
                      TASK: intl.get('sprm.project.model.common.taskNum').d('任务编号'),
                      PURCHASE_ITEM: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
                      SUPPLIER: intl.get(`entity.supplier.supplierCompanyNum`).d('供应商编码'),
                    };
                    const {
                      processType,
                      processTab,
                      processTypeMeaning,
                      processFieldMeaning,
                      oldValue = '',
                      newValue = '',
                      processTabUniqueDesc,
                    } = record.get([
                      'processType',
                      'processTab',
                      'processTabMeaning',
                      'processTypeMeaning',
                      'processFieldMeaning',
                      'oldValue',
                      'newValue',
                      'processTabUniqueDesc',
                      'processTypeNeaning',
                    ]);
                    if (processType === 'UPDATE' && key[processTab]) {
                      return (
                        <p>
                          {`${key[processTab]}【${processTabUniqueDesc}】${intl
                            .get('sprm.project.common.changeDetail', {
                              key: processFieldMeaning,
                              oldValue,
                              newValue,
                            })
                            .d(`【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`)}`}
                        </p>
                      );
                    } else if (key[processTab]) {
                      return (
                        <p>
                          {`${processTypeMeaning}${key[processTab]}【${processTabUniqueDesc}】`}
                        </p>
                      );
                    } else if (processType === 'UPDATE') {
                      return (
                        <p>
                          {intl
                            .get('sprm.project.common.changeDetail', {
                              key: processFieldMeaning,
                              oldValue,
                              newValue,
                            })
                            .d(`【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`)}
                        </p>
                      );
                    } else {
                      return (
                        <p>{`${processTypeMeaning}${key[processTab]}【${processTabUniqueDesc}】`}</p>
                      );
                    }
                  },
                },
              ]}
              groups={[
                {
                  name: 'processTab',
                  type: 'column',
                  columnProps: {
                    width: '150px',
                    header: ({ title }) => <span>{title}</span>,
                    renderer: ({ record }) => <span>{record.get('processTabMeaning')}</span>,
                  },
                },
              ]}
            />
          </Card>
        )}
      </div>
    );
  }
}
