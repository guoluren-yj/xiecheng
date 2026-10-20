import React from 'react';
import { Modal, DataSet, Form, Lov, Menu } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { noop, isFunction } from 'lodash';
import { evaluate } from 'mathjs';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPC } from '_utils/config';
import { releaseFormula } from '@/services/formulaManageService';
import calcFormulaStyles from './Detail/components/CalcFormula/style.less';
import styles from './index.less';


// 渲染状态列
const StatusRender = (status, statusMeaning) => {
    const list = [
        {
            status: ['PENDING', 'EXPANSION'],
            color: 'yellow', // 黄色
        },
        {
            status: ['RELEASED'],
            color: 'green', // 绿色
        },
        {
            status: ['DISABLE'],
            color: 'red', // 红色
        },
        {
            status: ['STANDARD', 'DELETE'],
            color: 'gray', // 灰色
        },
    ];
    const colorConfig = list.find((i) => i.status.includes(status));
    return (
        statusMeaning && (
        <Tag color={colorConfig?.color} style={{ border: 'none' }}>
          {statusMeaning}
        </Tag>
        )
    );
};

// 公式渲染
const FormulaRender = (operationalFormulaName) => {
    // eslint-disable-next-line react/no-danger
    return (
        operationalFormulaName ? (
          <div
            className={calcFormulaStyles.calcFormulaWrapper}
            dangerouslySetInnerHTML={{ __html: operationalFormulaName }}
          />
        ) : '-'
    );
};

const ActionRender = (renderAction) => {
    return (
      <div className={styles['action-wrapper']}>
        {renderAction}
      </div>
    );
};

// 自定义错误消息映射
const getChineseErrorMessage = (error) => {
    // const errorMessages = {
    //     '': '未定义的符号',
    //     'Division by zero': '除零错误',
    //     // 添加其他错误映射...
    // };
    const errorMessage = error.message.replace(/Undefined symbol/g, '未定义的符号');
    return errorMessage || '未知错误';
};

// 校验公式
const formulaVerify = (code = '') => {
    // 使用正则解析字符串 并得到有多少个${xxx}
    const pattern = /\$\{(.*?)\}/g;
    // 解析变量，替换a，有缺陷
    let _newCode = code.replace(pattern, 'a');
    // 替换原公式
    _newCode = _newCode.replace(/originFormula/g, 'a');
    _newCode = _newCode.replace(/ROUNDDOWN/g, 'ROUND');
    _newCode = _newCode.replace(/DIV/g, 'MAX'); // 这里用max返回一个永久成立的表达式，因为math库不支持div的3个入参格式，具体执行校验逻辑交给后端
    try {
        evaluate(_newCode.toLowerCase(), { a: '1' });
    } catch (error) {
        return error.message;
        return getChineseErrorMessage(error);
    }
    return false;
};

// 创建不可编辑变量块，将对应code传入div id中
const createFrag = (content, isFixed) => {
    const el = document.createElement('div'); // 创建一个空的div外壳
    const { dtoCode, langStr } = content;
    if (isFixed) {
        el.contentEditable = false;
        // 用id存储对应的code，方便后续转换
        el.id = dtoCode;
        el.className = calcFormulaStyles.calcFormula;
        el.innerHTML = langStr; // 设置div内容为我们想要插入的内容。
    } else {
        el.style.display = 'inline-block';
        el.innerHTML = dtoCode; // 设置div内容为code,主要为函数
    }
    const frag = document.createDocumentFragment(); // 创建一个空白的文档片段，便于之后插入dom树
    const lastNode = frag.appendChild(el);
    return { frag, lastNode };
};

// 将内容content插入公式框光标指定出
const pasteHtmlAtCaret = (content, _currDom, _currRange, isFixed) => {
    const range = document.createRange();
    const sel = window.getSelection();
    const {
        commonAncestorContainer: { parentNode },
    } = _currRange;
    const { contentEditable = true } = parentNode;
    const { startContainer, startOffset } = _currRange;
    // 如果光标位置在不可编辑的标签里
    if (contentEditable === 'false') {
        range.setStartAfter(parentNode); // 则设置光标位置为插标签的末尾
    } else {
        range.setStart(startContainer, startOffset);
        range.setEnd(startContainer, startOffset);
    }
    const { frag, lastNode } = createFrag(content, isFixed);
    range.insertNode(frag);
    _currDom.focus();

    const contentRange = range.cloneRange(); // 克隆选区
    contentRange.setStartAfter(lastNode); // 设置光标位置为插入内容的末尾
    contentRange.collapse(true); // 移动光标位置到末尾
    sel.removeAllRanges(); // 移出所有选区
    sel.addRange(contentRange); // 添加修改后的选区
};

// 自动聚焦到指定区域末尾
const autoFocusEnd = (_currDom) => {
    _currDom.focus();
    if (window.getSelection) {
        // ie11 10 9 ff safari
        const selection = window.getSelection(); // 创建range
        selection.selectAllChildren(_currDom); // range 选择box2下所有子内容
        selection.collapseToEnd(); // 光标移至最后
    } else if (document.selection) {
        // ie10 9 8 7 6 5
        const range = document.selection.createRange(); // 创建选择对象
        range.collapse(false); // 光标移至最后
        range.select();
    }
};

// 批量校验数据
const batchValidateData = async (dataSetList = []) => {
    const validateRes = await Promise.all(dataSetList.map((ds) => ds.validate()));
    if (validateRes.some((item) => !item)) return false;
    return true;
};

// 预发布并调价,处理发布并调价所需参数
// const preReleaseAndAdjust = (record, afterRelease = noop) => {
//     const onOk = async (formData) => {
//         const params = { ...record, ...formData };
//         const result = await releaseOrAdjust(params, afterRelease, 'releaseAndAdjust');
//         return result;
//     };
//     const { formulaId } = record;
//     const modalProps = {
//         onOk,
//         formulaId,
//         okText: intl.get(`spc.formulaManage.button.title.releaseAndAdjust`).d('发布并调价'),
//     };
//     openChooseItemBom(modalProps);
// };

// 发布
const onRelease = async (record, afterRelease = noop, beforeRelease) => {
    const recordData = record?.toData()||{};
    // 公式调价
       // if (record?.get('formulaTypeCode') === 'FORMULA_ADJUSTMENT') {
        // Modal.confirm({
        //     title: intl.get('hzero.common.message.confirm.title').d('提示'),
        //     children: intl
        //         .get('spc.formulaManage.view.title.releaseAndAdjust')
        //         .d('发布是否同步生成调价单'),
        //     okText: intl.get('spc.formulaManage.button.title.onlyRelease').d('仅发布'),
        //     onOk: async () => {
        //         await releaseOrAdjust(recordData, afterRelease);
        //     },
        //     okProps: {
        //         color: 'default',
        //     },
        //     footer: (okBtn, cancelBtn, modal) => {
        //         return (
        //           <>
        //             {cancelBtn}
        //             {okBtn}
        //             <Button
        //               color="primary"
        //               onClick={async () => {
        //                         if (isFunction(beforeRelease)) {
        //                             const res = await beforeRelease();
        //                             if (!res) {
        //                                 return false;
        //                             }
        //                         }
        //                         preReleaseAndAdjust(recordData, () => {
        //                             afterRelease();
        //                             modal.close();
        //                         });
        //                     }
        //                     }
        //             >
        //               {intl.get(`spc.formulaManage.button.title.releaseAndAdjust`).d('发布并调价')}
        //             </Button>
        //           </>
        //         );
        //     },
        // });
    // 父状态为已禁用
    if (recordData.parentStatus === 'DISABLE') {
        disabledRelease(() => releaseOrAdjust(recordData, afterRelease));
    } else {
        await releaseOrAdjust(recordData, afterRelease);
    }
};

// 父状态禁用状态下发布
const disabledRelease=(onOk)=>{
    Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
            .get('spc.formulaManage.view.title.disabledRelease')
            .d('当前结构为禁用状态，发布后策略会变更为已发布状态，确认发布新版本吗？'),
        onOk: async () => {
            await onOk();
        },
    });
};

// 发布或者调价，默认发布
const releaseOrAdjust = async (data, afterRelease, type = 'release') => {
    const res = await releaseFormula([data], type);
    if (getResponse(res)) {
        notification.success();
        if (isFunction(afterRelease)) {
            afterRelease();
        }
    } else {
        return false;
    }
};

// 选择物料弹窗，用于发起调价单
const openChooseItemBom = (props) => {
    const { formulaId, onOk, ...otherProps } = props;
    const formDS = new DataSet({
        autoCreate: true,
        fields: [
            {
                name: 'bomViewCodeList',
                type: 'object',
                label: intl.get(`spc.formulaManage.model.bomViewId`).d('物料BOM名称'),
                lovCode: 'SSRC.PRICE_FORMULA_BOM_VIEW',
                multiple: true,
                required: true,
                lovPara: {
                    formulaId,
                    effectiveFlag: 1,
                },
                transformRequest: (value) => {
                    return value && value.map(item => item.bomViewCode);
                },
                lovQueryAxiosConfig: (code, config, { data, params }) => {
                    return {
                        url: `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-formula-bom-rels/list`,
                        method: 'POST',
                        data: {
                            ...data,
                            ...params,
                        },
                    };
                },
            },
        ],
    });
    Modal.open({
        title: intl.get('spc.formulaManage.view.title.chooseItemBom').d('选择物料BOM'),
        destroyOnClose: true,
        style: { width: '380px' },
        drawer: true,
        closable: true,
        children: (
          <Form labelLayout="float" columns={1} dataSet={formDS}>
            <Lov name="bomViewCodeList" />
          </Form>
        ),
        onOk: async () => {
            const validateFlag = await formDS.validate();
            if (!validateFlag) return false;
            if (isFunction(onOk)) {
                const formData = formDS?.current?.toData();
                return onOk(formData);
            }
        },
        ...otherProps,
    });
};

// 格式化数状结构数据
const formatTreeData = (data, primaryKey, statusKey) => {
    let returnData = '';
    try {
        const jsonData = JSON.parse(data);
        const content = jsonData?.content || [];
        const data2 = content.map((item) => {
            return {
                ...item,
                expand: false,
            };
        });
        const newContent = data2;
        content.forEach((item) => {
            const { childrenDTO } = item;
            if (childrenDTO) {
                const obj = {
                    ...childrenDTO[0],
                    parentId: item[primaryKey],
                    parentStatus: item[statusKey],
                    expand: true,
                };
                newContent.push(obj);
            }
        });
        jsonData.content = newContent;
        returnData = jsonData;
    } catch (error) {
        returnData = data;
    }
    return returnData;
};

const renderHistoryVersion = (versionList, viewHistory) => {
    return (
      <div className={styles['history-wrapper']}>
        <Menu>
          {versionList.map((item) => {
                    const { formulaId, versionNum, creationRealName, creationDate } = item;
                    return (
                      <Menu.Item onClick={() => viewHistory(item)} key={formulaId}>
                        {/* <div className={styles['history-wrapper']}> */}
                        <div className={styles['history-version']}>
                          {`${intl.get('spc.formulaManage.model.formulaManage.version').d('版本')}v${versionNum}`}
                        </div>
                        <div className={styles['history-creation']}>
                          <span style={{ paddingRight: '8px' }}>{creationRealName}</span>
                          {creationDate}
                        </div>
                        {/* </div> */}

                      </Menu.Item>
                    );
                })
                }
        </Menu>
      </div>
    );
};


export {
    StatusRender,
    FormulaRender,
    ActionRender,
    formulaVerify,
    pasteHtmlAtCaret,
    autoFocusEnd,
    batchValidateData,
    onRelease,
    releaseOrAdjust,
    openChooseItemBom,
    formatTreeData,
    renderHistoryVersion,
    disabledRelease,
};
