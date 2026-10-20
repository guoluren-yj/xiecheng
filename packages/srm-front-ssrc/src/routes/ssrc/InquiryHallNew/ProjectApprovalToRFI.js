/**
 * ProjectToRFI - 立项转RFI
 * @date: 2021-8-12
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

// test

import React, { Component } from 'react';
import { DataSet, Modal, Lov, message, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { noop } from 'lodash';
import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { projectToRF, projectToRFValidate } from '@/services/inquiryHallNewService';
import { getJumpRoutePrefixUrl } from '@/utils/utils';
import { validateModal } from '@/routes/components/ConfirmModal';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import { fetchProjectDS } from './ProjectApprovalToRFIDS';
import { rfTemplateDS } from './indexDS';
import style from './index.less';

@WithCustomizeC7N({
  unitCode: [
    'SSRC.INQUIRY_HALL_PROJECT_TO_RF.RFI_LIST',
    'SSRC.INQUIRY_HALL_PROJECT_TO_RF.RFP_LIST',
  ],
})
@formatterCollections({
  code: ['ssrc.common', 'hzero.commo', 'ssrc.inquiryHall'],
})
export default class QuoteApproval extends Component {
  constructor(props) {
    super(props);
    const { location = {}, match: { params = {} } = {} } = props;
    this.queryParams = querystring.parse(location.search?.substr(1) || {});
    this.activeTabKey = getJumpRoutePrefixUrl(location.pathname) || getActiveTabKey();
    console.log(location, 1);
    this.tableDS = new DataSet(fetchProjectDS({ type: props.type || params.type }));
    this.rfLovTemplateDS = new DataSet(rfTemplateDS({ sourceCategory: props.type || params.type }));
  }

  componentDidMount() {
    // this.tableDS.query();
    // sessionStorage.removeItem('projectApprovalToDetailFlag');
    console.log(this.props, 1);
  }

  render() {
    // params.type - 从路有的参数取 formParentComType - 从上层组件取
    const {
      type: formParentComType,
      history,
      modal,
      location = {},
      customizeTable,
      match: { params = {} } = {},
    } = this.props;
    const isPub = location.pathname?.match('/pub'); // 是否通过路有方式打开
    const renderProps = {
      history,
      customizeTable,
      type: formParentComType || params.type,
      tableDS: this.tableDS,
      rfLovTemplateDS: this.rfLovTemplateDS,
      activeTabKey: this.activeTabKey,
      sourceKey: this.queryParams.sourceKey,
    };
    const otherProps = { tableStyle: { maxHeight: 'calc(100vh - 1.5rem)' } };
    return isPub ? (
      <RoutePageRender {...renderProps} />
    ) : (
      <>
        <ProjectToRFTable {...renderProps} {...otherProps} />
        <div className={style['souce-project-to-rf-bottom-button']}>
          <ProjectToRFCreateButton {...renderProps} />
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </>
    );
  }
}

/**
 * 表格渲染
 * @param {*} props
 */
function ProjectToRFTable(props = {}) {
  const {
    tableDS,
    tableStyle = {},
    tableProps = {},
    activeTabKey,
    type,
    customizeTable = noop,
  } = props;
  const handleClick = (record) => {
    const { history } = props;
    if (!record.get('sourceProjectId')) return;
    const search = querystring.stringify({
      sourceFrom: type,
      sourcePage: 'inquiryHallList',
    });
    const pathname = `${activeTabKey}/project-setup/detail/${record.get('sourceProjectId')}`;
    Modal.destroyAll();
    history.push({
      pathname,
      search,
    });
  };

  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDS.setQueryParameter('multiProjectNumOrTitle', searchValue);
  };

  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiProjectNumOrTitle"
        placeholder={intl
          .get('ssrc.inquiryHall.model.inquiryHall.inputMultiRfxNumOrTitle')
          .d('请输入项目编码或者项目名称查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDS.setQueryParameter('multiProjectNumOrTitle', '');
  };

  const columns = [
    {
      name: 'sourceProjectNum',
      width: 150,
      renderer: ({ value, record }) => <a onClick={() => handleClick(record)}>{value}</a>,
    },
    {
      name: 'sourceProjectName',
      width: 300,
    },
    {
      name: 'companyName',
    },
  ];
  return (
    <React.Fragment>
      {customizeTable(
        {
          code: `SSRC.INQUIRY_HALL_PROJECT_TO_RF.${type}_LIST`,
          dataSet: tableDS,
        },
        <SearchBarTable
          clearButton
          searchCode={`SSRC.INQUIRY_HALL_PROJECT_TO_RF.${type}_FILTER_BAR`}
          key={`SSRC.INQUIRY_HALL_PROJECT_TO_RF.${type}_FILTER_BAR`} // 触发code变化后组件更新
          dataSet={tableDS}
          columns={columns}
          searchBarConfig={{
            left: {
              render: (_, ds) => leftInput(ds),
            },
            onReset: clearQueryParameter,
            onClear: clearQueryParameter,
            closeFilterSelector: true,
            expandable: false,
          }}
          // queryFieldsLimit={2}
          style={tableStyle}
          {...tableProps}
        />
      )}
    </React.Fragment>
  );
}

/**
 * 以路有形式的渲染（给角色工作台使用）
 * @param {*} props
 */
function RoutePageRender(props = {}) {
  const { type = 'RFI' } = props;
  const tableProps = { ...props, tableStyle: { maxHeight: 'calc(100vh - 2.2rem)' } }; // 角色工作台表格适配样式
  return (
    <React.Fragment>
      <Header
        backPath={null}
        title={intl.get(`ssrc.common.view.message.title.projectTo${type}`).d(`立项转${type}`)}
      >
        <ProjectToRFCreateButton {...props} />
      </Header>
      <Content>
        <ProjectToRFTable {...tableProps} />
      </Content>
    </React.Fragment>
  );
}

/**
 * 创建按钮
 * @param {*} props
 */
function ProjectToRFCreateButton(props) {
  const { type, tableDS, rfLovTemplateDS, sourceKey, history, activeTabKey } = props;

  // 立项转RFI/RFP按钮拦截
  const handleClickRFTemplate = (e) => {
    const select = tableDS?.selected;
    if (!select?.length) {
      message.warning(
        intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据')
      );
      e.preventDefault();
    }
  };

  const handleToRF = () => {
    // 寻源项目
    const select = tableDS?.selected;

    // 模板
    // 单选 和 双击
    const templateId =
      rfLovTemplateDS.current?.getField('rfTemplateLov')?.options?.current?.get('templateId') ||
      rfLovTemplateDS.get(0).get('templateId');

    if (!templateId) {
      message.warning(
        intl.get('ssrc.inquiryHall.template.confirm.selected.atLeast').d('模板至少选择一行数据')
      );
      return false;
    }

    const params = {
      ...select[0].toData(),
      templateId,
      rfHeaderSourceCategory: type,
      secondarySourceCategory: sourceKey === 'NEW_BID' ? 'NEW_BID' : null,
    };

    // 校验过后转RF方法
    const doSubmit = () => {
      projectToRF(params).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          history.push({
            pathname: `${activeTabKey}/rf-update/${type}/${res.rfHeaderId}`,
          });
        } else {
          return false;
        }
      });
    };
    projectToRFValidate(params).then((response) => {
      if (getResponse(response)) {
        validateModal({
          response,
          successCallBack: doSubmit,
          warningOk: doSubmit,
        });
      } else {
        return false;
      }
    });
  };

  return (
    <Lov
      noCache
      color="primary"
      mode="button"
      onClick={(e) => handleClickRFTemplate(e)}
      clearButton={false}
      name="rfTemplateLov"
      dataSet={rfLovTemplateDS}
      modalProps={{
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        onOk: () => handleToRF(),
        onDoubleClick: () => handleToRF(),
      }}
    >
      {intl.get(`hzero.common.create`).d('创建')}
    </Lov>
  );
}

export { ProjectToRFCreateButton };
