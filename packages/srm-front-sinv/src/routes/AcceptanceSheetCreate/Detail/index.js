import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Collapse, Icon, Button, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isArray } from 'lodash';
import withCustomize from 'srm-front-cuz';

import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import classnames from 'classnames';

import DetailHeader from './../DetailHeader';
// import List from './List';
import styles from './../index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;

@withCustomize({
  unitCode: ['SINV.ACCEPTANCE_CREATE_DETAIL.HEADER'],
})
@connect(({ acceptanceSheetCreate, loading }) => ({
  acceptanceSheetCreate,
  // :acceptanceSheetCreate/saveList
  toSaveLoading: loading.effects['acceptanceSheetCreate/saveList'],
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
      headerInfo: {},
    };
    this.HeaderRef = React.createRef();
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  componentDidMount() {
    this.queryValueCode();
  }

  @Bind()
  updateState(val, userId) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        acceptorName: val,
        acceptorIdList: userId,
        acceptorNameList: val,
      },
    });
  }

  /**
   *
   * @param {object} ref - Search子组件对象
   */

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  save() {
    const { dispatch } = this.props;
    if (this.form) {
      // const dataSource = this.HeaderRef.setHeaderInfo();
      this.form.validateFields((err, values) => {
        if (!err) {
          const acceptorIds = isArray(values.acceptorId)
            ? values.acceptorId.join()
            : values.acceptorId;
          const filetDate = {
            // supplierTenantId: dataSource.supplierTenantId,
            ...values,
            acceptDate: values.acceptDate ? moment(values.acceptDate).format(DATETIME_MIN) : null,
            // acceptorName: values.acceptorName ? values.acceptorName.join() : '',
            acceptorName: acceptorIds,
          };
          const { sourceCode } = values;
          dispatch({
            type: 'acceptanceSheetCreate/saveList',
            payload: { ...filetDate },
          }).then((res) => {
            if (res) {
              dispatch(
                routerRedux.push({
                  pathname:
                    sourceCode === 'NONE'
                      ? `/sinv/acceptance-sheet-create/noDocument/detail/${res.acceptListHeaderId}`
                      : `/sinv/acceptance-sheet-create/agreement/detail/${res.acceptListHeaderId}`,
                })
              );
            }
          });
        }
      });
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/queryValueCode',
      payload: {
        orderSource: 'SPUC.ACCEPT_SOURCE_CODE',
        acceptBaseCode: 'SPUC.ACCEPT_BASE_CODE_TYPE',
      },
    });
  }

  @Bind()
  handerOnChangeFile(test, lovRecord) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        templateAttachmentUuid: lovRecord.templateAttachmentUuid,
      },
    });
  }

  render() {
    const { collapseKeys, headerInfo = {} } = this.state;
    const {
      toSaveLoading,
      customizeForm,
      acceptanceSheetCreate: {
        code: { orderSource = [], acceptBaseCode = [] },
      },
    } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sinv.acceptanceSheetCreate.title.acceptanceDetail`).d('验收单明细')}
          backPath="/sinv/acceptance-sheet-create/list"
        >
          <Button onClick={this.save} icon="save" loading={toSaveLoading} type="primary">
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={false}
            wrapperClassName={classnames(
              styles['purchase-requisition-creation-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {intl
                        .get(`sinv.acceptanceSheetCreate.title.acceptanceHeaderInfo`)
                        .d('验收单头信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="orderHeaderInfo"
              >
                <DetailHeader
                  onRef={this.handleBindRef}
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  updateState={this.updateState}
                  handleOnChangeFile={this.handerOnChangeFile}
                  editable={1}
                  headerInfo={headerInfo}
                  maintainEditable={0}
                  orderSource={orderSource}
                  acceptBaseCode={acceptBaseCode}
                  customizeForm={customizeForm}
                />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
