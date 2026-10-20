/*
 * @Descripttion: 寻源过程控制--采购组织及人员
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 19:18:17
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 */
import { observer } from 'mobx-react';
import React, { useContext, useMemo } from 'react';
// import CollapseForm from '_components/CollapseForm';
import { Table, TextField, Select, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
// import { Row, Col } from 'choerodon-ui';

import Store from '../store';
import styles from './index.less';
import { historyDiffRenderComp, ComponentDiffRender } from '../utils';

const Purchasing = () => {
  const {
    customizeTable,
    // customizeCollapseForm,
    commonDs: { sourcingTeamDs },
  } = useContext(Store);

  // const { buyerDs } = props;

  const columns = useMemo(
    () => [
      {
        name: 'loginNameLov',
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'loginName'),
        // renderer: ({ record }) => (
        //   <ComponentDiffRender record={record} historyDTO="rfMember" name="loginName">
        //     <Lov
        //       record={record}
        //       name="loginNameLov"
        //       style={{
        //         width: '100%',
        //       }}
        //       renderer={({ text }) => text ? <div> {text} </div> : ''}
        //     />
        //   </ComponentDiffRender>
        // ),
      },
      {
        name: 'contactName',
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'contactName'),
        // renderer: ({ record }) => (
        //   <ComponentDiffRender record={record} historyDTO="rfMember" name="contactName">
        //     <TextField
        //       record={record}
        //       name="contactName"
        //       style={{
        //         width: '100%',
        //       }}
        //       renderer={({ text }) => text ? <div> {text} </div> : ''}
        //     />
        //   </ComponentDiffRender>
        // ),
      },
      {
        name: 'contactMail',
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfMember', 'contactMail'),
        // renderer: ({ record }) => (
        //   <ComponentDiffRender record={record} historyDTO="rfMember" name="contactMail">
        //     <TextField
        //       record={record}
        //       name="contactMail"
        //       style={{
        //         width: '100%',
        //       }}
        //       renderer={({ text }) => text ? <div> {text} </div> : ''}
        //     />
        //   </ComponentDiffRender>
        // ),
      },
      {
        name: 'contactPhone',
        width: 350,
        editor: (record) => {
          const region = <Select clearButton={false} record={record} name="internationalTelCode" />;
          return (
            <TextField addonBefore={region} addonBeforeStyle={{ border: 'none', padding: 0 }} />
          );
        },
        renderer: ({ record, dataSet }) => (
          <div style={{ display: 'flex' }}>
            {historyDiffRenderComp(
              record,
              dataSet,
              'rfMember',
              'internationalTelCode',
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode'))
            )}
            <span>|</span>
            {historyDiffRenderComp(record, dataSet, 'rfMember', 'contactPhone')}
          </div>
        ),
        // renderer: ({ record }) => {
        //   return (
        //     <Form record={record}>
        //       <Row>
        //         <Col span={12}>
        //           <ComponentDiffRender
        //             record={record}
        //             historyDTO="rfMember"
        //             name="internationalTelCode"
        //           >
        //             <Select
        //               clearButton={false}
        //               name="internationalTelCode"
        //               style={{ width: '100%', marginTop: '-23px' }}
        //               renderer={({ text }) => text ? <div> {text} </div> : ''}
        //             />
        //           </ComponentDiffRender>
        //         </Col>
        //         <Col span={12}>
        //           <ComponentDiffRender record={record} historyDTO="rfMember" name="contactPhone">
        //             <TextField
        //               name="contactPhone"
        //               style={{
        //                 width: '100%',
        //                 marginTop: '-23px',
        //               }}
        //               renderer={({ text }) => text ? <div> {text} </div> : ''}
        //             />
        //           </ComponentDiffRender>
        //         </Col>
        //       </Row>
        //     </Form>
        //   );
        // },
      },
      {
        name: 'publicContactFlag',
        // editor: true,
        renderer: ({ record }) => {
          return (
            <ComponentDiffRender check record={record} historyDTO="rfMember" name="publicContactFlag">
              <CheckBox
                record={record}
                name="publicContactFlag"
              />
            </ComponentDiffRender>
          );
        },
      },
    ],
    []
  );
  const handleDeleteItem = (ds = {}) => {
    const data = ds.selected;
    const flag = (ds.selected || []).find((i) => i.status !== 'add');
    if (!flag) ds.remove(data);
    if (flag) {
      ds.delete(data, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          ds.unSelectAll();
          ds.query();
        }
      });
    }
  };

  return (
    <React.Fragment>
      {/* {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL.RF_CONTROL.ORG_STAFF`,
          dataSet: buyerDs,
        },
        <CollapseForm dataSet={buyerDs}  columns={3} labelLayout="float">
          <ComponentDiffRender
            name="purchaseLov"
            special
            change="purAgentName"
            display="purAgentId"
            record={buyerDs}
            historyDTO="rfPurchaseOriginalDTO"
          >
            <Lov name="purchaseLov" renderer={({ text }) => <div> {text} </div>} />
          </ComponentDiffRender>
        </CollapseForm>
      )} */}
      <div className={styles['score-element-header']}>
        <h3>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.rfController.view.card.source.group').d('寻源小组')}
        </h3>
      </div>
      <div className={styles['score-element-table']}>
        {customizeTable(
          {
            code: 'SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER',
          },
          <Table
            buttons={[
              'add',
              <TooltipButtonPro
                name="delete"
                icon="delete_sweep"
                disabled={isEmpty(sourcingTeamDs.selected)}
                onClick={() => handleDeleteItem(sourcingTeamDs)}
                help={intl
                  .get('ssrc.common.view.message.source-group-line.select.tip')
                  .d('请先勾选寻源小组成员')}
              >
                {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
              </TooltipButtonPro>,
              'save',
            ]}
            dataSet={sourcingTeamDs}
            columns={columns}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default observer(Purchasing);
