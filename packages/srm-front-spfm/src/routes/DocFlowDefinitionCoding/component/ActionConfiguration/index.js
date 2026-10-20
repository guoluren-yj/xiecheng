/**
 * ActionConfiguration/index.js
 * 操作记录配置页面
 * @date: 2022-03-24
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import intl from 'utils/intl';
import { Table } from 'choerodon-ui/pro';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_DATA_PROCESS } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { referenceSrmActionConfigData } from '@/services/docFlowDefinitionNodesService';
import { onLineDetailChange } from '../../utils';
import './index.less';

const { Column } = Table;
const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;
export default class OverviewOfNodes extends React.Component {
  constructor(props) {
    super(props);
    this.actionConfigurationDs = this.props.actionConfigurationDs;
  }

  addRecord = () => {
    const record = this.actionConfigurationDs?.create({editorFlag: true}, 0);
    this.actionConfigurationDs?.current
      ?.getField('operateField')
      ?.setLovPara('nodeDefCode', this.props.code);
    this.actionConfigurationDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props.code);
    this.actionConfigurationDs?.current
      ?.getField('commentField')
      ?.setLovPara('nodeDefCode', this.props.code);
    record?.setState('editing', true);
  };

  editRecord = (record) => {
    this.actionConfigurationDs?.current
      ?.getField('operateField')
      ?.setLovPara('nodeDefCode', this.props.code);
    this.actionConfigurationDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props.code);
    this.actionConfigurationDs?.current
      ?.getField('commentField')
      ?.setLovPara('nodeDefCode', this.props.code);
    record?.setState('editing', true);
  };

  cancelRecord = (record) => {
    if (record?.status === 'add') {
      this.actionConfigurationDs?.remove(record);
    } else {
      record?.reset();
      record?.setState('editing', false);
    }
  };

  referenceData = (props) => {
    const data = {
      nodeDefinitionCode: props.code,
    };
    referenceSrmActionConfigData(data).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.actionConfigurationDs.query();
      }
    });
  };

  buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'add',
          btnType: 'c7n-pro',
          child: (name) => name || intl.get('hzero.common.button.create').d('新建'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'playlist_add',
            onClick: this.addRecord,
          },
        },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => onLineDetailChange({
              dataSet,
              url: 'node-operation-details'
            }),
            disabled: isEmpty(dataSet?.selected),
          },
        },
        {
          name: 'reference',
          btnType: 'c7n-pro',
          hidden: !tenantFlag,
          child: (name) =>
            name || intl.get('spfm.overviewOfNodes.model.view.reference').d('引用平台预定义字段'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'filter_none',
            onClick: () => this.referenceData(this.props),
          },
        },
      ];
      return <DynamicButtons buttons={btns?.filter((i) => !i.hidden)} />;
    });
    return [<Buttons dataSet={this.actionConfigurationDs} />];
  };


  render() {
    const { editors } = this.props;
    return (
      <>
        <div style={{ height: 'calc(100vh - 175px)' }}>
          <Table
            customizable
            buttons={editors && this.buttons()}
            boxSizing='wrapper'
            customizedCode="new-workbench"
            dataSet={this.actionConfigurationDs}
            style={{ maxHeight: `calc(100% - 10px)` }}
            selectionMode={editors ? 'rowbox' : 'none'}
          >
              <Column name="displayField" editor={editors} />
            {editors && (
              <Column
              name="statusFlag"
              align="left"
              editor={editors}
            />
            )}
            {!editors && (
              <Column
              name="statusFlag"
              align="left"
              editor={editors}
              renderer={({value})=>yesOrNoRender(+value)}
            />
            )}
              <Column
                name="operateField"
                // width={300}
                editor={editors}
              />
              <Column
                name="commentField"
                // width={300}
                editor={editors}
              />
              {/* <Column
                name="operation"
                width={150}
                lock="right"
                renderer={({ record }) => (
                  <>
                    {record.getState('editing') ? (
                      <span className="action-link">
                        <a onClick={() => this.cancelRecord(record)}>
                          {intl.get('hzero.common.btn.cancel').d('取消')}
                        </a>
                      </span>
                    ) : (
                      <span className="action-link">
                        <a onClick={() => this.editRecord(record)}>
                          {intl.get('hzero.common.status.editor').d('编辑')}
                        </a>
                      </span>
                    )}
                  </>
                )}
              /> */}
          </Table>
        </div>
      </>
    );
  }
}
