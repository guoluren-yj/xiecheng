import React, { Fragment, Component } from 'react';
import ChatRoom from '@/components/Chat/Room';
import { NumberField, Switch, Select, Modal, TextArea, DataSet, Form } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import styles from './index.less';

export default class Test extends Component {
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
    messageSyncFlag: 0,
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
      width: 700,
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
      width,
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
              contentStyle={{ width: `${width}px`, height: '100%' }}
              pageStyle={pageStyle}
              defaultSubType={defaultSubType}
              memberCountType={memberCountType}
              suppliersChatType={suppliersChatType}
              showClose={showClose}
              onRef={(r) => {
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
          <div className={styles['room-config']}>
            <div
              style={{ lineHeight: '24px', fontSize: '18px', fontWeight: 500, margin: '12px 0' }}
            >
              自定义配置
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px' }}>
              1、重新创建并加载组件，请点击
              <a
                onClick={() => {
                  this.setState({ key: this.state.key + 1 });
                }}
              >
                立即刷新
              </a>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px' }}>
              2、默认打开内置房间，如果想打开其他房间，请点击：
            </div>
            <a
              style={{ fontSize: '14px', fontWeight: 400, lineHeight: '18px' }}
              onClick={this.customeRoom}
            >
              创建房间
            </a>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              3、设置组件宽度(默认1000)
            </div>
            <NumberField
              placeholder="请输入宽度(300~MAX)"
              defaultValue={1000}
              min={300}
              max={10000}
              onChange={(nVal) => {
                if (!nVal || nVal < 300 || nVal > 10000) {
                  return;
                }
                this.setState({
                  width: nVal,
                });
              }}
            />
            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              4、是否显示头
            </div>
            <Switch
              defaultChecked
              onChange={(nVal) => {
                this.setState({
                  showHeader: nVal,
                });
              }}
            />

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              5、成员统计类型
            </div>
            <Select
              defaultValue="company"
              onChange={(nVal) => {
                this.setState({ memberCountType: nVal });
              }}
            >
              <Select.Option value="company">公司</Select.Option>
              <Select.Option value="tenant">租户</Select.Option>
              <Select.Option value="user">用户</Select.Option>
            </Select>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              6、供应商聊天模式
            </div>
            <Select
              defaultValue="single"
              onChange={(nVal) => {
                this.setState({ suppliersChatType: nVal });
              }}
            >
              <Select.Option value="single">单聊</Select.Option>
              <Select.Option value="multiple">群聊</Select.Option>
            </Select>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              7、默认打开子类型(需刷新)
            </div>
            <Select
              defaultValue="member"
              onChange={(nVal) => {
                this.setState({ defaultSubType: nVal });
              }}
            >
              <Select.Option value="none">无</Select.Option>
              <Select.Option value="member">成员列表</Select.Option>
              <Select.Option value="info">群设置</Select.Option>
              <Select.Option value="history">消息记录</Select.Option>
            </Select>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              8、子类型视图位置（需刷新）
            </div>
            <Select
              defaultValue="right"
              onChange={(nVal) => {
                this.setState({ pageStyle: nVal });
              }}
            >
              <Select.Option value="right">右侧</Select.Option>
              <Select.Option value="cover">覆盖在上面</Select.Option>
            </Select>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              9、外部控制组件事件
            </div>
            <div>
              <a
                onClick={() => {
                  this.ref.openGroupMember(true);
                }}
              >
                打开群组成员列表
              </a>
            </div>

            <div>
              <a
                onClick={() => {
                  this.ref.openGroupInfo(true);
                }}
              >
                打开群组设置
              </a>
            </div>

            <div>
              <a
                onClick={() => {
                  this.ref.openMessageRecords(true);
                }}
              >
                打开消息记录
              </a>
            </div>

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              10、是否显示关闭按钮（默认不显示）
            </div>
            <Switch
              defaultChecked={false}
              onChange={(nVal) => {
                this.setState({
                  showClose: nVal,
                });
              }}
            />

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              11、开启群设置（总开关，默认开启）
            </div>
            <Switch
              defaultChecked
              onChange={(nVal) => {
                this.setState({
                  groupSetting: nVal,
                });
              }}
            />

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              12、采购方开启群设置（默认开启）
            </div>
            <Switch
              defaultChecked
              onChange={(nVal) => {
                this.setState({
                  purchaseGroupSetting: nVal,
                });
              }}
            />

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              13、供应商开启群设置（默认关闭）
            </div>
            <Switch
              defaultChecked={false}
              onChange={(nVal) => {
                this.setState({
                  supplierGroupSetting: nVal,
                });
              }}
            />

            <div
              style={{ fontSize: '14px', fontWeight: 500, lineHeight: '22px', marginTop: '12px' }}
            >
              14、房间状态
            </div>
            <Switch
              defaultChecked
              onChange={(nVal) => {
                this.ref.roomStateChange(nVal ? 'NORMAL' : 'CLOSE');
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
