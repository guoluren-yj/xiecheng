/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import {
  Table,
  Radio,
  Row,
  Col,
  Button,
  TextArea,
  Tooltip,
  CheckBox,
  Modal,
  // Lov,
} from 'choerodon-ui/pro';
import { Icon, notification } from 'choerodon-ui';
import CommonNotification from 'utils/notification';
// import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse, judgeUSCCdoeNull } from '@/utils/utils';

import {
  fetchMatchBusiness,
  fetchAddedCount,
  fetchAddBusiness,
} from '@/services/riskControl/monitorManageService';

// import { ReactExportButton } from './ReactExportButton';
import QueryBarMore from './QueryBarMore';
import './index.less';

const noResult = require('@/assets/noResult.svg');

let checkedList = [];
let selectList = []; // 缓存选择的数据
let inputCompany = '';
// const { Column } = Table;

const tenantId = getCurrentOrganizationId();
// const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/add-monitor-export`;
const { id: userId, realName, loginName } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};
const param = {
  userName: realName,
  loginName,
};

const BusinessAddModal = (props) => {
  const {
    businessListDS,
    // addedListDS,
    onAddBusiness = () => {},
    resultDetailDs,
    pkgType,
    domesticForeignRelation,
  } = props;

  const [radioValue, setRadioValue] = useState('A');
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showAlertMsg, setShowAlert] = useState(false);
  const [okLoading, setOkLoading] = useState(false);
  const [amountFlag, setAmountFlag] = useState('added');
  const [isCheckAll, setCheckAll] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    businessListDS.addEventListener('batchSelect', selectEvent);
    businessListDS.addEventListener('batchUnSelect', unselectEvent);
    businessListDS.addEventListener('load', handleLoadEvent);
    businessListDS.setQueryParameter('pkgType', pkgType);
    if (pkgType !== 'MONITOR_BUSINESS_PKG') {
      businessListDS.setQueryParameter(
        'domesticForeignRelation',
        domesticForeignRelation === 'DOMESTIC' ? 1 : 0
      );
    } else {
      businessListDS.setQueryParameter('domesticForeignRelation', '');
    }
    // addedListDS.addEventListener('batchSelect', selectEvent);
    // addedListDS.addEventListener('batchUnSelect', unselectEvent);
    // addedListDS.addEventListener('load', handleLoadEvent);
    // addedListDS.setQueryParameter('pkgType', pkgType);
    resultDetailDs.loadData([]);

    fetchAddedCount({
      dataPacket: pkgType,
    }).then((res) => {
      if (getResponse(res)) {
        // 额度已用完,查询已添加的列表
        if (res && res.canUseQuantity === res.usedQuantity) {
          setAmountFlag('added');
          setShowAlert(true);
          setRefresh(true);
          // addedListDS.query();
          businessListDS.query();
        } else {
          setAmountFlag('business');
          businessListDS.query();
        }
      }
    });

    return () => handleReset();
  }, []);

  useEffect(() => {
    const str1 =
      radioValue === 'C'
        ? intl
            .get('sdat.monitorBusiness.view.message.addBusinessStr2')
            .d(
              '请批量输入平台企业名称，仅支持精确匹配，系统将自动匹配平台内企业;多个企业请换行输入；'
            )
        : intl
            .get('sdat.monitorBusiness.view.message.addBusinessStr1')
            .d('请批量输入企业名称或简称查询，系统将自动匹配对应企业；多个企业请换行输入');
    const str2 = intl.get('sdat.monitorBusiness.view.message.eg').d('例:');
    const str3 = intl
      .get('sdat.monitorBusiness.view.message.zhenyun')
      .d('上海甄云信息科技有限公司');
    const str4 = intl
      .get('sdat.monitorBusiness.view.message.hand')
      .d('上海汉得信息技术股份有限公司');
    const str5 = radioValue === 'C' ? `\n${intl.get('sdat.monitorBusiness.view.message.addedBusiness').d('已添加监控的平台企业不会再显示在匹配结果中；')}` : '';

    const placeHolder = `${str1}${str5}\n\n${str2} \n${str3}\n${str4}\n`;

    const dom = document.getElementById('monitor-business-textarea-left');

    if (dom) {
      dom.setAttribute('placeholder', placeHolder);
    }
  }, [radioValue]);

  const handleReset = () => {
    businessListDS.removeEventListener('batchSelect', selectEvent);
    businessListDS.removeEventListener('batchUnSelect', unselectEvent);
    businessListDS.removeEventListener('load', handleLoadEvent);
    // addedListDS.removeEventListener('batchSelect', selectEvent);
    // addedListDS.removeEventListener('batchUnSelect', unselectEvent);
    // addedListDS.removeEventListener('load', handleLoadEvent);
    businessListDS.data = [];
    // addedListDS.data = [];
    businessListDS.reset();
    businessListDS.queryDataSet.reset();
    businessListDS.setQueryParameter('supplierCompanyNameList', undefined);
    // addedListDS.reset();
    selectList = [];
    checkedList = [];
    setMatchList([]);
    resultDetailDs.loadData([]);
    inputCompany = '';
  };

  // 监听勾选事件（表格）
  const selectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    records.forEach((rec) => {
      if (count < 20) {
        // 一定要避免重复添加，先检查一遍是否已经添加过该项
        let pointerIndex;
        // 拿到当前对象在selectList里的索引
        // selectList.forEach((item, index) => {
        //   if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
        //     pointerIndex = index;
        //   }
        // });
        // 移除，splice方法改变原数组
        // eslint-disable-next-line eqeqeq
        if (pointerIndex == undefined) {
          selectList.push(rec.toData());
          count++;
        }
      } else {
        // 总数达到20
        // 则多余的取消勾选
        // 取消勾选前，先检查一遍是否已经添加过，如果添加过一定切记不能取消
        let pointerIndex;
        // 拿到当前对象在selectList里的索引
        selectList.forEach((item, index) => {
          if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
            pointerIndex = index;
          }
        });
        // eslint-disable-next-line eqeqeq
        if (pointerIndex == undefined) {
          dataSet.unSelect(rec);
        }
      }
    });

    // 如果总数达到20，然后禁用没有被勾选的项
    dataSet.forEach((rec) => {
      const unifiedSocialCode = rec.get('unifiedSocialCode');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听取消勾选事件（表格）
  const unselectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    // 把取消选择的对象从selectList移除
    records.forEach((rec) => {
      let pointerIndex;
      // 拿到当前对象在selectList里的索引
      selectList.forEach((item, index) => {
        if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
          pointerIndex = index;
        }
      });
      // 移除，splice方法改变原数组
      // eslint-disable-next-line eqeqeq
      if (pointerIndex != undefined) {
        selectList.splice(pointerIndex, 1);
        count--;
      }
    });

    // 如果总数达到20，然后禁用没有被勾选的项
    dataSet.forEach((rec) => {
      const unifiedSocialCode = rec.get('unifiedSocialCode');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听处理数据载入（平台企业表格）（防止第一页已选满20后第二页还可以选）
  const handleLoadEvent = ({ dataSet }) => {
    if (selectList.length === 20) {
      dataSet.forEach((rec) => {
        const unifiedSocialCode = rec.get('unifiedSocialCode');
        // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
        if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
          rec.selectable = !(selectList.length === 20);
        }
      });
    } else {
      // 如果未满20条，那么数据都应该可选
      dataSet.forEach((rec) => {
        rec.selectable = true;
      });
    }
  };

  const columns = (type) => {
    return [
      type !== 'added' && { name: 'supplierCompanyNum' },
      { name: 'supplierCompanyName' },
      { name: 'unifiedSocialCode' },
    ].filter(Boolean);
  };

  /**
   * 删除列表中的某条数据
   */
  const handleRemoveItem = (item) => {
    if (amountFlag === 'added') {
      // addedListDS.unSelect(item);
      // addedListDS.forEach(rcd => {
      //   if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
      //     addedListDS.unSelect(rcd);
      //   }
      // });
      // // 再遍历一遍缓存的数据
      // addedListDS.cachedRecords.forEach(rcd => {
      //   if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
      //     // 取消这个record的勾选
      //     rcd.isSelected = false;
      //     // 还需要去掉selectedList里的这条数据
      //     const inde = selectList.findIndex(
      //       i => i.unifiedSocialCode === rcd.get('unifiedSocialCode')
      //     );
      //     selectList.splice(inde, 1);
      //   }
      // });
      // handleLoadEvent({ dataSet: addedListDS });
    } else {
      businessListDS.unSelect(item);
      businessListDS.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          businessListDS.unSelect(rcd);
        }
      });
      // 再遍历一遍缓存的数据
      businessListDS.cachedRecords.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          // 取消这个record的勾选
          rcd.isSelected = false;
          // 还需要去掉selectedList里的这条数据
          const inde = selectList.findIndex(
            (i) => i.unifiedSocialCode === rcd.get('unifiedSocialCode')
          );
          selectList.splice(inde, 1);
        }
      });
      handleLoadEvent({ dataSet: businessListDS });
    }

    setRefresh(true);
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (!selectList.length) {
      return (
        <div
          style={{
            lineHeight: '38px',
            color: 'rgba(0, 0, 0, 0.45)',
            textAlign: 'center',
            paddingTop: '0.2rem',
          }}
        >
          {intl.get('sdat.monitorBusiness.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      return (
        <>
          <div
            style={{
              lineHeight: '38px',
              color: 'rgba(0, 0, 0, 0.45)',
              paddingLeft: '16px',
              position: 'sticky',
              top: '0',
              backgroundColor: '#fbfbfc',
              paddingTop: '0.2rem',
            }}
          >
            {intl.get('sdat.monitorBusiness.view.message.haveChecked').d('已勾选')}
            <a style={{ cursor: 'pointer', margin: '0 4px' }}>{selectList.length}</a>
            {intl.get('sdat.monitorBusiness.view.message.items').d('条数据')}
          </div>
          {selectList.map((item) => {
            return (
              <>
                <div className="select-item-row">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '230px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.supplierCompanyNum}
                  </span>
                  <Icon
                    type="cancel"
                    style={{
                      fontSize: '16px',
                      color: 'rgb(140, 140, 140)',
                      float: 'right',
                      marginTop: '10px',
                      marginRight: '16px',
                    }}
                    onClick={() => handleRemoveItem(item)}
                  />
                </div>
              </>
            );
          })}
        </>
      );
    }
  };

  const renderMiddleDom = () => {
    return showAlertMsg
      ? [
          // eslint-disable-next-line react/jsx-indent
          <div
            style={{
              background: 'rgba(25,132,247,0.10)',
              color: '#1984F7',
              lineHeight: '36px',
              height: '36px',
              marginBottom: '-0.1rem',
              width: '660px',
            }}
          >
            <span
              style={{ display: 'inline-block', width: '30px', textAlign: 'center' }}
              className="business-add-modal-alert-msg"
            >
              <Icon type="help" />
            </span>
            <div style={{ display: 'inline-block' }}>
              {intl
                .get('sdat.monitorBusiness.view.message.limitReached')
                .d(
                  '您所在的企业可添加监控数量已达上限，您还可以添加其他监控人员已添加监控的供应商'
                )}
            </div>
            <span style={{ float: 'right', marginRight: '10px' }}>
              <Icon onClick={() => setShowAlert(false)} type="close" />
            </span>
          </div>,
        ]
      : null;
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const tableProps = {
    dataSet: businessListDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    border: false,
    buttons: renderMiddleDom(),
    columns: columns(''),
    queryBar: renderQueryBar,
    // queryBarProps: {
    //   formProps: { labelLayout: 'float', style: { padding: '1px 0 0 8px' } },
    // },
    autoHeight: { type: 'maxHeight', diff: 40 },
  };

  // const tableAddedProps = {
  //   dataSet: addedListDS,
  //   queryFieldsLimit: 2,
  //   highLightRow: false,
  //   border: false,
  //   buttons: renderMiddleDom(),
  //   columns: columns('added'),
  //   // queryBar: 'professionalBar',
  //   queryBar: renderQueryBar,
  //   // queryBarProps: {
  //   //   formProps: { labelLayout: 'float', style: { padding: '1px 0 0 8px' } },
  //   // },
  //   autoHeight: { type: 'maxHeight', diff: 40 },
  // };

  const handleChange = (value) => {
    setRadioValue(value);
    handleReset();
    if (value === 'A') {
      businessListDS.query();
    }
  };

  const handleInputCompany = (e) => {
    inputCompany = e.target.value.trim();
    setRefresh(true);
  };

  const addBusiness = () => {
    const list = [];

    if (radioValue === 'A') {
      if (selectList && selectList.length) {
        selectList.forEach((item) => {
          list.push({
            ...item,
            erpFlag: 0,
            enterpriseCode: item.unifiedSocialCode || item.socialCode || item.creditCode,
            enterpriseName: item.name || item.supplierCompanyName,
            ...passParams,
          });
        });
      }
    }

    if (['B', 'C'].includes(radioValue)) {
      if (matchList.length && checkedList.length) {
        matchList.forEach((item) => {
          checkedList.forEach((item2) => {
            if (item.enterpriseCode === item2) {
              list.push({
                ...item,
                erpFlag: 0,
                ...passParams,
                enterpriseCode:
                  item.enterpriseCode ||
                  item.unifiedSocialCode ||
                  item.socialCode ||
                  item.creditCode,
                enterpriseName: item.name || item.supplierCompanyName,
              });
            }
          });
        });
      }
    }

    if (list.length > 20) {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.exceededLimit')
          .d('选择的数量超出20条限额'),
      });
      return;
    }

    if (list.length) {
      continueAddBusiness(list);
    } else {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.atLeastChoose')
          .d('请至少选择1家企业添加监控'),
      });
    }
  };

  /**
   * 添加企业
   */
  const continueAddBusiness = (codeList = []) => {
    const list = codeList.map((item) => {
      return {
        ...item,
        ...param,
      };
    });

    if (judgeUSCCdoeNull(list)) {
      return; // 如果存在统一社会信用代码为空或重复，不允许添加
    }

    setOkLoading(true);
    fetchAddBusiness({
      enterpriseList: list,
      domesticForeignRelation: domesticForeignRelation === 'DOMESTIC' ? 1 : 0,
      dataPacket: pkgType,
    }).then((res) => {
      setOkLoading(false);
      if (getResponse(res)) {
        const sucMsg = intl.get('sdat.monitorBusiness.view.message.addSucceedCountOrg', {
          name: res?.successList?.length ?? 0,
        });
        const failedMsg = intl.get('sdat.monitorBusiness.view.message.fieldCount', {
          name: res?.failedNameList?.length ?? 0,
        });
        const failMsg = intl.get('sdat.monitorBusiness.view.message.insertFailMsgOrg', {
          name: res?.failedNameList?.length ?? 0,
        });

        if (Object.keys(res).length === 0) {
          CommonNotification.success();
          onAddBusiness();
          handleClose();
          return;
        }

        const successNum = res?.successList?.length ?? 0;
        const failedNum = res?.failedNameList?.length ?? 0;

        const failedNameMsg = res?.failedNameList?.join(',') ?? '';
        const successNameMsg = res?.successList?.map((item) => item.enterpriseName).join(',') ?? '';

        // 全部添加成功，弹窗关闭
        if (successNum && !failedNum) {
          CommonNotification.success();
          onAddBusiness();
          handleClose();
        }
        // 全部添加失败
        else if (!successNum && failedNum) {
          Modal.info({
            title: intl.get('sdat.monitorBusiness.view.message.failInsert').d('添加失败'),
            children: (
              <>
                {failMsg},&nbsp; {failedNameMsg}
              </>
            ),
          });
          return false;
        }
        // 部分添加成功
        else {
          Modal.info({
            title: intl.get('sdat.monitorBusiness.view.message.partlySuccess').d('部分添加成功'),
            children: (
              <>
                {sucMsg}: {successNameMsg};&nbsp; {failedMsg}: {failedNameMsg}
              </>
            ),
            onOk: () => {
              onAddBusiness();
              handleClose();
            },
            onCancel: () => {
              onAddBusiness();
              handleClose();
            },
          });
          return false;
        }

        onAddBusiness();
        handleClose();
      }
    });
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      const socialCode = arr[i].unifiedSocialCode || arr[i].socialCode || arr[i].creditCode;
      if (!obj[socialCode]) {
        result.push(arr[i]);
        obj[socialCode] = true;
      }
    }
    return result;
  };

  /**
   * 查询企业列表
   */
  const handleQueryCompany = async () => {
    const companyList = inputCompany?.trim()?.split(/\n/) ?? [];

    if (companyList.length + matchList.length <= 20) {
      setLoading(true);
      let res = [];

      if (radioValue === 'C') {
        businessListDS.setQueryParameter('supplierCompanyNameList', companyList);
        res = (await businessListDS.query())?.content || [];
      } else {
        res = await fetchMatchBusiness(companyList);
      }

      setLoading(false);
      if (getResponse(res)) {
        if (res.length) {
          setCheckAll(false);
        }
        checkedList = [];
        const pushArr = [...matchList, ...(res || [])].map((item) => {
          return {
            ...item,
            name: radioValue === 'C' ? item.supplierCompanyName : item.name,
            enterpriseCode:
              item.enterpriseCode || item.unifiedSocialCode || item.socialCode || item.creditCode,
          };
        });
        const uniqueData = uniqueList(pushArr);
        if (radioValue === 'C') {
          setMatchList(uniqueData);
          const failedList = companyList.map((name) => {
            const company = uniqueData.find((d) => d.name === name);
            return !company ? name : null;
          })?.filter(Boolean);
          if (companyList.length !== uniqueData.length) {
            notification.info({
              message: intl.get('sdat.monitorBusiness.view.message.querySelectMuchFailed', {
                length: failedList.length,
                failedNameMsg: failedList.map((name) => `【${name}】`).join(','),
              }),
            });
          }
          return;
        }

        const dealSwData = uniqueData.map((item) => {
          const { searchWord } = item;
          // eslint-disable-next-line no-useless-escape
          const reg = /\[?([^\[\]]+)\]?/;
          if (reg.test(searchWord)) {
            return { ...item, searchWord: reg.exec(searchWord)[1] };
          } else return { ...item };
        });
        const failedList = dealSwData.filter((item) => !item?.successFlag);
        const successList = dealSwData.filter((item) => item?.successFlag);
        setMatchList([...successList]);
        inputCompany = '';
        setRefresh(true);
        if (failedList.length) {
          notification.info({
            message: intl.get('sdat.monitorBusiness.view.message.querySelectMuchFailed', {
              length: failedList.length,
              failedNameMsg: failedList.map((item) => `【${item.searchWord}】`).join(','),
            }),
          });
        }
      }
    } else {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.querySelectMuch')
          .d('（待匹配企业总数+已匹配企业数）不得超过20家'),
      });
    }
  };

  /**
   * 切换对应的选择状态
   * @param {*} e
   * @param {*} item
   */
  const handleChangeCheckBox = (e, item) => {
    if (e) {
      checkedList.push(item);
    } else {
      const index = checkedList.indexOf(item);
      checkedList.splice(index, 1);
    }

    setRefresh(true);
  };

  /**
   * 全选操作
   * @param {*} e
   */
  const handleChangeCheckAll = (e) => {
    setCheckAll(e);
    checkedList = []; // 置空
    if (e) {
      // 全选
      matchList.forEach((item) => {
        if (!item.monitorFlag) {
          checkedList.push(item.enterpriseCode);
        }
      });
    }
    setRefresh(true);
  };

  /**
   * 取消选择企业
   */
  const handleRemoveBusiness = (item) => {
    const list = [].concat(matchList);
    if (list.length) {
      list.forEach((result, index) => {
        if (result.enterpriseCode === item.enterpriseCode) {
          list.splice(index, 1);
        }
      });
    }

    setMatchList(list);
    inputCompany = `${inputCompany}${item?.searchWord ?? ''}\n`;
    setRefresh(true);
  };

  /**
   * 渲染匹配结果列表
   */
  const drowSelectList = () => {
    return (matchList || []).map((item) => {
      return (
        <div style={{ marginBottom: '16px' }} key={item.enterpriseCode}>
          <CheckBox
            key={item.enterpriseCode}
            value={item.enterpriseCode}
            checked={checkedList.indexOf(item.enterpriseCode) !== -1}
            disabled={item.monitorFlag}
            onChange={(e) => handleChangeCheckBox(e, item.enterpriseCode)}
          >
            {item.name}
          </CheckBox>
          {item.monitorFlag && (
            <span
              style={{
                color: '#4E5769',
                border: '1px solid rgba(201,205,212,1)',
                borderRadius: '2px',
                padding: '2px 4px',
                background: '#F2F3F5',
              }}
            >
              {intl.get('sdat.monitorBusiness.view.title.hadAdded').d('已添加')}
            </span>
          )}

          <Tooltip
            title={intl.get('sdat.monitorBusiness.view.title.removeResult').d('从结果中移除')}
          >
            <Icon
              type="close"
              style={{ cursor: 'pointer', float: 'right' }}
              onClick={() => handleRemoveBusiness(item)}
            />
          </Tooltip>
        </div>
      );
    });
  };

  const handleClose = () => {
    businessListDS.data = [];
    businessListDS.queryDataSet.data = [];
    // addedListDS.data = [];
    // addedListDS.queryDataSet.data = [];
    businessListDS.reset();
    // addedListDS.reset();
    businessListDS.clearCachedRecords();
    // addedListDS.clearCachedRecords();
    selectList = [];
    checkedList = [];
    inputCompany = '';
    if (props.modal) {
      props.modal.close();
    }
  };

  return (
    <div className="tenant-lov-modal">
      <div style={{ marginBottom: '8px', fontWeight: '500' }}>
        <form>
          <Radio name="radioType" value="A" checked={radioValue === 'A'} onChange={handleChange}>
            {intl.get('sdat.monitorBusiness.view.title.platformBusiness').d('平台企业')}
          </Radio>
          <Radio
            disabled={amountFlag === 'added'}
            name="radioType"
            value="C"
            checked={radioValue === 'C'}
            onChange={handleChange}
            style={{ marginLeft: '16px' }}
          >
            {intl
              .get('sdat.monitorBusiness.view.title.batchAddPlatformBusiness')
              .d('平台企业批量添加')}
          </Radio>
          {pkgType === 'MONITOR_CREDIT_PKG' ? (
            <Radio
              disabled={amountFlag === 'added'}
              name="radioType"
              value="B"
              checked={radioValue === 'B'}
              onChange={handleChange}
              style={{ marginLeft: '16px' }}
            >
              {intl.get('sdat.monitorBusiness.view.title.outsidePlatformBusiness').d('平台外企业')}
            </Radio>
          ) : null}
        </form>
      </div>

      <div>
        {radioValue === 'A' ? (
          <div className="tenant-subscribe-modal-content">
            <div className="tenant-modal-left-table">
              <div className="add-subscribe-modal">
                {amountFlag === 'added' ? (
                  // <Table {...tableAddedProps} />
                  <Table {...tableProps} />
                ) : (
                  <Table {...tableProps} />
                )}
              </div>
            </div>
            <div className="tenant-modal-select-list">{drawSelectItem()}</div>
          </div>
        ) : (
          <Row className="add-business-modal">
            <Col span={11}>
              <div className="add-business-modal-left-panel">
                <div className="add-business-modal-panel-title">
                  {intl.get('sdat.monitorBusiness.view.title.textPasteAdded').d('文本粘贴添加')}
                </div>
                <div
                  style={{ height: 'calc(100vh - 288px)', overflow: 'hidden', overflowY: 'scroll' }}
                >
                  <TextArea
                    id="monitor-business-textarea-left"
                    value={inputCompany}
                    cols={200}
                    autoSize
                    onInput={handleInputCompany}
                  />
                </div>
              </div>
            </Col>
            <Col span={2}>
              <div className="add-business-modal-center-panel">
                <Tooltip
                  title={intl.get('sdat.monitorBusiness.view.title.searchBusiness').d('查询企业')}
                >
                  <Button
                    loading={loading}
                    tooltip="none"
                    color="primary"
                    disabled={!inputCompany}
                    onClick={handleQueryCompany}
                    style={{ height: '48px' }}
                  >
                    {' '}
                    &gt;{' '}
                  </Button>
                </Tooltip>
              </div>
            </Col>
            <Col span={11}>
              <div className="add-business-modal-right-panel">
                <div className="add-business-modal-panel-title">
                  <span>
                    {intl.get('sdat.monitorBusiness.view.title.matchResult').d('匹配结果')}
                  </span>
                  &nbsp;&nbsp;
                  <span>{checkedList?.length ?? 0}/20</span>
                  <span style={{ float: 'right' }}>
                    <CheckBox checked={isCheckAll} onChange={handleChangeCheckAll}>
                      {intl.get('sdat.monitorBusiness.view.button.selectedAll').d('全选')}
                    </CheckBox>
                  </span>
                </div>
                {matchList.length ? (
                  <div className="list-container-box">{drowSelectList()}</div>
                ) : (
                  <div>
                    <div
                      style={{
                        width: '40px',
                        height: '45px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto',
                        marginTop: '200px',
                      }}
                    >
                      <img src={noResult} style={{ width: '38px' }} alt="noResult" />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
                      {intl.get('sdat.monitorBusiness.view.message.notDataFound').d('暂无匹配结果')}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          height: '60px',
          lineHeight: '60px',
          zIndex: 100,
          background: 'transparent',
        }}
      >
        <Button color="primary" loading={okLoading} onClick={addBusiness}>
          {intl.get(`hzero.common.button.ok`).d('确定')}
        </Button>
        <Button onClick={handleClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
      </div>
    </div>
  );
};

export default BusinessAddModal;
