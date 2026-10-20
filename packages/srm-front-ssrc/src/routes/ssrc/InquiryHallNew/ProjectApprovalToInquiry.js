/**
 * ApplyToInquiry - 引用申请立项
 * @date: 2021-1-14
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import intl from 'utils/intl';
import { isEmpty, noop } from 'lodash';
import classNames from 'classnames';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Table, DataSet, Icon, Modal, Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { getActiveTabKey } from 'utils/menuTab';

import formatterCollections from 'utils/intl/formatterCollections';
import { getSourceCategoryName } from '@/utils/globalVariable';
import { sourcingCreate } from '@/services/inquiryHallService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import { getJumpRoutePrefixUrl } from '@/utils/utils';

import { fetchProjectDS, fetchBidSectionDS } from './ProjectApprovalToInquiryDS';
import CreateModal from './CreateModal';
import style from './index.less';

@WithCustomizeC7N({
  unitCode: ['SSRC.INQUIRY_HALL_PROJECT_TO_RFX.LIST', 'SSRC.BID_HALL_PROJECT_TO_BID.LIST'],
})
@formatterCollections({
  code: ['ssrc.common', 'ssrc.inquiryHall', 'hzero.common'],
})
export default class QuoteApproval extends Component {
  queryParams = this.props?.match?.params || {};

  constructor(props) {
    super(props);
    if (props?.onRef) {
      props.onRef(this);
    }
    this.bidFlag = this.queryParams?.sourceKey === 'BID' || props.bidFlag;
    this.tableDS = new DataSet(
      props?.remote
        ? props?.remote.process(
            'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PROJECT_TO_INQUIRY_DS',
            fetchProjectDS(this.bidFlag, {
              sourceRequest:
                this.queryParams.routeFrom === 'pub' ? 'ONLINE_SOURCING' : props?.sourceRequest, // 如果来自于采购员工作台，则过滤掉线下整单的数据
            })
          )
        : fetchProjectDS(this.bidFlag, {
            sourceRequest:
              this.queryParams.routeFrom === 'pub' ? 'ONLINE_SOURCING' : props?.sourceRequest, // 如果来自于采购员工作台，则过滤掉线下整单的数据
          })
    );
    this.state = {
      bidSectionDS: {},
    };
  }

  componentDidMount() {
    // this.tableDS.query();
    sessionStorage.removeItem('projectApprovalToDetailFlag');
  }

  @Bind()
  handleClick(record) {
    const { current, history, location } = this.props;
    if (!record.sourceProjectId) return;
    const search = querystring.stringify({
      sourceFrom: 'RFX',
      sourcePage: 'inquiryHallList',
      current,
    });
    const activeKey = location?.pathname
      ? getJumpRoutePrefixUrl(location.pathname)
      : getActiveTabKey();
    const pathname = `${activeKey}/project-setup/detail/${record.sourceProjectId}`;
    sessionStorage.setItem('projectApprovalToDetailFlag', true);
    Modal.destroyAll();
    history.push({
      pathname,
      search,
    });
  }

  @Bind()
  onExpand(expanded, record) {
    const { bidSectionDS } = this.state;
    const { remote } = this.props;
    if (!bidSectionDS[record.get('sourceProjectId')]) {
      bidSectionDS[record.get('sourceProjectId')] = new DataSet(
        remote
          ? remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PROJECT_TO_INQUIRY_SECTION_DS',
              fetchBidSectionDS(record)
            )
          : fetchBidSectionDS(record)
      );
      this.setState(
        {
          bidSectionDS: {
            ...this.state.bidSectionDS,
            [record.get('sourceProjectId')]: bidSectionDS[record.get('sourceProjectId')],
          },
        },
        () => {
          bidSectionDS[record.get('sourceProjectId')].loadData(
            record.get('projectLineSections') || []
          );
        }
      );
    }
  }

  @Bind()
  renderExpandedRow({ record }) {
    const columns = [
      {
        name: 'sectionCode',
        width: 120,
      },
      {
        name: 'sectionName',
        width: 150,
      },
      {
        name: 'sectionRemark',
        width: 150,
      },
      // {
      //   name: 'rfxHeaderLov',
      //   editor: true,
      //   width: 120,
      // },
    ];
    return (
      <div className={style['source-project-to-inquiry-table']}>
        <Table dataSet={this.state.bidSectionDS[record.get('sourceProjectId')]} columns={columns} />
      </div>
    );
  }

  // icon渲染
  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    if (!record.get('projectLineSections')) {
      // 子结点渲染
      return <span style={{ paddingLeft: '0.18rem' }} />;
    }

    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  }

  @Bind()
  async createModalShow() {
    const { bidSectionDS = {} } = this.state;
    const {
      sourceRequest, //  来源于创建RFQ【ONLINE_SOURCING】还是整单线下【OFFLINE_ENTER】
    } = this.props;
    const expandTableList = Object.values(bidSectionDS); // 所有子表标段的DS
    let allSeletedLength = 0; // 一共勾选的行列数
    const selectSectionLine = []; // 标段上的勾选行
    const selectProjectLine = []; // 父级无标段的勾选行
    if (expandTableList.length > 0) {
      expandTableList.forEach((expandDS) => {
        if (expandDS.selected.length > 0) {
          allSeletedLength += 1;
          expandDS.selected.forEach((select) => {
            selectSectionLine.push(select.toJSONData());
          });
        }
      });
    }
    if (this.tableDS.selected.length > 0) {
      this.tableDS.selected.forEach((select) => {
        allSeletedLength += 1;
        selectProjectLine.push(select.toJSONData());
      });
    }

    if (allSeletedLength < 1) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const allSelectLine = [...selectSectionLine, ...selectProjectLine]; // 全部勾选行
    const selectOneParentFlag = allSelectLine.every(
      (item) => item.sourceProjectId === allSelectLine[0].sourceProjectId
    );
    if (!selectOneParentFlag) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.model.inquiryHall.onlySelectOne').d('请只选择一行数据'),
      });
      return false;
    }

    let selectData = {};

    if (this.tableDS.selected.length > 0) {
      [selectData] = allSelectLine;
    } else {
      const selectParentData = this.tableDS.filter(
        (reocrd) => reocrd.get('sourceProjectId') === allSelectLine[0].sourceProjectId
      );
      selectData = {
        ...selectParentData[0].toJSONData(),
        projectLineSections: allSelectLine,
      };
    }

    const projectApprovalDataIds = this.tableDS?.toData();
    const curentSelectProject = projectApprovalDataIds.filter(
      (item) => item.sourceProjectId === allSelectLine[0].sourceProjectId
    )[0];

    if (curentSelectProject?.rfxHeaderId && sourceRequest !== 'OFFLINE_ENTER') {
      // 多标段立项转， 选择的询价单为资格预审,mergeType=SECTION
      const { preQualificationFlag = 0 } = curentSelectProject?.parentRfxHeaderLov || {};
      if (preQualificationFlag && allSelectLine?.length > 1) {
        selectData.mergeType = 'SECTION';
      }
      selectData.rfxHeaderId = curentSelectProject.rfxHeaderId;
      this.fetchCreateInquiry(selectData);
      return false;
    } else {
      // Modal.open({
      //   key: Modal.key(),
      //   closable: true,
      //   title: intl
      //     .get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`)
      //     .d('选择寻源模板'),
      //   children: <CreateModal {...CreateModalProps} />,
      //   style: { width: '350px' },
      //   onCancel: () => {},
      //   onOk: () => this.createInquiry(selectData),
      //   footer: (okBtn) => okBtn,
      // });
      if (sourceRequest === 'OFFLINE_ENTER') {
        // 来源于立项转整单线下，兼容二开直接在此拦截
        await this.projectToWholeCreate(selectData);
        return false;
      }
      this.openModal(selectData);
      return false;
    }
  }

  /**
   * 打开modal
   * @param {*} selectData - 勾选数据
   */
  openModal(selectData) {
    const CreateModalProps = {
      selectData,
      bidFlag: this.bidFlag,
      onRef: (ref) => {
        this.createModal = ref;
      },
    };
    Modal.open({
      key: Modal.key(),
      drawer: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <CreateModal {...CreateModalProps} />,
      style: { width: '350px' },
      onCancel: () => {},
      onOk: () => this.createInquiry(selectData),
    });
  }

  /**
   * 选择寻源模板,申请转询价
   * @param params
   */
  @Bind()
  async createInquiry(selectData) {
    const validate = await this.createModal?.templateDS?.validate();
    if (!validate) return false;
    this.fetchCreateInquiry(selectData);
  }

  @Bind()
  async fetchCreateInquiry(selectData) {
    const organizationId = getCurrentOrganizationId();
    const { history } = this.props;
    const TemplateData = this.createModal?.templateDS?.current
      ? this.createModal?.templateDS?.current?.toJSONData()
      : null;
    if (isEmpty(TemplateData)) {
      return;
    }

    const response = getResponse(
      await sourcingCreate({
        organizationId,
        ...selectData,
        ...TemplateData,
      })
    );
    if (response && !response.failed) {
      notification.success();
      const { rfxHeaderId } = response;
      Modal.destroyAll();
      const url = this.distinguishUpdatePageUrl({ rfxHeaderId });
      history.push({
        pathname: url,
      });
    }
  }

  // 区分 寻源维护 | 招标维护
  distinguishUpdatePageUrl = (record = {}) => {
    const { rfxHeaderId = null } = record;

    let url = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
    if (this.bidFlag) {
      url = `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`;
    }

    return url;
  };

  handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    this.tableDS.setQueryParameter('multiProjectNumOrTitle', searchValue);
  };

  leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiProjectNumOrTitle"
        placeholder={intl
          .get('ssrc.inquiryHall.model.inquiryHall.inputMultiRfxNumOrTitle')
          .d('请输入项目编码、名称查询')}
        onChange={this.handleChange}
      />
    );
  };

  clearQueryParameter = () => {
    this.tableDS.setQueryParameter('multiProjectNumOrTitle', '');
  };

  /**
   * 表格渲染
   */
  tableRender = (tableProps = {}) => {
    const { customizeTable = noop, sourceRequest } = this.props;
    const { tableStyle = {}, ...otherProps } = tableProps;
    const columns = [
      {
        name: 'sourceProjectNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleClick(record.toData())}>{value}</a>
        ),
      },
      {
        name: 'sourceProjectName',
        width: 300,
      },
      {
        name: 'companyName',
        width: 200,
      },
      sourceRequest !== 'OFFLINE_ENTER'
        ? {
            // 线下整单不显示此字段
            name: 'parentRfxHeaderLov',
            editor: true,
            width: 150,
          }
        : null,
    ].filter(Boolean);
    if (sourceRequest === 'OFFLINE_ENTER') {
      return (
        <SearchBarTable
          clearButton
          searchCode="SSRC.INQUIRY_HALL_PROJECT_TO_RFX.FILTER_BAR"
          key="SSRC.INQUIRY_HALL_PROJECT_TO_RFX.FILTER_BAR"
          dataSet={this.tableDS}
          columns={columns}
          searchBarConfig={{
            left: {
              render: (_, ds) => this.leftInput(ds),
            },
            onReset: this.clearQueryParameter,
            onClear: this.clearQueryParameter,
            closeFilterSelector: true,
            expandable: false,
          }}
          expandedRowRenderer={this.renderExpandedRow}
          expandIcon={this.expandIcon}
          onExpand={this.onExpand}
          style={{ ...tableStyle }}
          {...otherProps}
        />
      );
    }
    return customizeTable(
      {
        code: `SSRC.${this.bidFlag ? 'BID' : 'INQUIRY'}_HALL_PROJECT_TO_${
          this.bidFlag ? 'BID' : 'RFX'
        }.LIST`,
        dataSet: this.tableDS,
      },
      <SearchBarTable
        clearButton
        searchCode={`SSRC.${this.bidFlag ? 'BID' : 'INQUIRY'}_HALL_PROJECT_TO_${
          this.bidFlag ? 'BID' : 'RFX'
        }.FILTER_BAR`}
        key={`SSRC.${this.bidFlag ? 'BID' : 'INQUIRY'}_HALL_PROJECT_TO_${
          this.bidFlag ? 'BID' : 'RFX'
        }.FILTER_BAR`}
        dataSet={this.tableDS}
        columns={columns}
        searchBarConfig={{
          left: {
            render: (_, ds) => this.leftInput(ds),
          },
          onReset: this.clearQueryParameter,
          onClear: this.clearQueryParameter,
          closeFilterSelector: true,
          expandable: false,
        }}
        expandedRowRenderer={this.renderExpandedRow}
        expandIcon={this.expandIcon}
        onExpand={this.onExpand}
        style={{ ...tableStyle }}
        {...otherProps}
      />
    );
  };

  /**
   * 判断是来自路由还是父页面调用，适配角色工作台（但是父页面新建方法有二开，故采用此种方式去实现）
   */

  render() {
    const { routeFrom = '' } = this.queryParams;
    const headerProps = {
      bidFlag: this.bidFlag,
      createModalShow: this.createModalShow,
    };
    const tableStyle = { maxHeight: 'calc(100vh - 2.2rem)' }; // 角色工作台表格适配样式
    return (
      <React.Fragment>
        {routeFrom === 'pub' ? (
          <>
            <HeaderRender {...headerProps} />
            <Content>{this.tableRender({ tableStyle })}</Content>
          </>
        ) : (
          this.tableRender({ autoHeight: { type: 'maxHeight', diff: 20 } })
        )}
      </React.Fragment>
    );
  }
}

/**
 * 判断是来自路由还是父页面调用，适配角色工作台（但是父页面新建方法有二开，故采用此种方式去实现）
 */
function HeaderRender(props) {
  const { bidFlag = false, createModalShow = noop } = props;
  return (
    <React.Fragment>
      <Header
        backPath={null}
        title={intl
          .get(`ssrc.inquiryHall.view.message.button.cpmmonProjAppInquiry`, {
            sourceCategoryName: getSourceCategoryName(bidFlag),
          })
          .d(`立项转{sourceCategoryName}`)}
      >
        <Button color="primary" onClick={createModalShow}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
    </React.Fragment>
  );
}
