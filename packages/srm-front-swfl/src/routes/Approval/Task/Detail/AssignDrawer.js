import React, { PureComponent } from 'react';
import { Lov, Form, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
// import { toJS } from 'mobx';

import intl from 'utils/intl';
import { getAssignApproveDs } from '@/stores/taskDS';

import styles from './index.less';

export default class Drawer extends PureComponent {
  // constructor(props) {
  //   super(props);
  //   this.newRecord = this.props.formDs.current.get('approval');
  //   this.newApprovalData = this.props.approvalData;
  // }

  componentDidMount() {
    const {
      task: { processInstance = {} },
      assignApproveDs,
    } = this.props;
    assignApproveDs
      .getField('approval')
      .setLovPara('startUser', processInstance ? processInstance.startUserId : '');
  }

  // componentWillReceiveProps(nextProps) {
  //   const {
  //     task: { nextNodeApprover = [] },
  //   } = nextProps;
  //   if (this.newRecord !== nextProps.assignApproveDs.current.get('approval')) {
  //     // 人员单选的情况直接push进数组
  //     const value = toJS(nextProps.assignApproveDs.current.get('approval'));
  //     this.newApprovalData = {
  //       ...this.newApprovalData,
  //       [`nextNode-${nextNodeApprover[0].nextActId}`]: value,
  //     };
  //     this.newRecord = nextProps.assignApproveDs.current.get('approval');
  //   }
  // }

  @Bind()
  handleData(otherParams, dataSet) {
    if (otherParams && otherParams.check === 'Y' && !isEmpty(otherParams.candidates)) {
      otherParams.candidates.map((item) => {
        const newItem = item;
        newItem.employeeNum = newItem.employeeNum || newItem.employeeCode;
        return newItem;
      });
      dataSet.loadData(otherParams.candidates || []);
      return false;
    }
    return true;
  }

  @Bind()
  renderSelectedEmployee(type, otherParams = {}, labelValue) {
    const newAssignDs = new DataSet(getAssignApproveDs(otherParams, true));
    const { assignApproveDs } = this.props;
    const { appointApproverEmpStr, appointApproverPostStr, appointApproverRoleStr } = otherParams;
    const key = `nextNode-${otherParams.nextActId}`;
    let currentRecord;
    const existRecord = assignApproveDs.records.find((n) => n.get('key') === key);
    if (!existRecord) {
      newAssignDs.create({ key });
      currentRecord = newAssignDs.current;
    } else {
      newAssignDs.loadData([existRecord.toData()]);
      currentRecord = newAssignDs.current;
    }
    if (appointApproverEmpStr || appointApproverPostStr || appointApproverRoleStr) {
      currentRecord.setState('approvalLovFlag', 'changeLocCode');
      const paramsData = { appointApproverEmpStr, appointApproverPostStr, appointApproverRoleStr };
      currentRecord.setState('appointApproverParamsData', paramsData);
    }
    return (
      <div className={styles['select-lov']}>
        <Form record={currentRecord} labelLayout="float">
          <Lov
            ref={(ref) => {
              this[`${type}Ref`] = ref;
            }}
            labelLayout="float"
            label={labelValue}
            name="approval"
            viewMode="drawer"
            onChange={(value) => {
              const existItem = assignApproveDs.records.find((n) => n.get('key') === key);
              if (existItem) {
                existItem.set('approval', value);
              } else {
                assignApproveDs.appendData(newAssignDs.toData());
              }
            }}
            modalProps={{
              style: { width: 900, maxWidth: 900 },
            }}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Lov>
        </Form>
      </div>
    );
  }

  @Bind()
  renderNextNodeApprover() {
    const {
      task: { nextNodeApprover = [] },
    } = this.props;
    return nextNodeApprover.map((node) => {
      return (
        (node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y') && (
          <div style={{ marginBottom: '24px' }}>
            <div>
              {this.renderSelectedEmployee(
                `nextNode-${node.nextActId}`,
                node,
                intl
                  .get('hwfp.task.view.option.addNextApprover', {
                    nextActName: node.nextActName,
                  })
                  .d(`指派【${node.nextActName}】审批人`)
              )}
            </div>
          </div>
        )
      );
    });
  }

  render() {
    return <>{this.renderNextNodeApprover()}</>;
  }
}
