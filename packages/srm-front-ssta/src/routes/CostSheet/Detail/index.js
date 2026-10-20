/* eslint-disable react/no-did-update-set-state */
/* @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Form, Modal, Attachment, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DocFlow from '_components/DocFlow';

import { Header, Content } from 'components/Page';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'hzero-front/lib/utils/menuTab';
import { btnsFormat } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import { FixedAnchor, FormItem, OperationApprove, getPermissions } from '@/routes/Components';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import {
  getDetail,
  save,
  completed,
  cancel,
  reverse,
  amount,
  approveResolve,
  approveReject,
  userDefaults,
} from '@/services/costSheetService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import Styles from '@/routes/common.less';
import { formDs, tableDs } from './mainDS';
import ExeResult from './ExeResult';
import FilledInfoModal from './FilledInfoModal';

// 租户id
const tenantId = getCurrentOrganizationId();

// 权限编码前缀
const permPrefix = `srm.settle-account.cost-sheet.cost-sheet.ps.radio.button`;

const unitCode = [
  'SSTA.COST_SHEET_DETAIL.BASIC',
  'SSTA.COST_SHEET_DETAIL.TRADINGPARTY',
  'SSTA.COST_SHEET_DETAIL.TRANSACTIONAMOUNT',
  'SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL',
  'SSTA.COST_SHEET_DETAIL.OTHERS',
  'SSTA.COST_SHEET_DETAIL.ENCLOSURE',
  'SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW',
  'SSTA.COST_SHEET_DETAIL.HEADER_BTNS', // 头按钮组
  'SSTA.COST_SHEET_DETAIL.CONFIRM',
  'SSTA.COST_SHEET_DETAIL.RETURN',
];
const customizeUnitCode = unitCode.join();

@withCustomize({
  unitCode,
})
@formatterCollections({
  code: [
    'ssta.costSheet',
    'entity.attachment',
    'ssta.settlePool',
    'sbud.budgeting',
    'hwfp.common',
    'hzero.common',
    'ssta.purchaseSettle',
    'ssta.purchaseSettlePool',
  ],
})
@observer
export default class Detail extends PureComponent {
  /**
   * 查看执行情况弹窗
   */
  modal = null;

  /**
   * 头 DataSet
   */
  formDs = new DataSet(formDs());

  /**
   * 行 DataSet
   */
  tableDs = new DataSet(tableDs());

  /**
   * Creates an instance of Detail
   * @params {Object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const isPub = Number(props.location.pathname.indexOf('/pub/'));
    const {
      chargeHeaderId = null,
      updateFlag = 0,
      reverseFlag = 0,
      approveFlag = 0,
      readeOnly = 0,
      lineEdit, // 仅用于工作流行是否可编辑
    } = routerParams;
    /**
     * 内部状态
     */
    this.state = {
      readeOnly,
      chargeHeaderId,
      updateFlag,
      editFlag: false,
      loading: true,
      chargeStatus: 'NEW',
      taxIncludedEnableFlag: 0,
      taxAmountUpdateFlag: 0,
      reverseFlag,
      approveFlag,
      lineSelect: [],
      readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
      isPub,
      lineEdit,
      permsMap: props.permsMap || new Map(), // 权限集数据 map
    };
  }

  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    this.tableDs.init = this.init;
    this.tableDs.addEventListener('select', this.handleSelect);
    this.tableDs.addEventListener('unSelect', this.handleSelect);
    this.tableDs.addEventListener('selectAll', this.handleSelect);
    this.tableDs.addEventListener('unSelectAll', this.handleSelect);
    this.init();
    this.getPermissions();
  }

  /**
   * 获取权限集数据
   */
  getPermissions = async () => {
    const data = await getPermissions([
      `${permPrefix}.update`,
      `${permPrefix}.audit`,
      `${permPrefix}.completed`,
    ]);
    if (data) {
      this.setState({
        permsMap: data,
      });
    }
  };

  componentDidUpdate(preProps) {
    const { chargeStatus } = this.state;
    if (preProps.location.search !== this.props.location.search) {
      const routerParams = querystring.parse(this.props.location.search.substr(1));

      const {
        chargeHeaderId = null,
        updateFlag = 0,
        reverseFlag = 0,
        approveFlag = 0,
      } = routerParams;

      this.setState({
        chargeHeaderId,
        updateFlag,
        reverseFlag,
        approveFlag,
        readOnly: !(Number(reverseFlag) || Number(approveFlag) || Number(updateFlag)),
        editFlag:
          (Number(updateFlag) === 1 && ['NEW', 'UPDATE', 'RETURNED'].includes(chargeStatus)) ||
          (Number(updateFlag) === 0 &&
            Number(reverseFlag) === 1 &&
            ['SUBMITTED'].includes(chargeStatus)),
      });
      this.init(true);
    }
  }

  /**
   * 页面初始化查询
   */
  init = async (flag) => {
    const { chargeHeaderId, updateFlag, approveFlag, reverseFlag, readeOnly } = this.state;
    const { onLoad } = this.props;
    this.formDs.approveFlag = approveFlag;
    if (chargeHeaderId) {
      this.setState({ loading: true });
      const res = getResponse(await getDetail(chargeHeaderId, customizeUnitCode));
      if (res) {
        const {
          chargeStatus = 'NEW',
          taxIncludedEnableFlag = 0,
          currencyCode,
          companyId,
          supplierCompanyId,
          taxAmountUpdateFlag = 0,
          supplierId,
          ouId,
          camp,
          approveMethod,
          supplierSiteEnableFlag,
          supplierSiteId,
          collaborativeMode,
        } = res;
        this.addEvents(currencyCode);
        this.tableDs.addField('currencyCode', {
          type: 'string',
          defaultValue: currencyCode,
        });
        this.tableDs.addField('companyId', {
          type: 'string',
          defaultValue: companyId,
        });
        this.tableDs.addField('taxIncludedEnableFlag', {
          name: 'taxIncludedEnableFlag',
          defaultValue: taxIncludedEnableFlag,
        });
        this.tableDs.addField('taxAmountUpdateFlag', {
          type: 'string',
          defaultValue: taxAmountUpdateFlag,
        });
        this.tableDs.addField('supplierCompanyId', {
          type: 'string',
          defaultValue: supplierCompanyId,
        });
        this.tableDs.addField('supplierId', {
          type: 'string',
          defaultValue: supplierId,
        });
        this.tableDs.addField('ouId', {
          type: 'string',
          defaultValue: ouId,
        });
        if (supplierSiteEnableFlag === 1) {
          this.tableDs.supplierSiteId = supplierSiteId;
        }

        if (
          (Number(updateFlag) === 1 && ['NEW', 'UPDATE', 'RETURNED'].includes(chargeStatus)) ||
          (Number(updateFlag) === 0 &&
            Number(reverseFlag) === 1 &&
            ['SUBMITTED'].includes(chargeStatus))
        ) {
          this.setState({
            editFlag: true,
          });
        }
        this.setState({
          camp,
          loading: false,
          chargeStatus,
          approveMethod,
          taxIncludedEnableFlag,
          taxAmountUpdateFlag,
          collaborativeMode,
        });
        this.formDs.loadData([res]);
        if (flag) {
          this.formDs.current.set({
            taxAmount: res.taxAmount,
            netAmount: res.netAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            objectVersionNumber: res.objectVersionNumber,
          });
        } else {
          this.formDs.loadData([res]);
        }
      }

      if (onLoad && !readeOnly) {
        onLoad({
          submit: this.workFlowSubmit,
        });
      }
    } else {
      const res = getResponse(await userDefaults());
      const companyLov = await queryUnifyIdpValue('HPFM.TENANT_COMPANY');
      if (res && res.enabledFlag === 1 && companyLov && companyLov.length > 0) {
        this.formDs.loadData([
          {
            ...res,
            companyNum: companyLov.filter((item) => item.companyId === res.companyId)[0]
              ?.companyNum,
            invOrganizationId: res.organizationId,
            invOrganizationName: res.organizationName,
            chargeStatus: 'NEW',
          },
        ]);
      }
      this.formDs.supplierEditFlag = true;
      this.setState({
        editFlag: true,
        loading: false,
      });
    }
  };

  /**
   * 监听行勾选
   */
  handleSelect = () => {
    this.setState({
      lineSelect: this.tableDs.selected.map((item) => item.toData()),
    });
  };

  /**
   * 行表格添加监听函数
   * @param {Number} currencyCode 币种精度
   */
  addEvents = async (currencyCode) => {
    try {
      const res = getResponse(await amount(currencyCode));
      if (res && !res.failed) {
        const { amount: amount1 } = res;
        this.tableDs.addEventListener('update', ({ record, name, value }) => {
          const taxIncludedEnableFlag = Number(record.get('taxIncludedEnableFlag')); // 1->含税价 0->不含税价
          const taxAmountUpdateFlag = Number(record.get('taxAmountUpdateFlag')); // 1->允许修改税额 0->不允许修改税额
          const netAmount = record.get('netAmount') || 0; // 不含税金额
          const taxIncludedAmount = record.get('taxIncludedAmount') || 0; // 含税金额
          const taxRate = Number(record.get('taxRate') || 0) / 100;
          let taxAmount = 0; // 税额

          /**
           *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 0 ,  taxIncludedAmount = netAmount*taxRate, taxAmount = taxIncludedAmount-netAmount
           *  taxAmountUpdateFlag = 0 , taxIncludedEnableFlag = 1 ,  税额taxAmount=round（含税金额taxIncludedAmount/（1+税率taxRate）*税率taxRate，2） 不含税金额netAmount=含税金额taxIncludedAmount-税额taxAmount
           */

          if (taxIncludedEnableFlag === 0 && name === 'netAmount') {
            taxAmount = math.toFixed(math.multipliedBy(netAmount, taxRate), amount1);
            record.set('taxAmount', taxAmount);
            record.set('taxIncludedAmount', math.toFixed(math.plus(taxAmount, netAmount), amount1));
          }
          if (taxIncludedEnableFlag === 1 && name === 'taxIncludedAmount') {
            const taxIncludedAmountDevRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
            taxAmount = math.toFixed(math.multipliedBy(taxIncludedAmountDevRate, taxRate), amount1);
            record.set('taxAmount', taxAmount);
            record.set(
              'netAmount',
              math.toFixed(math.minus(taxIncludedAmount, taxAmount), amount1)
            );
          }
          if (taxAmountUpdateFlag === 1 && name === 'taxAmount') {
            const taxAmount1 = Number(record.get('taxAmount') || 0);
            if (taxIncludedEnableFlag === 1) {
              record.set(
                'netAmount',
                math.toFixed(math.minus(taxIncludedAmount, taxAmount1), amount1)
              );
            }
            if (taxIncludedEnableFlag === 0) {
              record.set(
                'taxIncludedAmount',
                math.toFixed(math.plus(netAmount, taxAmount1), amount1)
              );
            }
          }
          if (taxIncludedEnableFlag === 0 && name === 'taxRateLov') {
            taxAmount = math.toFixed(math.multipliedBy(netAmount, taxRate), amount1);
            const taxIncludedAmount1 = math.toFixed(math.plus(taxAmount, netAmount), amount1);
            record.set('taxAmount', taxAmount);
            record.set('taxIncludedAmount', taxIncludedAmount1);
          }
          if (taxIncludedEnableFlag === 1 && name === 'taxRateLov') {
            const taxIncludedAmountDevRate = math.div(taxIncludedAmount, math.plus(1, taxRate));
            taxAmount = math.toFixed(math.multipliedBy(taxIncludedAmountDevRate, taxRate), amount1);
            const netAmount1 = math.toFixed(math.minus(taxIncludedAmount, taxAmount), amount1);
            record.set('taxAmount', taxAmount);
            record.set('netAmount', netAmount1);
          }
          if (['taxAmount', 'taxIncludedAmount', 'netAmount'].includes(name)) {
            record.set(name, math.toFixed(value, amount1));
          }
        });
      }
    } catch (error) {
      notification.error({ description: error });
    }
  };

  /**
   * 动态渲染行操作按钮
   * @returns React.Element
   */
  getTableButtons = () => {
    const { editFlag, lineSelect } = this.state;
    if (editFlag) {
      return [
        <Button icon="playlist_add" onClick={() => this.handleAdd(this.tableDs)} key="add">
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        <Button
          icon="cancel"
          disabled={lineSelect.length <= 0}
          onClick={() => this.handleCancel(this.tableDs)}
          key="add"
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>,
      ];
    } else {
      return [];
    }
  };

  /**
   * 操作记录、审批记录
   * @param {*} record
   * @param {*} chargeHeaderId
   */
  openOprationModal = (record, chargeHeaderId) => {
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: <OperationApprove record={record} chargeHeaderId={chargeHeaderId} />,
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
          {/* <div className="flowSheet">
            <Icon type="branch" />
            {intl.get('ssta.costSheet.model.costSheet.flowSheet').d('流程图')}
          </div> */}
        </div>
      ),
    });
  };

  /**
   * 响应行新增按钮点击
   * @param {Object} ds 行 DataSet
   */
  handleAdd = (ds) => {
    const { taxIncludedEnableFlag, chargeHeaderId, taxAmountUpdateFlag } = this.state;
    ds.create(
      {
        taxIncludedEnableFlag,
        chargeHeaderId,
        taxAmountUpdateFlag,
      },
      ds.toData().length
    );
  };

  /**
   * 响应行取消按钮点击
   * @param {Obejct} ds 行 DataSet
   */
  handleCancel = async (ds) => {
    const res = await ds.delete(ds.selected);
    if (res && res.success) {
      this.init(1);
      await this.tableDs.query();
      this.tableDs.clearCachedSelected();
    }
  };

  /**
   * 获取接口数据
   * @returns 数据
   */
  getSaveSendData = async () => {
    this.formDs.current.status = 'create';
    const headerValidateFlag = await this.formDs.current?.validate(true);
    const linesValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
      const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
      const sendData = {
        chargeHeader: { camp: 'PURCHASER', ...headerData },
        chargeLineList: lineData,
      };
      return sendData;
    } else {
      return false;
    }
  };

  /**
   * 获取接口数据
   * @returns 数据
   */
  getSendData = async () => {
    this.formDs.current.status = 'add';
    const headerValidateFlag = await this.formDs.validate();
    const linesValidateFlag = await this.tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
      const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
      const sendData = {
        ...headerData,
        chargeLineList: lineData,
      };
      return sendData;
    } else {
      return false;
    }
  };

  /**
   * 响应弹窗
   * @param {Function} reqFun 请求函数
   * @param {Object} sendData 请求数据
   */
  handleFilledInfoOk = async (reqFun, sendData) => {
    const { history } = this.props;
    this.setState({ loading: true });
    const res = getResponse(await reqFun({ ...sendData, customizeUnitCode }));
    this.setState({ loading: false });
    if (res) {
      notification.success();
      history.push({
        pathname: '/ssta/cost-sheet/list',
        state: { _back: 1 },
      });
    }
  };

  /**
   * 响应操作
   * @param {Function} reqFun 接口方法
   */
  handleOpr = (reqFun, action) => {
    const { customizeForm, custConfig } = this.props;
    const { reverseFlag } = this.state;
    if (reverseFlag) {
      this.setState(
        {
          loading: true,
        },
        async () => {
          const sendData = await this.getSendData();
          if (sendData) {
            const res = getResponse(await reqFun({ ...sendData, customizeUnitCode }));
            if (res) {
              notification.success();
              const { history } = this.props;
              history.push({
                pathname: '/ssta/cost-sheet/list',
                state: { _back: 1 },
              });
            } else {
              this.setState({
                loading: false,
              });
            }
          } else {
            notification.error({
              description: intl
                .get('hzero.common.view.message.notpassRequire')
                .d('请填写必填字段后保存'),
            });
            this.setState({
              loading: false,
            });
          }
        }
      );
    } else {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        closable: true,
        className: Styles['ssta-small-modal'],
        title: intl.get(`ssta.costSheet.view.message.panel.approveInfo`).d('审核信息'),
        children: (
          <FilledInfoModal
            reqFun={reqFun}
            action={action}
            headerDS={this.formDs}
            custConfig={custConfig}
            customizeForm={customizeForm}
            onOk={this.handleFilledInfoOk}
          />
        ),
      });
    }
  };

  /**
   * 响应头取消按钮点击
   * @param {Function} reqFun 接口方法
   */
  handleOprCancel = (reqFun) => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
        const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
        const sendData = {
          ...headerData,
          chargeLineList: lineData,
        };
        const res = getResponse(await reqFun(sendData));

        if (res) {
          notification.success();
          const { history } = this.props;
          history.push({
            pathname: '/ssta/cost-sheet/list',
            state: { _back: 1 },
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      }
    );
  };

  operateBeforeConfirm = (reqFun) => {
    const { chargeStatusMeaning, chargeNum } = this.formDs.current?.toData();
    const documentTypeMeaning = `${chargeStatusMeaning}${intl
      .get('ssta.costSheet.model.expenseSheets')
      .d('费用单')}`;
    const info = {
      action: 'CANCEL',
      bills: `${documentTypeMeaning}${chargeNum}`,
      billType: documentTypeMeaning,
    };
    confirmModal(info, this.handleOprCancel, reqFun);
  };

  /**
   * 响应头提交按钮点击
   */
  handleFinishOpr = () => {
    this.setState(
      {
        loading: true,
      },

      async () => {
        const sendData = await this.getSaveSendData();
        if (sendData) {
          const res = getResponse(await completed({ ...sendData, customizeUnitCode }));
          if (res) {
            notification.success();
            const { history } = this.props;
            history.push({
              pathname: '/ssta/cost-sheet/list',
              state: { _back: 1 },
            });
          } else {
            this.setState({
              loading: false,
            });
          }
        } else {
          notification.error({
            description: intl
              .get('hzero.common.view.message.notpassRequire')
              .d('请填写必填字段后保存'),
          });
          this.setState({
            loading: false,
          });
        }
      }
    );
  };

  /**
   * 响应头保存按钮点击
   */
  handleSaveOpr = () => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        const sendData = await this.getSaveSendData();
        if (sendData) {
          try {
            const res = getResponse(await save(sendData));
            if (res && !res.failed) {
              const {
                chargeHeader: { chargeHeaderId },
              } = res;
              this.setState(
                {
                  chargeHeaderId,
                  loading: false,
                },
                () => {
                  notification.success();
                  this.init();
                  this.tableDs.setQueryParameter('chargeHeaderId', chargeHeaderId);
                  this.tableDs.query(undefined, undefined, false);
                  const { history } = this.props;
                  this.updateTabLink(
                    querystring.stringify({ chargeHeaderId, updateFlag: 1 }),
                    null
                  );
                  history.push({
                    pathname: '/ssta/cost-sheet/detail',
                    search: querystring.stringify({ chargeHeaderId, updateFlag: 1 }),
                  });
                }
              );
            } else {
              this.setState({
                loading: false,
              });
            }
          } catch (error) {
            this.setState({
              loading: false,
            });
          }
        } else {
          notification.error({
            description: intl
              .get('hzero.common.view.message.notpassRequire')
              .d('请填写必填字段后保存'),
          });
          this.setState({
            loading: false,
          });
        }
      }
    );
  };

  // 工作流的提交方法
  workFlowSubmit = () => {
    return new Promise(async (resolve, reject) => {
      const sendData = await this.getSaveSendData();
      if (sendData === false) {
        const errElement = document.getElementById('CostSheet-othersInf');
        if (errElement) {
          errElement.scrollIntoView(true);
        }
        return reject();
      }
      const res = getResponse(await save(sendData));
      return res ? resolve() : reject();
    });
  };

  updateTabLink = (search, state) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state,
    });
  };

  linkToUpdateDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  linkToApproveDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        approveFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        approveFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  linkToReverseDetail = () => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { chargeHeaderId } = this.state;
    this.updateTabLink(
      querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        reverseFlag: 1,
      }),
      {
        backPath: `${pathname}${search}`,
      }
    );
    history.push({
      pathname: '/ssta/cost-sheet/detail',
      search: querystring.stringify({
        chargeHeaderId,
        updateFlag: 0,
        reverseFlag: 1,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  };

  /**
   * 响应点击查看执行情况
   * @param {Object} record 行记录
   */
  viewExeResult = (record) => {
    const title = intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况');
    const { chargeHeaderId } = this.state;
    const { history } = this.props;
    this.modal = Modal.open({
      key: 'viewexeresult',
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-medium-modal'],
      // footer: null,
      title,
      children: (
        <ExeResult
          record={record}
          chargeHeaderId={chargeHeaderId}
          history={history}
          closeExeResult={this.closeExeResult}
        />
      ),
      // onCancel: () => { },
    });
  };

  /**
   * 响应关闭执行情况弹窗
   */
  closeExeResult = () => {
    if (this.modal) {
      this.modal.close();
    }
  };

  supplierSiteChange = (record) => {
    const supplierSiteEnableFlag = this.formDs.current.get('supplierSiteEnableFlag');
    if (supplierSiteEnableFlag === 1) {
      this.tableDs.supplierSiteId = record ? record.supplierSiteId : undefined;
    }
  };

  /**
   *  标题条件渲染
   */
  titleRender = () => {
    const { reverseFlag, approveFlag, updateFlag, readOnly, chargeHeaderId } = this.state;
    if (readOnly) {
      return intl.get(`ssta.costSheet.view.title.costView`).d('费用单查看');
    } else if (Number(updateFlag)) {
      return chargeHeaderId
        ? intl.get(`ssta.costSheet.view.title.costUpdate`).d('编辑费用单')
        : intl.get(`ssta.costSheet.view.title.costCreate`).d('新建费用单');
    } else if (Number(approveFlag)) {
      return intl.get(`ssta.costSheet.view.title.costApprove`).d('费用单审核');
    } else if (Number(reverseFlag)) {
      return intl.get(`ssta.costSheet.view.title.costReverse`).d('费用单冲销');
    }
  };

  headerBtns = () => {
    const {
      camp,
      permsMap,
      chargeStatus,
      updateFlag,
      collaborativeMode,
      approveFlag,
      reverseFlag,
      editFlag,
      loading,
      chargeHeaderId,
      approveMethod,
    } = this.state;
    const { reverseStatus } = this.formDs.current?.toData() || {};
    const update = !(
      this.tableDs.updated.length > 0 ||
      this.tableDs.created.length > 0 ||
      this.formDs.updated.length > 0
    );
    const allBtns = [
      !loading &&
        permsMap.get(`${permPrefix}.update`) &&
        ['NEW', 'RETURNED'].includes(chargeStatus) &&
        camp === 'PURCHASER' &&
        Number(updateFlag) === 0 && {
          name: 'update',
          child: intl.get('ssta.costSheet.view.button.update').d('编辑'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'mode_edit',
            loading,
            onClick: () => this.linkToUpdateDetail(),
          },
        },
      permsMap.get(`${permPrefix}.audit`) &&
        chargeStatus === 'SUBMITTED' &&
        approveMethod === 'FUNCTIONAL' &&
        (collaborativeMode === 'SINGLE' ||
          (collaborativeMode === 'DOUBLE' && camp === 'SUPPLIER')) &&
        Number(approveFlag) === 0 && {
          name: 'approve',
          child: intl.get('ssta.costSheet.view.button.approve').d('审核'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'authorize',
            onClick: this.linkToApproveDetail,
          },
        },
      permsMap.get(`${permPrefix}.completed`) &&
        ['COMPLETED'].includes(chargeStatus) &&
        Number(reverseFlag) === 0 &&
        Number(reverseStatus) !== 1 && {
          name: 'reverse',
          child: intl.get('ssta.costSheet.view.button.reverse').d('冲销'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'test',
            onClick: this.linkToReverseDetail,
          },
        },
      Number(reverseFlag) === 1 &&
        Number(reverseStatus) !== 1 && {
          name: 'writeOff',
          child: intl.get('ssta.costSheet.view.button.reverse').d('冲销'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'test',
            loading,
            onClick: () => this.handleOpr(reverse),
          },
        },
      chargeHeaderId &&
        editFlag &&
        update && {
          name: 'submit',
          child: intl.get('ssta.costSheet.view.button.submit').d('提交'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'check',
            disabled: !editFlag,
            loading,
            onClick: () => this.handleFinishOpr(),
            wait: 1500,
            waitType: 'throttle',
          },
        },
      editFlag && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'save',
          disabled: !editFlag,
          loading,
          onClick: () => this.handleSaveOpr(),
          wait: 1500,
          waitType: 'throttle',
        },
      },
      chargeHeaderId &&
        editFlag && {
          name: 'cancel',
          child: intl.get('ssta.costSheet.view.button.cancel').d('取消'),
          btnProps: {
            className: Styles['ssta-detail-button'],
            icon: 'cancel',
            disabled: !['NEW', 'RETURNED'].includes(chargeStatus),
            loading,
            onClick: () => this.operateBeforeConfirm(cancel),
          },
        },
      Number(approveFlag) === 1 && {
        name: 'approveResolve',
        child: intl.get('ssta.costSheet.view.button.approveResolve').d('确认'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'check',
          loading,
          onClick: () => this.handleOpr(approveResolve, 'CONFIRM'),
        },
      },
      Number(approveFlag) === 1 && {
        name: 'approveReject',
        child: intl.get('ssta.costSheet.view.button.approveReject').d('退回'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'reply',
          loading,
          onClick: () => this.handleOpr(approveReject, 'RETURN'),
        },
      },
      !editFlag && {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet.cost-sheet.ps.detailexport`,
                type: 'button',
              },
            ],
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/charge-headers/detail/export`,
          queryParams: { chargeHeaderId },
        },
      },
      !editFlag && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `srm.settle-account.cost-sheet.cost-sheet.ps.newdetailexport`,
                type: 'button',
              },
            ],
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/charge-headers/detail/export`,
          queryParams: { chargeHeaderId },
          templateCode: 'SSTA_CHARGE_DETAIL_PURCHASER_EXPORT',
        },
      },
      chargeHeaderId && {
        name: 'operationRecord',
        child: intl.get('ssta.costSheet.view.button.operationRecord').d('操作记录'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'operation_service_request',
          loading,
          onClick: () => this.openOprationModal(this.formDs.current, chargeHeaderId),
        },
      },
    ];
    return btnsFormat(allBtns);
  };

  /**
   * 渲染方法
   * @returns Element
   */
  render() {
    const {
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      location: { state },
    } = this.props;
    const {
      lineEdit,
      editFlag,
      chargeHeaderId,
      chargeStatus,
      approveFlag,
      updateFlag,
      readOnly,
      isPub,
    } = this.state;
    if (chargeHeaderId && !this.formDs.current?.get('chargeHeaderId')) return <Spin />;
    const {
      companyId,
      supplierCompanyId,
      currencyCode,
      ouId,
      supplierSiteEnableFlag,
      amountPrecision,
    } = this.formDs.current?.toData() || {};
    const listColumns = [
      {
        name: 'costIdLov',
        width: 120,
        editor: editFlag,
        renderer: ({ record }) => record.toData().costName,
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'chargeLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'chargeName',
        width: 120,
      },
      {
        name: 'netAmount', // 不含税金额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxRateLov',
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ record }) => (record.toData().taxRate === 0 ? '0' : record.toData().taxRate),
      },
      {
        name: 'taxAmount', // 税额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxIncludedAmount', // 含税金额
        width: 120,
        align: 'right',
        editor: editFlag,
        renderer: ({ value }) => {
          return decimalPointAccuracy(value, amountPrecision, {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'pcNumLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'poNumLov',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'lineRemarks',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'treatmentMethod',
        width: 150,
        editor: editFlag,
      },
      !editFlag && {
        name: 'reverseLineNum',
        width: 150,
      },
      !editFlag && {
        name: 'pushSettleStatusMeaning',
        width: 150,
      },
      !editFlag && {
        name: 'pushBackMsg',
        width: 150,
        tooltip: 'overflow',
      },
      !editFlag && {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_charge_line" tablePk={record.get('chargeLineId')} />
        ),
      },
      !editFlag &&
        ['REVERSED', 'COMPLETED'].includes(chargeStatus) && {
          name: 'opr',
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => this.viewExeResult(record)}>
              {intl.get(`ssta.costSheet.view.message.panel.viewexeresult`).d('查看执行情况')}
            </a>
          ),
        },
    ];
    const linkList = [
      {
        key: 'CostSheet-header',
        title: intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息'),
      },
      {
        key: 'CostSheet-tradingPartyInformation',
        title: intl
          .get(`ssta.costSheet.view.message.panel.tradingPartyInformation`)
          .d('交易方信息'),
      },
      {
        key: 'CostSheet-transactionAmountInformation',
        title: intl
          .get(`ssta.costSheet.view.message.panel.transactionAmountInformation`)
          .d('交易金额信息'),
      },
      {
        key: 'CostSheet-transactionDetailInformation',
        title: intl.get(`ssta.costSheet.view.message.panel.transactionDetails`).d('交易明细信息'),
      },
      {
        key: 'CostSheet-othersInf',
        title: intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息'),
      },
      {
        key: 'CostSheet-attachment',
        title: intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件'),
      },
    ];
    if (!chargeHeaderId) {
      linkList.splice(3, 1);
    }

    return (
      <Fragment>
        <Header
          title={this.titleRender()}
          backPath={state?.backPath || '/ssta/cost-sheet/list'}
          onBack={() => {
            if (state?.backPath) {
              this.updateTabLink(state?.backPath.split('?')[1], null);
            }
          }}
        >
          {customizeBtnGroup(
            { code: 'SSTA.COST_SHEET_DETAIL.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <div className={Styles['ssta-detail-content']} id="ssta-detail-content-CostSheet">
          <Content>
            <h3 className="ssta-form-title" id="CostSheet-header">
              {intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
            </h3>
            {customizeForm(
              { code: 'SSTA.COST_SHEET_DETAIL.BASIC', readOnly },
              <Form
                columns={3}
                useColon={false}
                dataSet={this.formDs}
                labelLayout={editFlag ? 'float' : 'vertical'}
              >
                <FormItem name="chargeNum" disabled={editFlag} />
                <FormItem name="chargeStatus" disabled={editFlag} />
                <FormItem name="createdByName" disabled={editFlag} />
                <FormItem name="creationDate" disabled={editFlag} />
                <FormItem name="chargeHeaderSourceMeaning" disabled={editFlag} />
                <FormItem name="reverseStatus" disabled={editFlag} />
                <FormItem name="reverseNum" disabled={editFlag} />
              </Form>
            )}
          </Content>
          <Content>
            <h3 className="ssta-form-title">
              {intl.get(`ssta.costSheet.view.message.panel.tradingInformation`).d('交易信息')}
            </h3>
            <Card
              bordered={false}
              id="CostSheet-tradingPartyInformation"
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.costSheet.view.message.panel.tradingPartyInformation`)
                .d('交易方信息')}
            >
              {customizeForm(
                { code: 'SSTA.COST_SHEET_DETAIL.TRADINGPARTY' },
                <Form
                  columns={3}
                  useColon={false}
                  dataSet={this.formDs}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                >
                  <FormItem name="companyNum" disabled={editFlag} />
                  <FormItem
                    name="companLov"
                    editor="lov"
                    disabled={chargeHeaderId}
                    editable={editFlag}
                    onClick={() => {
                      this.formDs.current.set({
                        ouNameLov: null,
                        supplierCompanyLov: null,
                      });
                    }}
                  />
                  <FormItem
                    name="currencyLov"
                    editor="lov"
                    disabled={chargeHeaderId}
                    editable={editFlag}
                  />
                  <FormItem name="displaySupplierNum" disabled={editFlag} />
                  <FormItem
                    name="supplierCompanyLov"
                    editor="lov"
                    disabled={chargeHeaderId}
                    editable={editFlag}
                  />
                  <FormItem
                    name="ouNameLov"
                    editor="lov"
                    disabled={chargeHeaderId}
                    editable={editFlag}
                  />

                  {supplierSiteEnableFlag === 1 && (
                    <FormItem
                      name="supplierSiteLov"
                      editor="lov"
                      disabled={!editFlag}
                      editable={editFlag}
                      onChange={this.supplierSiteChange}
                    />
                  )}
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              id="CostSheet-transactionAmountInformation"
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.costSheet.view.message.panel.transactionAmountInformation`)
                .d('交易金额信息')}
            >
              {customizeForm(
                { code: 'SSTA.COST_SHEET_DETAIL.TRANSACTIONAMOUNT', readOnly },
                <Form
                  dataSet={this.formDs}
                  columns={3}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                  useColon={false}
                >
                  <FormItem
                    name="netAmount"
                    disabled={editFlag}
                    renderer={({ value, record }) => {
                      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                        repair: true,
                        check: true,
                      });
                    }}
                  />
                  <FormItem
                    name="taxAmount"
                    disabled={editFlag}
                    renderer={({ value, record }) => {
                      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                        repair: true,
                        check: true,
                      });
                    }}
                  />
                  <FormItem
                    name="taxIncludedAmount"
                    disabled={editFlag}
                    renderer={({ value, record }) => {
                      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                        repair: true,
                        check: true,
                      });
                    }}
                  />
                </Form>
              )}
            </Card>
            {chargeHeaderId && (
              <Card
                bordered={false}
                id="CostSheet-transactionDetailInformation"
                className={DETAIL_CARD_CLASSNAME}
                title={intl
                  .get(`ssta.costSheet.view.message.panel.transactionDetails`)
                  .d('交易明细信息')}
              >
                {customizeTable(
                  {
                    code: 'SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL',
                    readOnly: readOnly && !lineEdit,
                  },
                  <SearchBarTable
                    searchCode="SSTA.COST_SHEET_DETAIL.TRANSACTION_DETAIL_SEARCH"
                    columns={listColumns}
                    dataSet={this.tableDs}
                    queryFieldsLimit={3}
                    buttons={this.getTableButtons()}
                    selectionMode={editFlag ? 'rowbox' : 'click'}
                    searchBarConfig={{
                      closeFilterSelector: true,
                      onQuery: ({ params }) => {
                        this.tableDs.queryDataSet.loadData([{ ...params, chargeHeaderId }]);
                        this.tableDs.query();
                      },
                      fieldProps: {
                        chargeCode: { lovPara: { tenantId } },
                        poNum: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                            ouId,
                          },
                        },
                        pcNum: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                            ouId,
                          },
                        },
                        taxCode: {
                          lovPara: {
                            companyId,
                            supplierCompanyId,
                            source: 'EXPENSE',
                          },
                        },
                        costId: {
                          lovPara: {
                            tenantId,
                            currencyCode,
                            companyId,
                            supplierCompanyId,
                          },
                        },
                      },
                    }}
                  />
                )}
              </Card>
            )}
          </Content>
          <Content>
            <h3 className="ssta-form-title" id="CostSheet-othersInf">
              {intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
            </h3>
            {customizeForm(
              { code: 'SSTA.COST_SHEET_DETAIL.OTHERS', readOnly },

              <Form
                dataSet={this.formDs}
                columns={3}
                useColon={false}
                labelLayout={editFlag ? 'float' : 'vertical'}
              >
                <FormItem
                  newLine
                  colSpan={2}
                  name="remarks"
                  editor="textarea"
                  resize="both"
                  editable={editFlag}
                />
                {!['NEW', 'UPDATE'].includes(chargeStatus) && !Number(approveFlag) && (
                  <FormItem
                    newLine
                    name="approvalOpinions"
                    editor="textarea"
                    resize="both"
                    editable={
                      Number(approveFlag) || (Number(updateFlag) && chargeStatus === 'RETURNED')
                    }
                    disabled={Number(updateFlag)}
                  />
                )}
              </Form>
            )}
            {isPub !== -1 &&
              customizeForm(
                { code: 'SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW', readOnly: isPub === -1 },
                <Form
                  dataSet={this.formDs}
                  columns={3}
                  style={{ marginTop: 10 }}
                  useColon={false}
                  labelLayout={isPub === 0 ? 'float' : 'vertical'}
                />
              )}
          </Content>
          <Content wrapperClassName="ssta-last-page-content-wrapper">
            <h3 className="ssta-form-title" id="CostSheet-attachment">
              {intl.get(`ssta.costSheet.view.message.panel.attachment`).d('附件')}
            </h3>
            {customizeForm(
              {
                code: 'SSTA.COST_SHEET_DETAIL.ENCLOSURE',
              },
              <Form
                dataSet={this.formDs}
                columns={3}
                useColon={false}
                labelLayout={editFlag ? 'float' : 'vertical'}
                className="ssta-form-form"
              >
                <Attachment
                  name="chargeUuid"
                  showHistory={!editFlag}
                  labelLayout="float"
                  readOnly={!editFlag}
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                  bucketDirectory="ssta-file-bucket"
                />
              </Form>
            )}
          </Content>
          <FixedAnchor linkList={linkList} className="ssta-detail-content-CostSheet" />
        </div>
      </Fragment>
    );
  }
}
