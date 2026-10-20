import React from 'react';
import { isArray, isNil, sortBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentRole } from 'utils/utils';
import getPermissions from './getPermissions';

const currentRole = getCurrentRole();
export default class Permission extends React.Component {
  codeSet = new Set();

  state = {
    keyList: [],
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    this.check();
  }

  componentWillUnmount() {
    this.codeSet.clear();
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  @Bind()
  async check() {
    if (!this.props.children) return;
    const {
      onCallback = () => {},
      children: { props: refProps = {} },
    } = this.props;
    // if(refProps.children&&)
    const custCode = refProps.children?.props?.options?.code;
    const refChildren = refProps.children?.props?.component?.props?.children;
    const custConfig = refProps?.value?.custConfig || {};
    let cuzActiveKey;
    const keyList = [];
    const refChildrenArr = isArray(refChildren) ? refChildren : [refChildren];

    let dataMap = [];

    refChildrenArr.forEach((item) => {
      if (item) {
        const { permissionCodeList, children: sunChildren = {} } = item ? item.props : {};
        this.bacthAddCode(permissionCodeList);

        if (isArray(sunChildren)) {
          sunChildren.forEach((e) => {
            if (e?.props?.permissionCodeList) {
              const sunChildrenPermissionList = e.props.permissionCodeList;
              this.bacthAddCode(
                sunChildrenPermissionList.concat([
                  'hzero.srm.requirement.prm.pr-execution.ps.assigntab',
                  'hzero.srm.requirement.prm.pr-execution.ps.executetab',
                ])
              );
            }
          });
        }
      }
    });

    if (this.codeSet.size > 0) {
      dataMap = await getPermissions([...this.codeSet]);
    }

    refChildrenArr.forEach((item) => {
      if (item) {
        const dataMapList = [...dataMap];
        let executetabFlag = false;
        let assigntabFlag = false;
        dataMapList.forEach(([code, approve]) => {
          if (code === 'hzero.srm.requirement.prm.pr-execution.ps.executetab') {
            executetabFlag = approve;
          }
          if (code === 'hzero.srm.requirement.prm.pr-execution.ps.assigntab') {
            assigntabFlag = approve;
          }
        });
        const { children: sunChildren = {} } = item ? item.props : {};
        if (isArray(sunChildren)) {
          sunChildren.forEach((e) => {
            if (e) {
              const { permissionCodeList } = e.props;
              // 个性化新增tab展示
              if (
                ![
                  'order',
                  'inquiryQuotation',
                  'newBidding',
                  'bidding',
                  'contract',
                  'quoteApproval',
                  'allLine',
                  'assigned',
                  'suspend',
                  'all',
                  'approved',
                ].includes(e.key)
              ) {
                keyList.push(e.key);
              } else if (isNil(permissionCodeList)) {
                if (assigntabFlag && ['assigned', 'suspend', 'all', 'approved'].includes(e.key)) {
                  keyList.push(e.key);
                }
              } else {
                [...dataMap].some(([code, approve]) => {
                  if (
                    permissionCodeList.includes(code) &&
                    approve &&
                    executetabFlag &&
                    [
                      'order',
                      'inquiryQuotation',
                      'newBidding',
                      'bidding',
                      'contract',
                      'quoteApproval',
                      'allLine',
                    ].includes(e.key)
                  ) {
                    keyList.push(e.key);
                    return true;
                  } else {
                    return false;
                  }
                });
              }
            }
          });
        } else {
          const { permissionCodeList } = item.props;
          if (isNil(permissionCodeList)) {
            keyList.push(item.key);
          } else {
            [...dataMap].some(([code, approve]) => {
              if (permissionCodeList.includes(code) && approve) {
                keyList.push(item.key);
                return true;
              } else {
                return false;
              }
            });
          }
        }
      }
    });
    const sortByKeyList = [];
    if (custConfig[custCode]) {
      const { fields } = custConfig[custCode];
      const soutByFields = sortBy(fields, (item) => item.seq);
      soutByFields.forEach((field) => {
        const [visibleLines = []] = field.conditionHeaderDTOs;
        const conditionVisible = [];
        let conditionFlag = true;
        if (visibleLines.lines) {
          visibleLines.lines.forEach((ele) => {
            let checkFlag = true;
            if (ele.sourceType === 'CTX-currentRoleId') {
              if (ele.conExpression === '!=') {
                checkFlag = `${currentRole.id}` !== ele.targetValue;
              } else {
                checkFlag = `${currentRole.id}` === ele.targetValue;
              }
            }
            // conditionVisible.push({ checkFlag, conCode: ele.conCode });
            conditionVisible[ele.conCode] = checkFlag;
          });
        }

        if (conditionVisible.length > 0) {
          let { conExpression } = visibleLines;
          const conNoList = conExpression.match(/\s?\d+\s?/g) || [];

          // eslint-disable-next-line func-names
          conNoList.forEach(function (k) {
            const newKey = k.trim();
            conExpression = conExpression.replace(newKey, conditionVisible[newKey] || false);
          });
          const newConExpression = conExpression.replace(/AND/g, '&&').replace(/OR/g, '||'); // eslint-disable-next-line no-eval

          // eslint-disable-next-line no-eval
          conditionFlag = eval(newConExpression) ? 1 : 0;
        }
        // console.log(field.visible !== 0 && conditionFlag && keyList.includes(field.fieldCode), field.fieldCode, keyList)
        if (field.visible !== 0 && conditionFlag && keyList.includes(field.fieldCode)) {
          sortByKeyList.push(field.fieldCode);
        }
        if (field.defaultActive === 1) {
          cuzActiveKey = field.fieldCode;
        }
      });
    }
    this.setState({ keyList: sortByKeyList });
    onCallback(sortByKeyList, cuzActiveKey || sortByKeyList[0]);
  }

  @Bind()
  bacthAddCode(permissionCodeList) {
    if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
      permissionCodeList.forEach((code) => {
        if (code) {
          this.codeSet.add(code);
        }
      });
    }
  }

  @Bind()
  handleNewChildren() {
    const { children } = this.props;
    if (!children) return null;
    const { props: refProps } = children;
    const refChildren = refProps?.children?.props?.component?.props?.children;
    if (!refChildren) return null;
    const { keyList } = this.state;
    const newChildren = [];

    const refChildrenArr = isArray(refChildren) ? refChildren : [refChildren];

    refChildrenArr.forEach((item) => {
      if (item.props) {
        const { children: sunChildren = {} } = item.props;
        if (isArray(sunChildren)) {
          const checkChildren = sunChildren.filter((e) => keyList.includes(e.key));
          newChildren.push({ ...item, props: { ...item.props, children: checkChildren } });
        } else {
          newChildren.push(item);
        }
      }
    });

    return newChildren;
  }

  render() {
    // 暂时只适应双层tab
    const { children } = this.props;

    if (!children) return null;
    const { props: refProps = {} } = children;
    const { activeKey, defaultActiveKey } = refProps;
    const { keyList } = this.state;
    const checkChildren = this.handleNewChildren();
    let copyRefProps = null;
    if (refProps.children && refProps?.children?.props?.component?.props?.children) {
      copyRefProps = {
        ...refProps,
        children: {
          ...refProps.children,
          props: {
            ...refProps.children.props,
            component: {
              ...refProps.children.props.component,
              props: {
                ...refProps.children.props.component.props,
                children: checkChildren,
              },
            },
          },
        },
      };
    }
    const newRefProps = {
      ...(copyRefProps || refProps),
      children,
      activeKey: keyList.includes(activeKey) ? activeKey : keyList[0],
      defaultActiveKey: keyList.includes(defaultActiveKey) ? defaultActiveKey : keyList[0],
    };

    return { ...children, props: newRefProps };
  }
}
