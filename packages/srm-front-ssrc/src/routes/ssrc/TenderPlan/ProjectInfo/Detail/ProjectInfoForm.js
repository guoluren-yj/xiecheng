/**
 * ProjectInfoForm - 项目信息维护子界面
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Row,
  Col,
  Input,
  DatePicker,
  Spin,
  Modal,
  Select,
  Icon,
  Collapse,
  // Tag,
} from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isUndefined, omit } from 'lodash';
import classNames from 'classnames';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import moment from 'moment';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  // getCurrentOrganizationId,
  getCurrentUser,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
  getDateFormat,
} from 'utils/utils';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import TLEditor from 'components/TLEditor';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import common from '@/routes/ssrc/common.less';
import CPopover from '@/routes/ssrc/components/CPopover';
import MultiSelectModal from './MultiSelectModal';
import tenderplanCss from './ProjectInfoForm.less';
import OperationRecord from '../components/OperationRecord';

const { Option } = Select;
const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { confirm } = Modal;
const { Panel } = Collapse;
const promptCode = 'ssrc.tenderPlan.model.tenderPlan';
const { TextArea } = Input;

@withCustomize({
  unitCode: [
    'SSRC.PROJECT_UPDATE.INFO',
    'SSRC.PROJECT_UPDATE.BTN',
    'SSRC.PROJECT_UPDATE.COLLAPSE',
    'SSRC.PROJECT_UPDATE.LINE_INFO',
  ],
})
@formatterCollections({
  code: ['ssrc.tenderPlan', 'ssrc.common'],
})
@connect(({ tenderPlan, loading }) => ({
  tenderPlan,
  deleting: loading.effects['tenderPlan/deleteProjectInfoDetail'],
  loading: loading.effects['tenderPlan/fetchProjectInfoDetail'],
  saving: loading.effects['tenderPlan/saveProjectInfoDetail'],
  submitting: loading.effects['tenderPlan/submitProjectInfoDetail'],
}))
@Form.create({ fieldNameProp: null })
export default class ProjectInfoForm extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    const {
      match: {
        params: { projectId },
      },
    } = props;
    this.state = {
      collapseKeys: ['headerInfo', 'lineInfo'],
      projectId,
      isEdit: !!projectId,
      purAgentVisible: false,
      enabledFlag: 1, // 是否启用
      tenantId: getCurrentOrganizationId(),
      tagShow: false,
      tags: [],
      selectPurAgentList: null,
      clearFlag: true,
      selectedRows: [], // 项目信息行勾选
      isDisabled: false,
      operationRecordModalVisible: false,
      renderBaseFormFlag: true,
    };
  }

  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    this.handelSearchProjectInfo();
    this.queryValueCode();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'tenderPlan/updateState',
      payload: {
        projectInfo: {},
        projectLinePage: {},
        projectLineInfo: [],
      },
    });
  }

  /**
   * 查询项目信息- 明细
   */
  @Bind()
  handelSearchProjectInfo() {
    const { dispatch } = this.props;
    const { projectId } = this.state;
    if (projectId) {
      dispatch({
        type: 'tenderPlan/fetchProjectInfoDetail',
        payload: {
          projectId,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.INFO',
        },
      }).then(() => {
        this.setState(
          {
            selectPurAgentList: null,
            renderBaseFormFlag: false,
          },
          () => {
            this.setState({
              renderBaseFormFlag: true,
            });
          }
        );
      });
      dispatch({
        type: 'tenderPlan/fetchProjectLineInfo',
        payload: {
          projectId,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.LINE_INFO',
        },
      });
    }
  }

  @Bind()
  handleSearchList(page = {}) {
    const { dispatch } = this.props;
    const { projectId } = this.state;
    if (projectId) {
      dispatch({
        type: 'tenderPlan/fetchProjectLineInfo',
        payload: {
          projectId,
          page,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.LINE_INFO',
        },
      });
    }
  }

  @Bind()
  hoverTagShow() {
    const { tagShow } = this.state;
    this.setState({
      tagShow: !tagShow,
    });
  }

  @Bind()
  hoverTagHide() {
    this.setState({
      tagShow: false,
    });
  }

  @Bind()
  handleClose(removedTag = {}, BBB = [], projectPurIds = []) {
    const { form } = this.props;
    const tagsData = BBB;
    const tags = tagsData.filter((tag) => tag !== removedTag);
    const a = tagsData.indexOf(removedTag);
    const projectPurAgentIds = projectPurIds.splice(a, a);
    this.setState({
      tags,
    });
    if (tags) {
      form.setFieldsValue({ projectPurAgentNames: tags });
      form.setFieldsValue({ projectPurAgentIds });
    }
  }

  /**
   * 查询资金来源值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenderPlan/queryValueCode',
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  getWarningStr(line = {}, title) {
    const renderExp = '、';
    const errorDate = intl.get('hzero.common.validation.notNull', { name: '' });

    const requiredLineErrs = [];

    const otherLineErrs = [];

    Object.values(line).forEach((item) => {
      const str = item.toString();
      let index = 0;
      index = str.indexOf(errorDate);
      if (index === -1) {
        otherLineErrs.push(`【${str}】`);
      } else {
        requiredLineErrs.push(`【${str.slice(0, index)}】`);
      }
    });
    return (
      (requiredLineErrs.length || otherLineErrs.length ? `${title}:` : '') +
      (requiredLineErrs.length > 0
        ? `${intl.get('hzero.common.validation.notNull', {
            name: requiredLineErrs.join(`${renderExp}`),
          })};`
        : '') +
      (otherLineErrs.length > 0 ? otherLineErrs.join(',') : '')
    );
  }

  /**
   * 保存或提交
   * @param {Boolean} flag true - 保存
   */
  @Bind()
  handleSaveOrSubmit(flag) {
    const { tenantId } = this.state;
    const {
      form,
      dispatch,
      tenderPlan: { projectInfo = {}, projectLineInfo },
    } = this.props;
    const projectAttributeLns = projectLineInfo[0]?.$form
      ? getEditTableData(projectLineInfo, ['projectAttributeId', '_status'], {
          force: true,
        })
      : projectLineInfo;
    form.validateFields((err, formData) => {
      if (!err) {
        if (projectLineInfo.length > 0 && projectAttributeLns.length === 0) {
          const lineErrs = {};
          const temLineErrs = projectAttributeLns.map((item) => {
            return item.$form.getFieldsError();
          });
          temLineErrs.forEach((item) => {
            Object.assign(lineErrs, filterNullValueObject(item));
          });
          const lineMessage = this.getWarningStr(
            lineErrs,
            intl.get('ssrc.tenderPlan.view.message.title.collapseLine').d('项目行信息')
          );
          return { lineMessage, errorLine: 1 };
        }
        const data = {
          ...projectInfo,
          projectAttributeLns: projectAttributeLns.reverse(),
          ...formData,
          companyId: !isUndefined(formData.companyId) ? formData.companyId : projectInfo.companyId,
          projectPurAgentIds: !isUndefined(formData.projectPurAgentIds)
            ? formData.projectPurAgentIds
            : projectInfo.projectPurAgentIds,
          creationDate:
            formData.creationDate && moment(formData.creationDate).format('YYYY-MM-DD 00:00:00'),
          tenantId,
        };
        if (flag) {
          dispatch({
            type: 'tenderPlan/saveProjectInfoDetail',
            payload: { data, customizeUnitCode: 'SSRC.PROJECT_UPDATE.INFO' },
          }).then((res) => {
            if (res) {
              form.setFieldsValue({
                projectNum: res.projectNum,
              });
              notification.success();
              dispatch({
                type: 'tenderPlan/fetchProjectInfoDetail',
                payload: {
                  projectId: res.projectId,
                  customizeUnitCode: 'SSRC.PROJECT_UPDATE.INFO',
                },
              }).finally(() => {
                form.resetFields();
                this.setState(
                  {
                    renderBaseFormFlag: false,
                  },
                  () => {
                    this.setState({
                      renderBaseFormFlag: true,
                    });
                  }
                );
              });
              dispatch({
                type: 'tenderPlan/fetchProjectLineInfo',
                payload: {
                  projectId: res.projectId,
                  customizeUnitCode: 'SSRC.PROJECT_UPDATE.LINE_INFO',
                },
              });
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/project-maintenance/project-detail/${res.projectId}`,
                })
              );
            }
          });
        } else {
          confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
            onOk: () => {
              dispatch({
                type: 'tenderPlan/submitProjectInfoDetail',
                payload: { data, customizeUnitCode: 'SSRC.PROJECT_UPDATE.INFO' },
              }).then((res) => {
                if (res) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: '/ssrc/project-maintenance/list',
                    })
                  );
                }
              });
            },
          });
        }
      }
    });
  }

  @Bind()
  principalUserOnChange(_, record) {
    const { form } = this.props;
    const { phone, email } = record;
    form.setFieldsValue({
      phone,
      email,
    });
  }

  /**
   * 查询项目采购负责人lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 控制项目采购负责人弹出框的显示
   */
  @Bind()
  handleShowPurAgent() {
    const { purAgentVisible } = this.state;
    this.setState({
      purAgentVisible: !purAgentVisible,
    });
  }

  /**
   * 删除项目信息
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      tenderPlan: { projectInfo = {} },
    } = this.props;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？'),
      onOk: () => {
        if (projectInfo.projectId) {
          dispatch({
            type: 'tenderPlan/deleteProjectInfoDetail',
            payload: {
              projectId: projectInfo.projectId,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/ssrc/project-maintenance/list',
                })
              );
            }
          });
        }
      },
    });
  }

  /**
   * 同步 多选框 值节流以提高性能
   * @param {String} value - 多选框 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows(record = []) {
    const { form } = this.props;
    this.handleShowPurAgent();
    // const arr = record.map(o => ({
    //   loginName: o.loginName,
    //   id: o.id,
    //   realName: o.realName,
    //   phone: o.phone,
    //   email: o.email,
    // }));
    const value = record.map((o) => o.realName);
    const id = record.map((o) => o.id);
    if (value) {
      form.setFieldsValue({ projectPurAgentNames: value });
    }
    if (id) {
      form.setFieldsValue({ projectPurAgentIds: id });
    }
    this.setState(
      {
        tags: value,
        selectPurAgentList: record,
      },
      () => {
        this.setValue(value);
      }
    );
  }

  /**
   * 查询项目采购负责人选择lov数据
   */
  @Bind()
  fetchPurAgentLovData(params = {}) {
    const { purAgentVisible } = this.state;
    if (!purAgentVisible) {
      this.handleShowPurAgent();
    }
    const {
      dispatch,
      tenderPlan: { purAgentPagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'tenderPlan/fetchPurAgentLovData',
      payload: {
        page: isEmpty(params) ? purAgentPagination : params,
        ...fieldValues,
      },
    });
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    } else {
      return (
        <Icon
          key="search"
          type="search"
          onClick={this.fetchPurAgentLovData}
          style={{ cursor: 'pointer', color: '#666' }}
        />
      );
    }
  }

  /**
   * 改变公司-清空业务实体
   */
  @Bind()
  changeCompany(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (!value) {
      setFieldsValue({ ouId: undefined });
    }
  }

  @Bind()
  emitEmpty() {
    const { form } = this.props;
    this.setState(
      {
        tags: '',
        selectPurAgentList: [],
      },
      () => {
        if (form) {
          form.setFieldsValue({
            projectPurAgentNames: '',
          });
        }
      }
    );
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 基本信息表单渲染
   */
  renderBaseForm() {
    const {
      form,
      customizeForm,
      tenderPlan: { projectInfo = {}, fundsSourceCodeList = [] },
    } = this.props;
    const { enabledFlag = 1, tenantId, isEdit, renderBaseFormFlag } = this.state;
    const dateFormat = getDateFormat();
    const { getFieldDecorator, getFieldValue } = form;
    const { projectPurAgents = [] } = projectInfo;
    const { tags, clearFlag, isDisabled } = this.state;
    const BBB = form.getFieldValue('projectPurAgentNames');
    const AAA = BBB && BBB.join(',');
    // const projectPurIds = form.getFieldValue('projectPurAgentIds');
    const showSuffix = tags && clearFlag && !isDisabled;
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        {this.searchButton()}
      </React.Fragment>
    );
    const lovClassNames = ['lov-input'];
    if (showSuffix) {
      lovClassNames.push('lov-suffix');
    }
    if (isDisabled) {
      lovClassNames.push('lov-disabled');
    }
    return (
      renderBaseFormFlag &&
      customizeForm(
        {
          code: 'SSRC.PROJECT_UPDATE.INFO',
          form: this.props.form,
          dataSource: projectInfo,
        },
        <Form
          layout="horizontal"
          className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
        >
          <Row gutter={48}>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.projectCode`).d('项目编号')} {...formLayOut}>
                {getFieldDecorator('projectNum', {
                  rules: [
                    // {
                    //   pattern: /^[a-zA-Z0-9_-]*$/,
                    //   message: intl
                    //     .get(`${promptCode}.projectCodePatternMsg`)
                    //     .d(`项目编号只能由字母、数字、'_'、'-'组成`),
                    // },
                    {
                      max: 100,
                      message: intl.get('hzero.common.validation.max', {
                        max: 100,
                      }),
                    },
                  ],
                  initialValue: projectInfo.projectNum,
                })(<Input disabled={isEdit} inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.projectName`).d('项目名称')} {...formLayOut}>
                {getFieldDecorator('projectName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.projectName`).d('项目名称'),
                      }),
                    },
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                  initialValue: projectInfo.projectName,
                })(
                  <TLEditor
                    label={intl.get(`${promptCode}.bidPlanLineName`).d('寻源计划名称')}
                    field="projectName"
                    token={projectInfo._token}
                    disabled={projectInfo.projectStatus === 'RELEASED'}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayOut}>
                {getFieldDecorator('companyId', {
                  initialValue: projectInfo.companyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('ssrc.common.company').d('公司'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    textValue={projectInfo.companyName}
                    disabled={projectInfo.projectStatus === 'RELEASED'}
                    onChange={this.changeCompany}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.ouName`).d('业务实体')} {...formLayOut}>
                {getFieldDecorator('ouId', {
                  initialValue: projectInfo.ouId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.ouName`).d('业务实体'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={
                      getFieldValue('companyId') === undefined ||
                      projectInfo.projectStatus === 'RELEASED'
                    }
                    code="SPFM.USER_AUTH.OU"
                    textValue={projectInfo.ouName}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.projectUserName`).d('项目负责人')}
                {...formLayOut}
              >
                {getFieldDecorator('principalUserId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.projectUserName`).d('项目负责人'),
                      }),
                    },
                  ],
                  initialValue: projectInfo.principalUserId,
                })(
                  <Lov
                    code="SSRC.PREQUAL_USER"
                    queryParams={{ organizationId: tenantId }}
                    textValue={projectInfo.realName}
                    onChange={this.principalUserOnChange}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.phone`).d('手机号')} {...formLayOut}>
                {getFieldDecorator('phone', {
                  initialValue: projectInfo.phone,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.email`).d('邮箱')} {...formLayOut}>
                {getFieldDecorator('email', {
                  initialValue: projectInfo.email,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.projectAddress`).d('项目地址')}
                {...formLayOut}
              >
                {getFieldDecorator('projectAddress', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.projectAddress`).d('项目地址'),
                      }),
                    },
                    {
                      max: 100,
                      message: intl.get('hzero.common.validation.max', {
                        max: 100,
                      }),
                    },
                  ],
                  initialValue: projectInfo.projectAddress,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.fundsSource`).d('资金来源')} {...formLayOut}>
                {getFieldDecorator('fundsSource', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.fundsSource`).d('资金来源'),
                      }),
                    },
                  ],
                  initialValue: projectInfo.fundsSource,
                })(
                  <Select allowClear style={{ width: '100%' }}>
                    {fundsSourceCodeList.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.creationDate`).d('创建日期')}
                {...formLayOut}
              >
                {getFieldDecorator('creationDate', {
                  initialValue: projectInfo.creationDate
                    ? projectInfo.creationDate && moment(projectInfo.creationDate, getDateFormat())
                    : moment(moment(new Date()).format(DEFAULT_DATE_FORMAT)),
                })(
                  <DatePicker
                    disabled
                    style={{ width: '100%' }}
                    format={dateFormat}
                    placeholder=""
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.createdByName`).d('创建人')} {...formLayOut}>
                {getFieldDecorator('createdByName', {
                  initialValue: projectInfo.createdByName
                    ? projectInfo.createdByName
                    : getCurrentUser().realName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${promptCode}.enabledFlag`).d('是否启用')} {...formLayOut}>
                {getFieldDecorator('enabledFlag', {
                  initialValue:
                    projectInfo.enabledFlag === 0 ? projectInfo.enabledFlag : enabledFlag,
                })(<Switch />)}
              </FormItem>
            </Col>
            {/* <Col span={8} /> */}
          </Row>
          <Row gutter={48}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${promptCode}.projectPurAgents`).d('项目采购负责人')}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 13 }}
              >
                {/* {BBB && tagShow &&
                BBB.map(item => (
                  <Tag closable afterClose={() => this.handleClose(item, BBB, projectPurIds)}>
                    {item}
                  </Tag>
                ))} */}

                {getFieldDecorator('projectPurAgentNames', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.projectPurAgents`).d('项目采购负责人'),
                      }),
                    },
                  ],
                  initialValue: projectPurAgents.map((i) => i.userName),
                })(
                  <CPopover placement="topLeft" content={AAA} trigger="hover">
                    <Input
                      style={{ marginLeft: '-20px' }}
                      readOnly={!false}
                      value={BBB}
                      onFocus={() => this.hoverTagShow()}
                      // addonAfter={this.searchButton()}
                      suffix={suffix}
                      onChange={(e) => this.saveRecordRows(e.target.value)}
                      allowClear={clearFlag}
                      disabled={isDisabled}
                      className={lovClassNames.join(' ')}
                    />
                  </CPopover>
                )}
                {getFieldDecorator('projectPurAgentIds', {
                  initialValue: projectPurAgents.map((i) => i.userId),
                })(<div />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={24}>
              <FormItem
                label={intl.get('hzero.common.remark').d('备注')}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 13 }}
              >
                {getFieldDecorator('remark', {
                  initialValue: projectInfo.remark,
                })(<TextArea style={{ marginLeft: '-20px' }} rows={2} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      )
    );
  }

  @Bind()
  handleAddLine() {
    const {
      tenderPlan: { projectLineInfo = [], projectLinePage = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'tenderPlan/updateState',
      payload: {
        projectLineInfo: [
          filterNullValueObject({ _status: 'create', projectAttributeId: uuid() }),
          ...projectLineInfo,
        ],
        projectLinePage: { ...addItemToPagination(projectLineInfo.length, projectLinePage) },
      },
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleDeleteLine() {
    const { selectedRows } = this.state;
    const selectedRowKeys = selectedRows.map((ele) => ele.projectAttributeId);
    const {
      tenderPlan: { projectLineInfo = [], projectInfo = {}, projectLinePage = {} },
      dispatch,
    } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get('hzero.common.view.message.deleteConfirm').d('是否删除？'),
      onOk: () => {
        projectLineInfo.forEach((item) => {
          if (!selectedRowKeys.includes(item.projectAttributeId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'tenderPlan/deleteLine',
            payload: {
              projectId: projectInfo.projectId,
              projectAttributeLns: deleteList,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handelSearchProjectInfo();
            }
          });
        } else {
          dispatch({
            type: 'tenderPlan/updateState',
            payload: {
              projectLineInfo: newDataSource,
              projectLinePage: delItemsToPagination(
                selectedRowKeys.length,
                projectLineInfo.length,
                projectLinePage
              ),
            },
          });
        }
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading = false,
      saving = false,
      deleting,
      submitting,
      tenderPlan: {
        purAgentPagination = {},
        projectInfo = {},
        purAgentList = {},
        projectLineInfo = [],
        projectLinePage = {},
      },
      customizeBtnGroup,
      customizeCollapse,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.common.model.soSend.lineNumber').d('行号'),
        width: 80,
        dataIndex: 'lineNum',
      },
    ];
    const { projectPurAgents = [], projectId } = projectInfo;
    const {
      isEdit,
      purAgentVisible,
      operationRecordModalVisible,
      selectPurAgentList,
      collapseKeys,
      selectedRows,
    } = this.state;
    const tableProps = {
      columns,
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.projectAttributeId),
        onChange: this.onSelectChange,
      },
      onChange: this.handleSearchList,
      dataSource: projectLineInfo,
      pagination: projectLinePage,
      rowKey: 'projectAttributeId',
    };

    const queryFields = [
      {
        field: 'loginName',
        label: intl.get(`${promptCode}.loginName`).d('账户'),
      },
      {
        field: 'realName',
        label: intl.get(`${promptCode}.realName`).d('名称'),
      },
      {
        field: 'phone',
        label: intl.get(`${promptCode}.phone`).d('手机号'),
      },
      {
        field: 'email',
        label: intl.get(`${promptCode}.email`).d('邮箱'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`${promptCode}.loginName`).d('账户'),
        dataIndex: 'loginName',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.realName`).d('名称'),
        dataIndex: 'realName',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.phone`).d('手机号'),
        dataIndex: 'phone',
        align: 'left',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.email`).d('邮箱'),
        dataIndex: 'email',
        align: 'left',
        width: 150,
      },
    ];
    const purAgentModel = {
      purAgentVisible,
      queryFields,
      fieldsColumn,
      purAgentPagination,
      purAgentList,
      projectPurAgents:
        selectPurAgentList ||
        projectPurAgents.map((ele) => ({ ...ele, id: ele.userId, realName: ele.userName })),
      onRef: this.handleFecthRef,
      onChange: this.handleShowPurAgent,
      onSaveRecord: this.saveRecordRows,
      fetchPurAgentData: this.fetchPurAgentLovData,
    };

    const operationRecordProps = {
      visible: operationRecordModalVisible,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      projectId,
    };

    return (
      <React.Fragment>
        <Header
          title={
            isEdit
              ? intl.get('ssrc.tenderPlan.view.message.title.editProjectInfo').d('项目信息维护')
              : intl.get('ssrc.tenderPlan.view.message.title.createProjectInfo').d('项目信息创建')
          }
          backPath="/ssrc/project-maintenance/list"
        >
          {customizeBtnGroup({ code: 'SSRC.PROJECT_UPDATE.BTN' }, [
            <Button
              icon="check"
              type="primary"
              data-name="submit"
              loading={submitting || loading}
              onClick={() => this.handleSaveOrSubmit(false)}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
            projectInfo.projectStatus !== 'RELEASED' && (
              <Button
                icon="save"
                data-name="save"
                loading={saving || loading}
                onClick={() => this.handleSaveOrSubmit(true)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            ),
            <Button
              icon="delete"
              data-name="delete"
              disabled={JSON.stringify(projectInfo) === '{}'}
              loading={deleting}
              onClick={this.handleDelete}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
            projectId && (
              <Button
                icon="clock-circle-o"
                data-name="history"
                onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
            ),
          ])}
        </Header>
        <Content>
          <Spin spinning={loading || saving}>
            <div className={tenderplanCss.tender_plan}>
              {customizeCollapse(
                {
                  code: 'SSRC.PROJECT_UPDATE.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className={tenderplanCss['form-collapse']}
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get('ssrc.tenderPlan.view.message.title.collapseHeader')
                            .d('项目基础信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('headerInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('headerInfo') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="headerInfo"
                  >
                    {this.renderBaseForm()}
                  </Panel>
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get('ssrc.tenderPlan.view.message.title.collapseLine')
                            .d('项目行信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('lineInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('lineInfo') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="lineInfo"
                  >
                    <div>
                      <div>
                        <Form layout="inline">
                          <Button type="primary" onClick={this.handleAddLine}>
                            {intl.get('hzero.common.button.create').d('新建')}
                          </Button>
                          <Button onClick={this.handleDeleteLine} name="delete">
                            {intl.get('hzero.common.button.delete').d('删除')}
                          </Button>
                        </Form>
                      </div>
                      {customizeTable(
                        { code: 'SSRC.PROJECT_UPDATE.LINE_INFO' },
                        <EditTable {...tableProps} />
                      )}
                    </div>
                  </Panel>
                </Collapse>
              )}
            </div>
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {purAgentVisible && <MultiSelectModal {...purAgentModel} Key="new" />}
      </React.Fragment>
    );
  }
}
