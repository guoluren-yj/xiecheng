import React, { Fragment, Component } from 'react';
import ChatRoom from '@/components/AIChat/Room';
import { Modal, TextArea, DataSet, Form } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import styles from './index.less';

export default class MultiPlatform extends Component {
  defaultRoomValue = {
    businessNo: 'test700', // 612
    businessCode: 'test',
    businessTitle: '默认房间',
    roomIcon: '',
    businessUrl: 'xxx',
    purchaseTenantId: 30,
    currentUser: {
      userId: 495737,
      tenantId: 30,
      companyId: 6,
    },
    purchase: {
      tenantId: 30,
      companyId: 6,
      members: [
        {
          userId: 495737,
          roleName: '开发人员',
          userName: '何某',
        },
        {
          userId: 495733,
          roleName: '开发人员',
          userName: '邱某',
        },
        {
          userId: 83185,
          roleName: '测试人员',
          userName: '邱某2',
        },
        {
          userId: 685426,
          roleName: '产品经理',
          userName: '曹xx',
        },
        {
          userId: 963215,
          roleName: '开发',
          userName: '姚盛',
        },
      ],
    },
    suppliers: [
      {
        tenantId: 16367,
        companyId: 1083951,
        companyName: 'xxx公司',
        members: [
          {
            userId: 697095,
            roleName: '销售员',
            userName: '卫xx',
          },
          {
            userId: 955971,
            roleName: '销售员',
            userName: '卫-经理',
          },
          {
            userId: 100000000332733,
            roleName: '销售员',
            userName: '卫yy',
          },
        ],
      },
    ],
  };

  constructor(props) {
    super(props);
    this.state = {
      showHeader: true,
      key: 0,
      memberCountType: 'company',
      suppliersChatType: 'single',
      defaultSubType: 'member',
      pageStyle: 'right',
      roomParams: this.defaultRoomValue,
      showClose: false,
      groupSetting: true,
      supplierGroupSetting: false,
      purchaseGroupSetting: true,
    };
  }

  ref = null;

  customeRoom = () => {
    const value = JSON.stringify(this.state.roomParams, null, 2);
    const dataSet = new DataSet({
      data: [{ value }],
      fields: [
        {
          name: 'value',
          required: true,
        },
      ],
    });
    Modal.open({
      title: '编辑房间信息',
      children: (
        <Form dataSet={dataSet}>
          <TextArea rows={20} name="value" />
        </Form>
      ),
      onOk: async () => {
        const r = await dataSet.validate();
        if (!r) return false;

        const v = dataSet.current.get('value');
        let params = null;
        try {
          params = JSON.parse(v);
        } catch (error) {
          notification.error({
            message: '参数格式不正确',
          });
          return false;
        }

        if (typeof params !== 'object' || !params.businessNo || !params.businessCode) {
          notification.error({
            message: '参数格式不正确',
          });
          return false;
        }

        if (
          params.businessNo === this.defaultRoomValue.businessNo &&
          params.businessCode === this.defaultRoomValue.businessCode &&
          params.currentUser.userId === this.defaultRoomValue.currentUser.userId
        ) {
          notification.warning({
            message: '使用了默认房间，配置未生效',
          });
          params = this.defaultRoomValue;
        }

        this.setState({ roomParams: params });
        return true;
      },
    });
  };

  render() {
    const {
      showHeader,
      key,
      memberCountType,
      suppliersChatType,
      defaultSubType,
      pageStyle,
      roomParams,
      showClose,
      groupSetting,
      purchaseGroupSetting,
      supplierGroupSetting,
    } = this.state;

    return (
      <Fragment>
        <div className={styles['test-chat-room']}>
          <div className={styles['room-display']}>
            <ChatRoom
              key={key}
              roomNameJump
              businessCode="source-bidding"
              contentClass={styles.tttt_index_kksks}
              contentStyle={{ height: '100%' }}
              pageStyle={pageStyle}
              defaultSubType={defaultSubType}
              memberCountType={memberCountType}
              suppliersChatType={suppliersChatType}
              showClose={showClose}
              onRef={r => {
                this.ref = r;
              }}
              // groupMemberEnable={false}
              roomParams={roomParams}
              showHeader={showHeader}
              groupSetting={groupSetting}
              supplierGroupSetting={supplierGroupSetting}
              purchaseGroupSetting={purchaseGroupSetting}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
