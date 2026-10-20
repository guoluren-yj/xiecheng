/* eslint-disable eqeqeq */
/* eslint-disable no-continue */
import type { ReactNode } from "react";
import React from "react";
import pathToRegexp from "path-to-regexp";
import { connect } from "dva";
import { Modal } from "choerodon-ui/pro";
import { Carousel } from "choerodon-ui";
import Driver from 'driver.js';
import { isEmpty } from 'lodash';
import type DriverElementImpl from "driver.js/src/core/element";
import { getEnvConfig } from 'utils/iocUtils';
import { DriverStepType } from 'driver.js/src/common/constants';
import formatterCollections from '../../utils/intl/formatterCollections';
import intl from '../../utils/intl';
import type { Guide } from './injectGuideList';
import { guideStore, guideGlobalStore, GuideInstance } from './injectGuideList';
import globalGuidesConfig from './globalGuidesConfig';

const LOCAL_STORE_KEY = "GUIDE_VISITED_CACHE";
const LOCAL_GLOBAL_STORE_KEY = "GUIDE_GLOBAL";
const { getStyleProperty } = Driver.utils;

const { BASE_PATH } = getEnvConfig();

@connect(({ user }) => {
  return {
    currentUser: (user || {}).currentUser,
  };
})
class GuideWrapper extends React.PureComponent<any, any> {
  render() {
    const { currentUser } = this.props;
    if (isEmpty(currentUser)) {
      return null;
    }
    return <GuideBase {...this.props} />;
  }
}

@connect(({ routing }) => {
  if (routing && routing.location) return { pathname: routing.location.pathname };
  return {};
})
@formatterCollections({ code: ['srm.common'] })
class GuideBase extends React.PureComponent<any, any> {
  /**
   * 向导组件存取缓存配置均以下标0开始，在打开具体的向导提示时，传入的步骤编号应以1开始计算
   */

  matchGuides: Guide[] = [];

  matchGlobalGuides: Guide[] = [];

  shortOrWeakGuides: Guide[] = [];

  lastPathname?: string;

  runningGuide?: Guide;

  runningCacheKey?: string;

  /** 定时器job id */
  timer?: number;

  /** 强提示向导实例 */
  driver: Driver;

  /** 弱提示和短提示实例组 */
  drivers: { instance: Driver; steps: any[]; currentIndex: number }[] = [];

  localCache?: { [x: string]: { visited: number; version: number; readStepsCount: number[] } };

  currentIndex: number = 0;

  constructor(props) {
    super(props);

    this.localCache = localStorage.getItem(LOCAL_STORE_KEY) as any;
    try {
      const localCache = this.localCache ? JSON.parse(this.localCache as unknown as string) : {};
      // 进行一些历史缓存兼容性处理
      Object.keys(localCache).forEach(key => {
        if (!localCache[key].readStepsCount) localCache[key].readStepsCount = [];
      });
      this.localCache = localCache;
    } catch {
      this.localCache = {};
    }

    GuideInstance.current = this;

    this.driver = new Driver({
      allowClose: false,
      onClose: (ele: DriverElementImpl) => {
        if (!this.runningGuide) return;
        if (ele.stepType === DriverStepType.Short) {
          this.pauseCurrentGuide();
        }
        this.startTimer();
      },
      onNext: () => {
        /** 未知原因导致的undefined，暂时直接返回处理 */
        if (!this.runningGuide) return;
        const guide = this.runningGuide!;
        this.updateLocaleStore();
        if (this.currentIndex >= guide.steps.length - 1) {
          if (guide.optionalSteps) this.pauseCurrentGuide();
          else this.pauseCurrentGuide();
        } else {
          const nextStep = guide.steps[this.currentIndex + 1];
          if (!this.validateDOM(nextStep)) {
            this.pauseCurrentGuide();
          } else {
            this.currentIndex++;
            this.showStrongGuide(guide, this.runningCacheKey!, this.currentIndex);
            return true;
          }
        }
      },
      onPrevious: () => {
        if (this.currentIndex === 0) {
          this.pauseCurrentGuide();
        } else {
          const nextStep = this.runningGuide!.steps[this.currentIndex - 1];
          if (!this.validateDOM(nextStep)) {
            this.pauseCurrentGuide();
          } else {
            this.currentIndex--;
            this.showStrongGuide(this.runningGuide!, this.runningCacheKey!, this.currentIndex);
            return true;
          }
        }
      },
      onSkip: () => {
        if (!this.runningGuide) return;
        this.currentIndex =
          this.runningGuide.steps.length > 0 ? this.runningGuide.steps.length - 1 : 0;
        this.updateLocaleStore();
        this.pauseCurrentGuide();
      },
    });
  }

  componentDidMount() {
    this.updateLocale();
    setTimeout(() => {
      globalGuidesConfig();
      this.refreshMatchGuides();
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    this.updateLocale();
    if (prevProps.pathname && this.props.pathname !== prevProps.pathname) {
      this.refreshMatchGuides();
    }
  }

  componentWillUnmount() {
    GuideInstance.current = null;
  }

  updateLocale() {
    const textOptions = {
      nextBtnText: intl.get('hzero.common.button.next').d('下一步'),
      prevBtnText: intl.get('hzero.common.button.previous').d('上一步'),
      skipText: intl.get('srm.common.btn.skip').d('跳过'),
      knownText: intl.get('srm.common.btn.know').d('知道了'),
    };
    this.driver.changeOptions(textOptions);
    this.drivers.forEach(driverDto => driverDto.instance.changeOptions(textOptions));
  }

  validateDOM(step: any) {
    let ele;
    if (!step) return;
    if (step.beforeCheck) {
      ele = document.querySelector(step.beforeCheck);
      if (!ele) return false;
      while (ele !== document.body) {
        if (
          getStyleProperty(ele, 'display') === 'none' ||
          getStyleProperty(ele, 'visibility') === 'hidden'
        ) { return false; }
        ele = ele.parentElement;
      }
    }
    ele = document.querySelector(step.selector);
    if (!ele) return false;
    while (ele !== document.body) {
      if (
        getStyleProperty(ele, 'display') === 'none' ||
        getStyleProperty(ele, 'visibility') === 'hidden'
      ) { return false; }
      ele = ele.parentElement;
    }
    return true;
  }

  pauseCurrentGuide() {
    this.updateLocaleStore();
    this.runningGuide = undefined;
    this.currentIndex = 0;
    this.startTimer();
  }

  updateLocaleStore() {
    /** 未知原因导致的undefined，暂时直接返回处理 */
    if (!this.runningGuide) return;
    const readStepsCount = (
      (this.localCache![this.runningCacheKey!] || {}).readStepsCount || []
    ).filter(i => i != this.currentIndex);
    readStepsCount.push(this.currentIndex);
    this.localCache![this.runningCacheKey!] = {
      version: this.runningGuide!.version,
      visited: this.currentIndex,
      readStepsCount,
    };
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(this.localCache));
  }

  refreshMatchGuides = () => {
    const { pathname } = window.location;
    this.matchGuides = [];
    const guidesPath = Object.keys(guideStore);
    this.shortOrWeakGuides = [];
    let basePath = BASE_PATH || "";
    if (basePath.endsWith("/")) {
      basePath = basePath.replace(/\/$/, "");
    }
    for (const p of guidesPath) {
      if (pathToRegexp(p.startsWith(basePath) ? p : `${basePath}${p}`)!.test(pathname)) {
        /**
         * 按照有无优先级对向导进行区分
         * 并按照优先级排序，数字越大优先级越高
         */
        const hasPriorityGuides: Guide[] = [];
        const normalGuides: Guide[] = [];
        let updateOverview: Guide[] = [];
        guideStore[p].forEach((guide: Guide) => {
          if (!guide.enable) return;
          if (guide.type === 'overview') {
            updateOverview = [guide];
            return;
          }
          if (['short', 'weak'].includes(guide.type)) {
            // eslint-disable-next-line no-param-reassign
            guide.__path = p;
            this.shortOrWeakGuides.push(guide);
            return;
          }
          if (guide.priority !== undefined) {
            hasPriorityGuides.push(guide);
          } else normalGuides.push(guide);
        });
        hasPriorityGuides.sort((pre, n) => n.priority! - pre.priority!);
        // 过滤掉禁用、执行完成、没有步骤的向导
        this.matchGuides = updateOverview.concat(
          hasPriorityGuides,
          normalGuides.filter(guide => {
            const cacheVisited = this.localCache![p + guide.code] || {
              visited: 0,
              version: 0,
              readStepsCount: 0,
            };
            if (cacheVisited.version !== guide.version) {
              cacheVisited.version = guide.version;
              cacheVisited.visited = 0;
            }
            if (guide.optionalSteps) { return guide.steps.length === cacheVisited.readStepsCount.length; }
            return guide.enable && cacheVisited.visited < guide.steps.length;
          })
        );
        this.lastPathname = p;
        break;
      }
    }
    const hasPriorityGlobalGuides: Guide[] = [];
    const normalGlobalGuides: Guide[] = [];
    let updateGlobalOverview: Guide[] = [];
    guideGlobalStore.forEach((guide: Guide) => {
      if (!guide.enable) return;
      if (guide.type === 'overview') {
        updateGlobalOverview = [guide];
        return;
      }
      if (['short', 'weak'].includes(guide.type)) {
        // eslint-disable-next-line no-param-reassign
        guide.__path = LOCAL_GLOBAL_STORE_KEY;
        this.shortOrWeakGuides.push(guide);
        return;
      }
      if (guide.priority !== undefined) {
        hasPriorityGlobalGuides.push(guide);
      } else normalGlobalGuides.push(guide);
    });
    this.matchGlobalGuides = updateGlobalOverview.concat(
      hasPriorityGlobalGuides,
      normalGlobalGuides.filter(guide => {
        const cacheVisited = this.localCache![LOCAL_GLOBAL_STORE_KEY + guide.code] || {
          visited: 0,
          version: 0,
          readStepsCount: 0,
        };
        if (cacheVisited.version !== guide.version) {
          cacheVisited.version = guide.version;
          cacheVisited.visited = 0;
        }
        if (guide.optionalSteps) return guide.steps.length === cacheVisited.readStepsCount.length;
        return guide.enable && cacheVisited.visited < guide.steps.length;
      })
    );
    this.startTimer();
  };

  clearTimer() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  startTimer() {
    if (this.timer) this.clearTimer();
    this.timer = (setInterval(() => {
      // 防止清除定时器时多执行一次逻辑的可能
      if (!this.timer) return;
      if (!this.runningGuide) {
        let finishedGuideCount = 0;
        let guidesType = -1;
        for (const guides of [this.matchGuides, this.matchGlobalGuides]) {
          guidesType++;
          for (const g of guides) {
            const { code, steps, type, optionalSteps } = g;
            const key = (guidesType === 1 ? LOCAL_GLOBAL_STORE_KEY : this.lastPathname) + code;
            const cacheVisitedInfo = this.localCache![key] || { visited: -1, readStepsCount: [] };
            const currentVisited = cacheVisitedInfo.visited;
            if (!optionalSteps && currentVisited >= steps.length - 1 || (cacheVisitedInfo.readStepsCount || []).length >= steps.length) {
              finishedGuideCount++;
              // eslint-disable-next-line no-continue
              continue;
            }
            let nextVisit = currentVisited + 1;
            if (nextVisit >= steps.length) {
              for (nextVisit = 0; nextVisit < steps.length; nextVisit++) {
                if (cacheVisitedInfo.readStepsCount.indexOf(nextVisit) === -1) break;
              }
            }
            let step = steps[nextVisit];
            if (type === 'overview') {
              this.showOverview(g, key);
              break;
            } else {
              let validateStatus = this.validateDOM(step);
              while (!validateStatus && optionalSteps) {
                nextVisit++;
                if (nextVisit >= steps.length) break;
                if (cacheVisitedInfo.readStepsCount.indexOf(nextVisit) > -1) break;
                step = steps[nextVisit];
                validateStatus = this.validateDOM(step);
              }
              if (!validateStatus) continue;
              this.runningGuide = g;
              this.runningCacheKey = this.lastPathname + this.runningGuide!.code;
              this.currentIndex = nextVisit;
              this.showStrongGuide(g, key, nextVisit, true);
              break;
            }
          }
        }
        if (finishedGuideCount === this.matchGuides.length + this.matchGlobalGuides.length) {
          this.clearTimer();
        }
      } else {
        const { steps, optionalSteps } = this.runningGuide;
        const nextVisit = this.currentIndex + 1;
        if (nextVisit >= steps.length && !optionalSteps) {
          this.pauseCurrentGuide();
          return;
        }
        if (this.validateDOM(this.runningGuide.steps[nextVisit])) {
          this.showStrongGuide(this.runningGuide, this.runningCacheKey!, nextVisit);
        }
      }

      for (const guide of this.shortOrWeakGuides) {
        const key = guide.__path + guide.code;
        const cacheVisitedInfo = this.localCache![key];
        let currentVisited = cacheVisitedInfo && cacheVisitedInfo.visited;
        if (currentVisited === undefined) currentVisited = -1;
        const nextVisit = currentVisited + 1;
        const step = guide.steps[nextVisit];
        if (
          !this.drivers.find(dto => dto.instance.options.uniqueKey === key) && this.validateDOM(step)
        ) {
          this.showShortOrWeak(guide, key, nextVisit);
        }
      }
    }, 300) as unknown) as number;
  }

  showShortOrWeak(guide: Guide, key: string, nextVisit: number) {
    this.drivers.push({
      instance: new Driver({
        uniqueKey: key,
        onClose: () => {
          const readStepsCount = ((this.localCache![this.runningCacheKey!] || {}).readStepsCount || []).filter(i => i != this.currentIndex);
          readStepsCount.push(this.currentIndex);
          this.localCache![key] = {
            version: guide.version,
            visited: nextVisit,
            readStepsCount,
          };
          this.drivers = this.drivers.filter(
            driverDto => driverDto.instance.options.uniqueKey !== key
          );
          localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(this.localCache));
        },
      }),
      steps: guide.steps,
      currentIndex: nextVisit,
    });
    const { selector, title, placement, htmlText, delay: stepDelay, preview } = guide.steps[
      nextVisit
    ];
    this.drivers[this.drivers.length - 1].instance.highlight({
      delay: stepDelay,
      element: selector,
      stepType: guide.type === 'short' ? 0 : 1,
      popover: {
        title,
        description: htmlText || '',
        preview,
        position: placement,
      },
    });
  }

  showStrongGuide(guide: Guide, key: string, nextVisit: number, isTimerFirstActive?: boolean) {
    this.runningGuide = guide;
    this.runningCacheKey = key;
    this.clearTimer();
    const { selector, title, placement, htmlText, delay: stepDelay, preview } = guide.steps[
      nextVisit
    ];

    let delay = isTimerFirstActive && guide.delay;
    if (stepDelay) delay = stepDelay;
    this.driver.highlight({
      delay,
      element: selector,
      stepType: 2,
      popover: {
        title,
        multipleStep: !guide.optionalSteps && guide.steps.length > 1,
        stepsCountText: `${nextVisit + 1}/${guide.steps.length}`,
        description: htmlText || '',
        position: placement,
        preview,
        isLastStep: guide.optionalSteps || nextVisit === guide.steps.length - 1,
        isFirstStep: guide.optionalSteps || nextVisit === 0,
      },
    });
  }

  showOverview(guide: Guide, key: string) {
    this.runningGuide = guide;
    this.runningCacheKey = key;
    this.clearTimer();
    const { steps, title, width } = this.runningGuide;
    Modal.open({
      title,
      key: Modal.key(),
      movable: false,
      closable: false,
      style: {
        width: width ? `${width}px` : '',
      },
      children: (
        <Carousel>
          {steps.map(step => (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: step.htmlText || '' }} />
          ))}
        </Carousel>
      ),
      footer: ok => ok,
      onOk: () => {
        this.pauseCurrentGuide();
        this.startTimer();
      },
    });
  }

  render(): ReactNode {
    return null;
  }
}

export default GuideWrapper;
