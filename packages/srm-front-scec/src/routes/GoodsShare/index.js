/**
 * GoodsShare -商品分享
 * @date: 2019-10-28
 * @author ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Tabs, Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { uniqWith, isEqual, isEmpty } from 'lodash';
import { connect } from 'dva';
import querystring from 'querystring';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import ShareGoods from './ShareGoods';
import SharedGoods from './SharedGoods';

const { TabPane } = Tabs;
const FormItem = Form.Item;

@connect(({ goodsShare, ecCompanyCatalog }) => ({
  goodsShare,
  ecCompanyCatalog,
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'scec.goodsShare',
    'scec.goodsManage',
    'scec.common',
    'scec.ecCompanyCatalog',
    'scec.operateRecord',
    'scec.goodsApprove',
  ],
})
@cacheComponent({ cacheKey: 'goods-share' }) // 缓存当前公司
export default class GoodsShare extends Component {
  shareGoods;

  sharedGoods;

  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.history.location.search.substr(1));
    this.state = {
      activeKey: routerParam.activeKey ? routerParam.activeKey : '1',
      shareLoading: true,
      shareStatus: 1,
    };
  }

  componentDidMount() {
    const { activeKey } = this.state;
    const {
      dispatch,
      form: { getFieldsValue },
    } = this.props;
    dispatch({
      type: 'ecCompanyCatalog/fetchEcCompany',
    }).then(res => {
      if (res) {
        this.fetchBatchSatus(getFieldsValue().companyId);
        this.groupBatchStatusOne = setInterval(() => {
          this.fetchBatchSatus(getFieldsValue().companyId, '0');
        }, 5000);
        if (activeKey === '1') {
          this.shareGoods.shareGoodsList(getFieldsValue().companyId);
        } else if (activeKey === '2') {
          this.sharedGoods.sharedGoodsList(getFieldsValue().companyId);
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.groupBatchStatus) {
      clearInterval(this.groupBatchStatus);
    }
    if (this.groupBatchStatusOne) {
      clearInterval(this.groupBatchStatusOne);
    }
  }

  @Bind()
  fetchBatchSatus(companyId, message) {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsShare/batchStatus',
      payload: { companyId },
    }).then(res => {
      this.setState({
        shareLoading: res === 1,
        shareStatus: res,
      });
      if (message === '1' && res === 0) {
        if (this.groupBatchStatus) {
          clearInterval(this.groupBatchStatus);
        }
        notification.success({
          message: intl.get('scec.goodsShare.view.success.groupShare').d('集团共享成功！'),
        });
      }
      if (message === '0' && res === 0) {
        if (this.groupBatchStatusOne) {
          clearInterval(this.groupBatchStatusOne);
        }
      }
    });
  }

  // 绑定表单分享ref
  @Bind()
  handleShareRef(ref = {}) {
    this.shareGoods = ref;
  }

  // 绑定表单被分享ref
  @Bind()
  handleSharedRef(ref = {}) {
    this.sharedGoods = ref;
  }

  /**
   * tab切换
   */
  @Bind()
  tabChange(key) {
    this.setState(
      {
        activeKey: key,
      },
      () => {
        const { activeKey } = this.state;
        if (activeKey === '1') {
          this.shareGoods.shareGoodsList();
        } else if (activeKey === '2') {
          this.sharedGoods.sharedGoodsList();
        }
      }
    );
  }

  /**
   * 选择公司值集
   */
  @Bind()
  handleOnChange(companyId) {
    if (this.shareGoods) {
      this.shareGoods.tableForm.resetFields();
      this.shareGoods.shareGoodsList({ companyId });
      this.fetchBatchSatus(companyId);
    }
    if (this.sharedGoods) {
      this.props.form.setFieldsValue(
        {
          companyId,
        },
        () => {
          this.sharedGoods.form.resetFields();
          this.sharedGoods.sharedGoodsList({ companyId });
          this.fetchBatchSatus(companyId);
        }
      );
    }
  }

  /**
   * 分享
   */
  @Bind()
  batchShare(page, formData, record = {}) {
    const {
      dispatch,
      form: { getFieldValue },
      goodsShare: { selectedKeys, selectedRows, rows, totalList },
    } = this.props;
    const { shareStatus } = this.state;
    if (shareStatus === 1) {
      Modal.warning({
        title: intl.get(`scec.goodsShare.view.share`).d('集团共享中，请稍后'),
        zIndex: 10000,
      });
    } else if (!isEmpty(record)) {
      dispatch({
        type: 'goodsShare/updateState',
        payload: { visible: true },
      });
      dispatch({
        type: 'goodsShare/handleGoodsShare',
        payload: {
          ...formData,
          companyId: getFieldValue('companyId'),
          productIds: [record.productId],
          supplierId: record.supplierId,
          page,
        },
      }).then(res => {
        const newTotalList = [...totalList];
        newTotalList.push(...res.content);
        dispatch({
          type: 'goodsShare/updateState',
          payload: {
            totalList: uniqWith(newTotalList, isEqual),
          },
        });
      });
    } else if (selectedKeys.length > 0) {
      if (!rows.every(item => item.supplierId === rows[0].supplierId)) {
        notification.warning({
          message: intl.get('scec.goodsShare.view.message.chooseSupplier').d('请选择相同的供应商'),
        });
        return false;
      }
      dispatch({
        type: 'goodsShare/updateState',
        payload: { visible: true },
      });
      dispatch({
        type: 'goodsShare/handleGoodsShare',
        payload: {
          ...formData,
          companyId: getFieldValue('companyId'),
          productIds: selectedKeys,
          supplierId: selectedRows[0] && selectedRows[0].supplierId,
          page,
        },
      }).then(res => {
        const newTotalList = [...totalList];
        newTotalList.push(...res.content);
        dispatch({
          type: 'goodsShare/updateState',
          payload: {
            totalList: uniqWith(newTotalList, isEqual),
          },
        });
      });
    } else {
      notification.warning({
        message: intl.get('scec.goodsShare.view.message.chooseData').d('至少选择一条数据'),
      });
    }
  }

  /**
   * 集团共享
   */
  @Bind()
  groupShare() {
    const {
      dispatch,
      form: { getFieldsValue },
    } = this.props;
    Modal.confirm({
      title: intl.get(`scec.goodsShare.view.confirm.shareTitle`).d('是否进行集团共享？'),
      content: intl
        .get(`scec.goodsShare.view.confirm.groupShare`)
        .d('该操作会使当前公司下的所有商品被分享给其它公司，可能需要等待较长时间'),
      onOk: () => {
        this.setState({
          shareLoading: true,
          shareStatus: 1,
        });
        dispatch({
          type: 'goodsShare/groupShare',
          payload: { companyId: getFieldsValue().companyId },
        }).then(() => {
          this.groupBatchStatus = setInterval(() => {
            this.fetchBatchSatus(getFieldsValue().companyId, '1');
          }, 5000);
        });
      },
    });
  }

  render() {
    const { activeKey, shareLoading } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      ecCompanyCatalog: { currentCompany = [] },
    } = this.props;
    const shareGoodsProps = {
      activeKey,
      companyId: getFieldValue('companyId'),
      onRef: this.handleShareRef,
      onbatchShare: this.batchShare,
    };
    const sharedGoodsProps = {
      activeKey,
      companyId: getFieldValue('companyId'),
      onRef: this.handleSharedRef,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.goodsShare.view.message.title').d('商品分享')}>
          <Button
            type="primary"
            onClick={() => {
              this.batchShare();
            }}
            style={{ display: activeKey === '2' ? 'none' : 'block' }}
          >
            {intl.get('scec.goodsShare.view.button.batch').d('批量分享')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.groupShare();
            }}
            style={{ display: activeKey === '2' ? 'none' : 'block' }}
            loading={shareLoading}
            disabled={!currentCompany.length > 0}
          >
            {intl.get('scec.goodsShare.model.button.group').d('集团共享')}
          </Button>
          <Form layout="inline">
            <FormItem
              label={intl
                .get('scec.ecCompanyCatalog.model.ecCompanyCatalog.currentCompany')
                .d('当前公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: currentCompany[0] && currentCompany[0].companyId,
              })(
                <Lov
                  allowClear={false}
                  textField="companyName"
                  textValue={currentCompany[0] && currentCompany[0].companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={this.handleOnChange}
                />
              )}
            </FormItem>
          </Form>
        </Header>
        <Content>
          <Tabs
            defaultActiveKey={activeKey}
            onChange={this.tabChange}
            animated={false}
            tabBarStyle={{ marginTop: '-16px' }}
          >
            <TabPane
              tab={intl.get('scec.goodsShare.view.message.shareGoods').d('分享的商品')}
              key="1"
            >
              <ShareGoods {...shareGoodsProps} />
            </TabPane>
            <TabPane
              tab={intl.get('scec.goodsShare.view.message.sharedGoods').d('被分享的商品')}
              key="2"
            >
              <SharedGoods {...sharedGoodsProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
