package routes.ssrc.BiddingHall.Supplier.dtos;

public class priceLine {
  package org.srm.source.bidding.supplier.api.dto;

import io.choerodon.mybatis.annotation.ModifyAudit;
import io.choerodon.mybatis.annotation.VersionAudit;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.NotBlank;
import org.hzero.boot.platform.lov.annotation.LovValue;
import org.hzero.core.base.BaseConstants;
import org.hzero.export.annotation.ExcelColumn;
import org.hzero.starter.keyencrypt.core.Encrypt;
import org.srm.common.mybatis.domain.ExpandDomain;
import org.srm.source.bidding.supplier.domain.entity.BiddingSupHeaderCur;
import org.srm.source.rfx.domain.entity.RfxLadderInquiry;
import org.srm.source.rfx.domain.entity.RfxLineItem;
import org.srm.source.rfx.infra.constant.SourceConstants;
import org.srm.source.share.domain.entity.SourceTemplate;
import org.srm.source.share.infra.annotation.PrecisionProperty;
import org.srm.source.share.infra.constant.ShareConstants;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * 供应商竞价行当前表
 *
 * @author feibao.han@going-link.com 2023-05-09 11:44:38
 */
public class BiddingSupLineCurDTO extends ExpandDomain {

    private Long biddingSupLineCurId;
    @ApiModelProperty(value = "所属租户ID，hpfm_tenant.tenant_id", required = true)
    @NotNull
    private Long tenantId;
    @ApiModelProperty(value = "当前报价头id", required = true)
    @NotNull
    private Long biddingSupHeaderCurId;
    @ApiModelProperty(value = "报价单行状态SSRC.RFX_QUOTATION_LINE_STATUS(NEW/新建|SUBMITTED/已报价|BARGAINED/已还价|TAKEN_BACK/收回|ABANDONED/放弃)", required = true)
    @NotBlank
    private String quotationLineStatus;
    @ApiModelProperty(value = "询价单物料行ID", required = true)
    @NotNull
    private Long rfxLineItemId;
    @ApiModelProperty(value = "轮次", required = true)
    @NotNull
    private Long roundNumber;
    @ApiModelProperty(value = "有效含税标识", required = true)
    @NotNull
    private Integer taxIncludedFlag;
    @ApiModelProperty(value = "有效税率id")
    private Long taxId;
    @ApiModelProperty(value = "有效税率")
    private BigDecimal taxRate;
    @ApiModelProperty(value = "报价时间")
    private Date quotedDate;
    @ApiModelProperty(value = "价格批量")
    private BigDecimal priceBatchQuantity;
    @ApiModelProperty(value = "最小采购量")
    private BigDecimal minPurchaseQuantity;
    @ApiModelProperty(value = "最小包装量")
    private BigDecimal minPackageQuantity;
    @ApiModelProperty(value = "运费金额")
    private BigDecimal freightAmount;
    @ApiModelProperty(value = "当前承诺交货日期")
    private Date currentPromisedDate;
    @ApiModelProperty(value = "当前报价的供货周期")
    private String currentDeliveryCycle;
    @ApiModelProperty(value = "当前报价有效期从")
    private Date currentExpiryDateFrom;
    @ApiModelProperty(value = "当前报价有效期到")
    private Date currentExpiryDateTo;
    @ApiModelProperty(value = "当前报价人")
    private Long currentQuotedBy;
    @ApiModelProperty(value = "当前报价数量")
    private BigDecimal currentQuotationQuantity;
    @ApiModelProperty(value = "")
    private BigDecimal currentQuotationPrice;
    @ApiModelProperty(value = "当前报价理由")
    private String currentQuotationRemark;
    @ApiModelProperty(value = "")
    private BigDecimal netPrice;
    @ApiModelProperty(value = "放弃标识", required = true)
    @NotNull
    private Integer abandonedFlag;
    @ApiModelProperty(value = "当前附件UUID")
    private String currentAttachmentUuid;
    @ApiModelProperty(value = "阶梯报价标志", required = true)
    @NotNull
    private Integer ladderInquiryFlag;
    @ApiModelProperty(value = "有效双单位,smdm_uom.uom_id")
    private Long biUomId;
    @ApiModelProperty(value = "有效单位转换率,双单位:基本计量单位为1:*")
    private BigDecimal uomConversionRate;
    @ApiModelProperty(value = "有效是否含运费标志")
    private Integer freightIncludedFlag;
    @ApiModelProperty(value = "有效品牌")
    private String brand;
    @ApiModelProperty(value = "基准价(值集:SFIN.BENCHMARK_PRICE)")
    private String benchmarkPriceType;
    @ApiModelProperty(value = "是否阶梯报价值来源")
    private Integer ladderQuotationFlag;

    @ApiModelProperty(value = "当前每一未税单价")
    private BigDecimal currentPerNetPrice;
    @ApiModelProperty(value = "当前每一含税单价")
    private BigDecimal currentPerTaxIncludedPrice;
    @ApiModelProperty(value = "当前税额")
    private BigDecimal currentLnNetAmount;
    @ApiModelProperty(value = "当前含税金额")
    private BigDecimal currentLnTaxAmount;
    @ApiModelProperty(value = "当前报价总金额")
    private BigDecimal currentLnTotalAmount;
    @ApiModelProperty(value = "辅助当前可供数量")
    private BigDecimal currentQuotationSecQuantity;
    @ApiModelProperty(value = "辅助当前含税单价")
    private BigDecimal currentQuotationSecPrice;
    @ApiModelProperty(value = "辅助当前未税单价")
    private BigDecimal netSecondaryPrice;
    @ApiModelProperty(value = "辅助当前报价每一含税单价")
    private BigDecimal currentPerTaxInclSecPrice;
    @ApiModelProperty(value = "辅助当前报价每一未税单价")
    private BigDecimal currentPerNetSecPrice;
    @ApiModelProperty(value = "更新标识", required = true)
    @NotNull
    private Integer updatedFlag;
    @Transient
    private List<RfxLadderInquiry> rfxLadderInquiries;
    /**
     * 如果单据存在试竞价,会在这张表里面生成两行数据,用这个flag区分是试竞价还是竞价数据,所有关联的字段的都要加上标识字段
     */
    @ApiModelProperty(value = "试竞价标识,")
    private Integer trialBiddingFlag;
    //
    // 非数据库字段
    // ------------------------------------------------------------------------------
    @ApiModelProperty(value = "竞价方式(竞价大厅专用字段):SSRC.BIDDING_QUOTATION_METHOD:竞价：BIDDING；拍卖：AUCTION")
    @LovValue(value = "SSRC.BIDDING_QUOTATION_METHOD", meaningField = "biddingQuotationMethodMeaning")
    private String biddingQuotationMethod;
    private String biddingQuotationMethodMeaning;
    @ApiModelProperty(value = "竞价模式(竞价大厅专用字段):SSRC.BIDDING_MODE英式竞价：BRITISH_BIDDING；荷兰式竞价DUTCH_BIDDING;日式竞价：JAPANESE_BIDDING")
    @LovValue(value = "SSRC.BIDDING_MODE", meaningField = "biddingModeMeaning")
    private String biddingMode;
    private String biddingModeMeaning;
    @ApiModelProperty(value = "在线签到:用于配置竞价开始前，供应商是否需要在线签到。0:否,1:是")
    private Integer biddingOnlineSignInFlag;
    @ApiModelProperty(value = "试竞价标识(竞价大厅专用字段):用于配置正式竞价开始前，供应商是否试竞价：1:是；0:否")
    private Integer biddingTrialBiddingFlag;
    @ApiModelProperty(value = "竞价对象(竞价大厅专用字段):SSRC.BIDDING_TARGET:单价：UNIT_PRICE；总价：TOTAL_PRICE")
    @LovValue(value = "SSRC.BIDDING_TARGET", meaningField = "biddingTargetMeaning")
    private String biddingTarget;
    private String biddingTargetMeaning;
    @ApiModelProperty(value = "报价次序(竞价大厅专用字段):SSRC.BIDDING_QUOTATION_ORDER并行:PARALLEL;序列:SEQUENCE")
    @LovValue(value = "SSRC.BIDDING_QUOTATION_ORDER", meaningField = "biddingQuotationOrderMeaning")
    private String quotationOrderType;
    private String biddingQuotationOrderMeaning;
    @ApiModelProperty(value = "出价策略(竞价大厅专用字段):SSRC.BIDDING_STRATEGY:低于最低价:BELOW_THE_LOWEST_PRICE;低于上次报价: LOWER_THAN_LAST_QUOTE;高于最高价:ABOVE_MAXIMUM_PRICE;高于上次报价: ABOVE_THAN_LAST_QUOTE")
    @LovValue(value = "SSRC.BIDDING_STRATEGY", meaningField = "biddingStrategyMeaning")
    private String biddingStrategy;
    private String biddingStrategyMeaning;
    @ApiModelProperty(value = "延时总时长限制:用于配置延时竞价时，延时总时长的限制。竞价大厅专用字段")
    private BigDecimal biddingTotalDelayLimit;
    @ApiModelProperty(value = "允许报价次数:用于配置竞价过程中，供应商最多可报价次数。(竞价大厅专用字段)")
    private Long biddingAllowedQuotationCount;
    @ApiModelProperty(value = "匿名报价:用于配置竞价过程中，采购是否可以查看供应商名称。0:否,1:是 (竞价大厅专用字段)")
    private Integer biddingAnonymousQuotesFlag;
    @ApiModelProperty(value = "淘汰规则-淘汰轮次(竞价大厅专用字段)：日式竞价供应商超过多少轮未响应，自动被淘汰")
    private Long biddingEliminateRoundNumber;
    @ApiModelProperty(value = "公开淘汰供应商数标识(竞价大厅专用字段)：1是；0否")
    private Integer biddingOpenEliminateSupplierFlag;
    @ApiModelProperty(value = "最少入围供应商数(竞价大厅专用字段)")
    private Long biddingMinShortlistedSupplierNumber;
    @ApiModelProperty(value = "公开最低/最高限价(竞价大厅专用字段)：1是；0否")
    private Integer biddingOpenLimitPriceFlag;
    @ApiModelProperty(value = "竞价大厅模版标识(竞价大厅专用字段)")
    private Integer biddingFlag;
    @ApiModelProperty(value = "起竞价(竞价大厅专用字段)")
    private BigDecimal startingBiddingPrice;
    @ApiModelProperty(value = "浮动方式(竞价大厅专用字段)")
    @LovValue(lovCode = "SSRC.FLOAT_TYPE", meaningField = "floatTypeMeaning")
    private String floatType;
    private String floatTypeMeaning;
    @ApiModelProperty(value = "报价幅度(竞价大厅专用字段)")
    private BigDecimal quotationRange;
    @ApiModelProperty(value = "安全价(竞价大厅专用字段)")
    private BigDecimal safePrice;
    @ApiModelProperty(value = "签到设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer signInRunningDurationFlag;
    @ApiModelProperty(value = "签到发布即开始标识(竞价大厅专用字段)")
    private Integer signInStartFlag;
    @ApiModelProperty(value = "签到开始时间(竞价大厅专用字段)")
    private Date signInStartDate;
    @ApiModelProperty(value = "签到运行时间(竞价大厅专用字段)")
    private BigDecimal signInRunningDuration;
    @ApiModelProperty(value = "签到截止时间(竞价大厅专用字段)")
    private Date signInEndDate;
    @ApiModelProperty(value = "试竞价设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer startingTrialBiddingRunningDurationFlag;
    @ApiModelProperty(value = "试竞价发布即开始标识(竞价大厅专用字段)")
    private Integer startingTrialBiddingStartFlag;
    @ApiModelProperty(value = "试竞价开始时间(竞价大厅专用字段)")
    private Date startingTrialBiddingStartDate;
    @ApiModelProperty(value = "试竞价运行时间(竞价大厅专用字段)")
    private BigDecimal startingTrialBiddingRunningDuration;
    @ApiModelProperty(value = "试竞价截止时间(竞价大厅专用字段)")
    private Date startingTrialBiddingEndDate;
    @ApiModelProperty(value = "设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer startingBiddingRunningDurationFlag;
    @ApiModelProperty(value = "延时触发规规则(竞价大厅专用字段):SSRC.AUTO_DEFER_TYPE：出现新的报价时触发：NEW_OFFER ；第1名价格发生变化时触发)：TOP_ONE_CHANGE")
    @LovValue(value = "SSRC.AUTO_DEFER_TYPE",meaningField = "autoDeferTypeMeaning")
    private String autoDeferType;
    private String autoDeferTypeMeaning;
    @ApiModelProperty(value = "延时触发时间段（分钟）(竞价大厅专用字段)")
    private BigDecimal autoDeferPeriod;
    @ApiModelProperty(value = "延时触发规则(竞价大厅专用字段)：SSRC.AUTO_DEFER_TIME_RULE：基于新报价出现时间延时NEW_QUOTE；基于第一名价格变化时间延时：TOP_ONE_CHANGE；基于报价截止时间延时：QUOTE_END")
    @LovValue(value = "SSRC.AUTO_DEFER_TIME_RULE",meaningField = "autoDeferTimeRuleMeaning")
    private String autoDeferTimeRule;
    private String autoDeferTimeRuleMeaning;
    @ApiModelProperty(value = "最大延时次数 (竞价大厅专用字段)")
    private Long maxDeferCount;
    private String rfxStatus;
    @ApiModelProperty(value = "竞价规则SSRC.RFA_AUCTION_RULE(NONE/所有排名允许报相同价格|ALL/所有排名不允许报相同价格|TOP_THREE前三名不允许报相同价格)")
    @LovValue(value = "SSRC.RFA_AUCTION_RULE", meaningField = "auctionRuleMeaning")
    private String auctionRule;
    private String auctionRuleMeaning;
    /**
     * 竞价头状态
     */
    private String displayBiddingSupHeaderStatus;
    private String displayBiddingSupHeaderStatusMeaning;
    private Date latestQuotationEndDate;
    @LovValue(value = "SSRC.RFA_OPEN_RULE", meaningField = "openRuleMeaning")
    private String openRule;
    private String openRuleMeaning;
    @ApiModelProperty(value = "供应商牌号")
    private String supplierNumberPlate;
    private String rfxNum;
    private String rfxTitle;
    //物料行序号
    private Integer lineItemSerialNumber;
    //竞价行状态
    private String  displayBiddingSupLineStatus;
    @LovValue(value = "SSRC.DISPLAY_BIDDING_SUP_LINE_STATUS", meaningField = "displayBiddingSupLineStatusMeaning")
    private String  displayBiddingSupLineStatusMeaning;
    private String itemName;
    private String itemCode;
    @Encrypt
    private Long itemId;
    @Encrypt
    private Long uomId;
    private String specs;
    @PrecisionProperty(precisionType = ShareConstants.PrecisionProperty.NUM, precisionCode = "uomId")
    private BigDecimal rfxQuantity;
    @ApiModelProperty(value = "辅助数量")
    @PrecisionProperty(precisionType = ShareConstants.PrecisionProperty.NUM, precisionCode = "secondaryUomId")
    private BigDecimal secondaryQuantity;
    private String uomCode;
    @Transient
    @ApiModelProperty("单位")
    private String uomName;
    @Encrypt
    private Long secondaryUomId;
    private String secondaryUomCode;
    private String secondaryUomName;
    private Integer deferCount;
    @ApiModelProperty(value = "竞价类型：SSRC.BIDDING_TYPE：试竞价：TRIAL_BIDDING；正式竞价：BIDDING", required = true)
    @LovValue(value = "SSRC.BIDDING_TYPE",meaningField = "biddingTypeMeaning")
    private Integer biddingType;
    private Date quotationStartDate;
    private Date quotationEndDate;

    //
    // getter/setter
    // ------------------------------------------------------------------------------

    public String getDisplayBiddingSupLineStatus() {
        return displayBiddingSupLineStatus;
    }

    public void setDisplayBiddingSupLineStatus(String displayBiddingSupLineStatus) {
        this.displayBiddingSupLineStatus = displayBiddingSupLineStatus;
    }

    public String getDisplayBiddingSupLineStatusMeaning() {
        return displayBiddingSupLineStatusMeaning;
    }

    public void setDisplayBiddingSupLineStatusMeaning(String displayBiddingSupLineStatusMeaning) {
        this.displayBiddingSupLineStatusMeaning = displayBiddingSupLineStatusMeaning;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getUomId() {
        return uomId;
    }

    public void setUomId(Long uomId) {
        this.uomId = uomId;
    }

    public String getSpecs() {
        return specs;
    }

    public void setSpecs(String specs) {
        this.specs = specs;
    }

    public BigDecimal getRfxQuantity() {
        return rfxQuantity;
    }

    public void setRfxQuantity(BigDecimal rfxQuantity) {
        this.rfxQuantity = rfxQuantity;
    }

    public BigDecimal getSecondaryQuantity() {
        return secondaryQuantity;
    }

    public void setSecondaryQuantity(BigDecimal secondaryQuantity) {
        this.secondaryQuantity = secondaryQuantity;
    }

    public Integer getDeferCount() {
        return deferCount;
    }

    public void setDeferCount(Integer deferCount) {
        this.deferCount = deferCount;
    }

    public Integer getBiddingType() {
        return biddingType;
    }

    public void setBiddingType(Integer biddingType) {
        this.biddingType = biddingType;
    }

    public Date getQuotationEndDate() {
        return quotationEndDate;
    }

    public void setQuotationEndDate(Date quotationEndDate) {
        this.quotationEndDate = quotationEndDate;
    }

    public Integer getLineItemSerialNumber() {
        return lineItemSerialNumber;
    }

    public void setLineItemSerialNumber(Integer lineItemSerialNumber) {
        this.lineItemSerialNumber = lineItemSerialNumber;
    }

    public String getBiddingQuotationMethod() {
        return biddingQuotationMethod;
    }

    public void setBiddingQuotationMethod(String biddingQuotationMethod) {
        this.biddingQuotationMethod = biddingQuotationMethod;
    }

    public String getBiddingQuotationMethodMeaning() {
        return biddingQuotationMethodMeaning;
    }

    public void setBiddingQuotationMethodMeaning(String biddingQuotationMethodMeaning) {
        this.biddingQuotationMethodMeaning = biddingQuotationMethodMeaning;
    }

    public String getBiddingMode() {
        return biddingMode;
    }

    public void setBiddingMode(String biddingMode) {
        this.biddingMode = biddingMode;
    }

    public String getBiddingModeMeaning() {
        return biddingModeMeaning;
    }

    public void setBiddingModeMeaning(String biddingModeMeaning) {
        this.biddingModeMeaning = biddingModeMeaning;
    }

    public Integer getBiddingOnlineSignInFlag() {
        return biddingOnlineSignInFlag;
    }

    public void setBiddingOnlineSignInFlag(Integer biddingOnlineSignInFlag) {
        this.biddingOnlineSignInFlag = biddingOnlineSignInFlag;
    }

    public Integer getBiddingTrialBiddingFlag() {
        return biddingTrialBiddingFlag;
    }

    public void setBiddingTrialBiddingFlag(Integer biddingTrialBiddingFlag) {
        this.biddingTrialBiddingFlag = biddingTrialBiddingFlag;
    }

    public String getBiddingTarget() {
        return biddingTarget;
    }

    public void setBiddingTarget(String biddingTarget) {
        this.biddingTarget = biddingTarget;
    }

    public String getBiddingTargetMeaning() {
        return biddingTargetMeaning;
    }

    public void setBiddingTargetMeaning(String biddingTargetMeaning) {
        this.biddingTargetMeaning = biddingTargetMeaning;
    }

    public String getBiddingQuotationOrder() {
        return quotationOrderType;
    }

    public void setBiddingQuotationOrder(String quotationOrderType) {
        this.quotationOrderType = quotationOrderType;
    }

    public String getBiddingQuotationOrderMeaning() {
        return biddingQuotationOrderMeaning;
    }

    public void setBiddingQuotationOrderMeaning(String biddingQuotationOrderMeaning) {
        this.biddingQuotationOrderMeaning = biddingQuotationOrderMeaning;
    }

    public String getBiddingStrategy() {
        return biddingStrategy;
    }

    public void setBiddingStrategy(String biddingStrategy) {
        this.biddingStrategy = biddingStrategy;
    }

    public String getBiddingStrategyMeaning() {
        return biddingStrategyMeaning;
    }

    public void setBiddingStrategyMeaning(String biddingStrategyMeaning) {
        this.biddingStrategyMeaning = biddingStrategyMeaning;
    }

    public BigDecimal getBiddingTotalDelayLimit() {
        return biddingTotalDelayLimit;
    }

    public void setBiddingTotalDelayLimit(BigDecimal biddingTotalDelayLimit) {
        this.biddingTotalDelayLimit = biddingTotalDelayLimit;
    }

    public Long getBiddingAllowedQuotationCount() {
        return biddingAllowedQuotationCount;
    }

    public void setBiddingAllowedQuotationCount(Long biddingAllowedQuotationCount) {
        this.biddingAllowedQuotationCount = biddingAllowedQuotationCount;
    }

    public Integer getBiddingAnonymousQuotesFlag() {
        return biddingAnonymousQuotesFlag;
    }

    public void setBiddingAnonymousQuotesFlag(Integer biddingAnonymousQuotesFlag) {
        this.biddingAnonymousQuotesFlag = biddingAnonymousQuotesFlag;
    }

    public Long getBiddingEliminateRoundNumber() {
        return biddingEliminateRoundNumber;
    }

    public void setBiddingEliminateRoundNumber(Long biddingEliminateRoundNumber) {
        this.biddingEliminateRoundNumber = biddingEliminateRoundNumber;
    }

    public Integer getBiddingOpenEliminateSupplierFlag() {
        return biddingOpenEliminateSupplierFlag;
    }

    public void setBiddingOpenEliminateSupplierFlag(Integer biddingOpenEliminateSupplierFlag) {
        this.biddingOpenEliminateSupplierFlag = biddingOpenEliminateSupplierFlag;
    }

    public Long getBiddingMinShortlistedSupplierNumber() {
        return biddingMinShortlistedSupplierNumber;
    }

    public void setBiddingMinShortlistedSupplierNumber(Long biddingMinShortlistedSupplierNumber) {
        this.biddingMinShortlistedSupplierNumber = biddingMinShortlistedSupplierNumber;
    }

    public Integer getBiddingOpenLimitPriceFlag() {
        return biddingOpenLimitPriceFlag;
    }

    public void setBiddingOpenLimitPriceFlag(Integer biddingOpenLimitPriceFlag) {
        this.biddingOpenLimitPriceFlag = biddingOpenLimitPriceFlag;
    }

    public Integer getBiddingFlag() {
        return biddingFlag;
    }

    public void setBiddingFlag(Integer biddingFlag) {
        this.biddingFlag = biddingFlag;
    }

    public BigDecimal getStartingBiddingPrice() {
        return startingBiddingPrice;
    }

    public void setStartingBiddingPrice(BigDecimal startingBiddingPrice) {
        this.startingBiddingPrice = startingBiddingPrice;
    }

    public String getFloatType() {
        return floatType;
    }

    public void setFloatType(String floatType) {
        this.floatType = floatType;
    }

    public String getFloatTypeMeaning() {
        return floatTypeMeaning;
    }

    public void setFloatTypeMeaning(String floatTypeMeaning) {
        this.floatTypeMeaning = floatTypeMeaning;
    }

    public BigDecimal getQuotationRange() {
        return quotationRange;
    }

    public void setQuotationRange(BigDecimal quotationRange) {
        this.quotationRange = quotationRange;
    }

    public BigDecimal getSafePrice() {
        return safePrice;
    }

    public void setSafePrice(BigDecimal safePrice) {
        this.safePrice = safePrice;
    }

    public Integer getSignInRunningDurationFlag() {
        return signInRunningDurationFlag;
    }

    public void setSignInRunningDurationFlag(Integer signInRunningDurationFlag) {
        this.signInRunningDurationFlag = signInRunningDurationFlag;
    }

    public Integer getSignInStartFlag() {
        return signInStartFlag;
    }

    public void setSignInStartFlag(Integer signInStartFlag) {
        this.signInStartFlag = signInStartFlag;
    }

    public Date getSignInStartDate() {
        return signInStartDate;
    }

    public void setSignInStartDate(Date signInStartDate) {
        this.signInStartDate = signInStartDate;
    }

    public BigDecimal getSignInRunningDuration() {
        return signInRunningDuration;
    }

    public void setSignInRunningDuration(BigDecimal signInRunningDuration) {
        this.signInRunningDuration = signInRunningDuration;
    }

    public Date getSignInEndDate() {
        return signInEndDate;
    }

    public void setSignInEndDate(Date signInEndDate) {
        this.signInEndDate = signInEndDate;
    }

    public Integer getStartingTrialBiddingRunningDurationFlag() {
        return startingTrialBiddingRunningDurationFlag;
    }

    public void setStartingTrialBiddingRunningDurationFlag(Integer startingTrialBiddingRunningDurationFlag) {
        this.startingTrialBiddingRunningDurationFlag = startingTrialBiddingRunningDurationFlag;
    }

    public Integer getStartingTrialBiddingStartFlag() {
        return startingTrialBiddingStartFlag;
    }

    public void setStartingTrialBiddingStartFlag(Integer startingTrialBiddingStartFlag) {
        this.startingTrialBiddingStartFlag = startingTrialBiddingStartFlag;
    }

    public Date getStartingTrialBiddingStartDate() {
        return startingTrialBiddingStartDate;
    }

    public void setStartingTrialBiddingStartDate(Date startingTrialBiddingStartDate) {
        this.startingTrialBiddingStartDate = startingTrialBiddingStartDate;
    }

    public BigDecimal getStartingTrialBiddingRunningDuration() {
        return startingTrialBiddingRunningDuration;
    }

    public void setStartingTrialBiddingRunningDuration(BigDecimal startingTrialBiddingRunningDuration) {
        this.startingTrialBiddingRunningDuration = startingTrialBiddingRunningDuration;
    }

    public Date getStartingTrialBiddingEndDate() {
        return startingTrialBiddingEndDate;
    }

    public void setStartingTrialBiddingEndDate(Date startingTrialBiddingEndDate) {
        this.startingTrialBiddingEndDate = startingTrialBiddingEndDate;
    }

    public Integer getStartingBiddingRunningDurationFlag() {
        return startingBiddingRunningDurationFlag;
    }

    public void setStartingBiddingRunningDurationFlag(Integer startingBiddingRunningDurationFlag) {
        this.startingBiddingRunningDurationFlag = startingBiddingRunningDurationFlag;
    }

    public String getAutoDeferType() {
        return autoDeferType;
    }

    public void setAutoDeferType(String autoDeferType) {
        this.autoDeferType = autoDeferType;
    }

    public String getAutoDeferTypeMeaning() {
        return autoDeferTypeMeaning;
    }

    public void setAutoDeferTypeMeaning(String autoDeferTypeMeaning) {
        this.autoDeferTypeMeaning = autoDeferTypeMeaning;
    }

    public BigDecimal getAutoDeferPeriod() {
        return autoDeferPeriod;
    }

    public void setAutoDeferPeriod(BigDecimal autoDeferPeriod) {
        this.autoDeferPeriod = autoDeferPeriod;
    }

    public String getAutoDeferTimeRule() {
        return autoDeferTimeRule;
    }

    public void setAutoDeferTimeRule(String autoDeferTimeRule) {
        this.autoDeferTimeRule = autoDeferTimeRule;
    }

    public String getAutoDeferTimeRuleMeaning() {
        return autoDeferTimeRuleMeaning;
    }

    public void setAutoDeferTimeRuleMeaning(String autoDeferTimeRuleMeaning) {
        this.autoDeferTimeRuleMeaning = autoDeferTimeRuleMeaning;
    }

    public Long getMaxDeferCount() {
        return maxDeferCount;
    }

    public void setMaxDeferCount(Long maxDeferCount) {
        this.maxDeferCount = maxDeferCount;
    }

    public String getRfxStatus() {
        return rfxStatus;
    }

    public void setRfxStatus(String rfxStatus) {
        this.rfxStatus = rfxStatus;
    }

    public String getAuctionRule() {
        return auctionRule;
    }

    public void setAuctionRule(String auctionRule) {
        this.auctionRule = auctionRule;
    }

    public String getAuctionRuleMeaning() {
        return auctionRuleMeaning;
    }

    public void setAuctionRuleMeaning(String auctionRuleMeaning) {
        this.auctionRuleMeaning = auctionRuleMeaning;
    }

    public String getDisplayBiddingSupHeaderStatus() {
        return displayBiddingSupHeaderStatus;
    }

    public void setDisplayBiddingSupHeaderStatus(String displayBiddingSupHeaderStatus) {
        this.displayBiddingSupHeaderStatus = displayBiddingSupHeaderStatus;
    }

    public String getDisplayBiddingSupHeaderStatusMeaning() {
        return displayBiddingSupHeaderStatusMeaning;
    }

    public void setDisplayBiddingSupHeaderStatusMeaning(String displayBiddingSupHeaderStatusMeaning) {
        this.displayBiddingSupHeaderStatusMeaning = displayBiddingSupHeaderStatusMeaning;
    }

    public Date getQuotationStartDate() {
        return quotationStartDate;
    }

    public void setQuotationStartDate(Date quotationStartDate) {
        this.quotationStartDate = quotationStartDate;
    }

    public Date getLatestQuotationEndDate() {
        return latestQuotationEndDate;
    }

    public void setLatestQuotationEndDate(Date latestQuotationEndDate) {
        this.latestQuotationEndDate = latestQuotationEndDate;
    }

    public String getOpenRule() {
        return openRule;
    }

    public void setOpenRule(String openRule) {
        this.openRule = openRule;
    }

    public String getOpenRuleMeaning() {
        return openRuleMeaning;
    }

    public void setOpenRuleMeaning(String openRuleMeaning) {
        this.openRuleMeaning = openRuleMeaning;
    }

    public String getSupplierNumberPlate() {
        return supplierNumberPlate;
    }

    public void setSupplierNumberPlate(String supplierNumberPlate) {
        this.supplierNumberPlate = supplierNumberPlate;
    }

    public String getRfxNum() {
        return rfxNum;
    }

    public void setRfxNum(String rfxNum) {
        this.rfxNum = rfxNum;
    }

    public String getRfxTitle() {
        return rfxTitle;
    }

    public void setRfxTitle(String rfxTitle) {
        this.rfxTitle = rfxTitle;
    }

    public Integer getTrialBiddingFlag() {
        return trialBiddingFlag;
    }

    public void setTrialBiddingFlag(Integer trialBiddingFlag) {
        this.trialBiddingFlag = trialBiddingFlag;
    }

    /**
     * @return
     */
    public Long getBiddingSupLineCurId() {
        return biddingSupLineCurId;
    }

    public void setBiddingSupLineCurId(Long biddingSupLineCurId) {
        this.biddingSupLineCurId = biddingSupLineCurId;
    }

    /**
     * @return 所属租户ID，hpfm_tenant.tenant_id
     */
    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    /**
     * @return 当前报价头id
     */
    public Long getBiddingSupHeaderCurId() {
        return biddingSupHeaderCurId;
    }

    public void setBiddingSupHeaderCurId(Long biddingSupHeaderCurId) {
        this.biddingSupHeaderCurId = biddingSupHeaderCurId;
    }

    /**
     * @return 报价单行状态SSRC.RFX_QUOTATION_LINE_STATUS(NEW / 新建 | SUBMITTED / 已报价 | BARGAINED / 已还价 | TAKEN_BACK / 收回 | ABANDONED / 放弃)
     */
    public String getQuotationLineStatus() {
        return quotationLineStatus;
    }

    public void setQuotationLineStatus(String quotationLineStatus) {
        this.quotationLineStatus = quotationLineStatus;
    }

    /**
     * @return 询价单物料行ID
     */
    public Long getRfxLineItemId() {
        return rfxLineItemId;
    }

    public void setRfxLineItemId(Long rfxLineItemId) {
        this.rfxLineItemId = rfxLineItemId;
    }

    /**
     * @return 轮次
     */
    public Long getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Long roundNumber) {
        this.roundNumber = roundNumber;
    }

    /**
     * @return 有效含税标识
     */
    public Integer getTaxIncludedFlag() {
        return taxIncludedFlag;
    }

    public void setTaxIncludedFlag(Integer taxIncludedFlag) {
        this.taxIncludedFlag = taxIncludedFlag;
    }

    /**
     * @return 有效税率id
     */
    public Long getTaxId() {
        return taxId;
    }

    public void setTaxId(Long taxId) {
        this.taxId = taxId;
    }

    /**
     * @return 有效税率
     */
    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    /**
     * @return 报价时间
     */
    public Date getQuotedDate() {
        return quotedDate;
    }

    public void setQuotedDate(Date quotedDate) {
        this.quotedDate = quotedDate;
    }

    /**
     * @return 价格批量
     */
    public BigDecimal getPriceBatchQuantity() {
        return priceBatchQuantity;
    }

    public void setPriceBatchQuantity(BigDecimal priceBatchQuantity) {
        this.priceBatchQuantity = priceBatchQuantity;
    }

    /**
     * @return 最小采购量
     */
    public BigDecimal getMinPurchaseQuantity() {
        return minPurchaseQuantity;
    }

    public void setMinPurchaseQuantity(BigDecimal minPurchaseQuantity) {
        this.minPurchaseQuantity = minPurchaseQuantity;
    }

    /**
     * @return 最小包装量
     */
    public BigDecimal getMinPackageQuantity() {
        return minPackageQuantity;
    }

    public void setMinPackageQuantity(BigDecimal minPackageQuantity) {
        this.minPackageQuantity = minPackageQuantity;
    }

    /**
     * @return 运费金额
     */
    public BigDecimal getFreightAmount() {
        return freightAmount;
    }

    public void setFreightAmount(BigDecimal freightAmount) {
        this.freightAmount = freightAmount;
    }

    /**
     * @return 当前承诺交货日期
     */
    public Date getCurrentPromisedDate() {
        return currentPromisedDate;
    }

    public void setCurrentPromisedDate(Date currentPromisedDate) {
        this.currentPromisedDate = currentPromisedDate;
    }

    /**
     * @return 当前报价的供货周期
     */
    public String getCurrentDeliveryCycle() {
        return currentDeliveryCycle;
    }

    public void setCurrentDeliveryCycle(String currentDeliveryCycle) {
        this.currentDeliveryCycle = currentDeliveryCycle;
    }

    /**
     * @return 当前报价有效期从
     */
    public Date getCurrentExpiryDateFrom() {
        return currentExpiryDateFrom;
    }

    public void setCurrentExpiryDateFrom(Date currentExpiryDateFrom) {
        this.currentExpiryDateFrom = currentExpiryDateFrom;
    }

    /**
     * @return 当前报价有效期到
     */
    public Date getCurrentExpiryDateTo() {
        return currentExpiryDateTo;
    }

    public void setCurrentExpiryDateTo(Date currentExpiryDateTo) {
        this.currentExpiryDateTo = currentExpiryDateTo;
    }

    /**
     * @return 当前报价人
     */
    public Long getCurrentQuotedBy() {
        return currentQuotedBy;
    }

    public void setCurrentQuotedBy(Long currentQuotedBy) {
        this.currentQuotedBy = currentQuotedBy;
    }

    /**
     * @return 当前报价数量
     */
    public BigDecimal getCurrentQuotationQuantity() {
        return currentQuotationQuantity;
    }

    public void setCurrentQuotationQuantity(BigDecimal currentQuotationQuantity) {
        this.currentQuotationQuantity = currentQuotationQuantity;
    }

    /**
     * @return
     */
    public BigDecimal getCurrentQuotationPrice() {
        return currentQuotationPrice;
    }

    public void setCurrentQuotationPrice(BigDecimal currentQuotationPrice) {
        this.currentQuotationPrice = currentQuotationPrice;
    }

    /**
     * @return 当前报价理由
     */
    public String getCurrentQuotationRemark() {
        return currentQuotationRemark;
    }

    public void setCurrentQuotationRemark(String currentQuotationRemark) {
        this.currentQuotationRemark = currentQuotationRemark;
    }

    /**
     * @return
     */
    public BigDecimal getNetPrice() {
        return netPrice;
    }

    public void setNetPrice(BigDecimal netPrice) {
        this.netPrice = netPrice;
    }

    /**
     * @return 放弃标识
     */
    public Integer getAbandonedFlag() {
        return abandonedFlag;
    }

    public void setAbandonedFlag(Integer abandonedFlag) {
        this.abandonedFlag = abandonedFlag;
    }

    /**
     * @return 当前附件UUID
     */
    public String getCurrentAttachmentUuid() {
        return currentAttachmentUuid;
    }

    public void setCurrentAttachmentUuid(String currentAttachmentUuid) {
        this.currentAttachmentUuid = currentAttachmentUuid;
    }

    /**
     * @return 阶梯报价标志
     */
    public Integer getLadderInquiryFlag() {
        return ladderInquiryFlag;
    }

    public void setLadderInquiryFlag(Integer ladderInquiryFlag) {
        this.ladderInquiryFlag = ladderInquiryFlag;
    }

    /**
     * @return 有效双单位, smdm_uom.uom_id
     */
    public Long getBiUomId() {
        return biUomId;
    }

    public void setBiUomId(Long biUomId) {
        this.biUomId = biUomId;
    }

    /**
     * @return 有效单位转换率, 双单位:基本计量单位为1:*
     */
    public BigDecimal getUomConversionRate() {
        return uomConversionRate;
    }

    public void setUomConversionRate(BigDecimal uomConversionRate) {
        this.uomConversionRate = uomConversionRate;
    }

    /**
     * @return 有效是否含运费标志
     */
    public Integer getFreightIncludedFlag() {
        return freightIncludedFlag;
    }

    public void setFreightIncludedFlag(Integer freightIncludedFlag) {
        this.freightIncludedFlag = freightIncludedFlag;
    }

    /**
     * @return 有效品牌
     */
    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    /**
     * @return 基准价(值集 : SFIN.BENCHMARK_PRICE)
     */
    public String getBenchmarkPriceType() {
        return benchmarkPriceType;
    }

    public void setBenchmarkPriceType(String benchmarkPriceType) {
        this.benchmarkPriceType = benchmarkPriceType;
    }

    /**
     * @return 是否阶梯报价值来源
     */
    public Integer getLadderQuotationFlag() {
        return ladderQuotationFlag;
    }

    public void setLadderQuotationFlag(Integer ladderQuotationFlag) {
        this.ladderQuotationFlag = ladderQuotationFlag;
    }

    /**
     * @return 当前每一未税单价
     */
    public BigDecimal getCurrentPerNetPrice() {
        return currentPerNetPrice;
    }

    public void setCurrentPerNetPrice(BigDecimal currentPerNetPrice) {
        this.currentPerNetPrice = currentPerNetPrice;
    }

    /**
     * @return 当前每一含税单价
     */
    public BigDecimal getCurrentPerTaxIncludedPrice() {
        return currentPerTaxIncludedPrice;
    }

    public void setCurrentPerTaxIncludedPrice(BigDecimal currentPerTaxIncludedPrice) {
        this.currentPerTaxIncludedPrice = currentPerTaxIncludedPrice;
    }

    /**
     * @return 当前税额
     */
    public BigDecimal getCurrentLnNetAmount() {
        return currentLnNetAmount;
    }

    public void setCurrentLnNetAmount(BigDecimal currentLnNetAmount) {
        this.currentLnNetAmount = currentLnNetAmount;
    }

    /**
     * @return 当前含税金额
     */
    public BigDecimal getCurrentLnTaxAmount() {
        return currentLnTaxAmount;
    }

    public void setCurrentLnTaxAmount(BigDecimal currentLnTaxAmount) {
        this.currentLnTaxAmount = currentLnTaxAmount;
    }

    /**
     * @return 当前报价总金额
     */
    public BigDecimal getCurrentLnTotalAmount() {
        return currentLnTotalAmount;
    }

    public void setCurrentLnTotalAmount(BigDecimal currentLnTotalAmount) {
        this.currentLnTotalAmount = currentLnTotalAmount;
    }

    /**
     * @return 辅助当前可供数量
     */
    public BigDecimal getCurrentQuotationSecQuantity() {
        return currentQuotationSecQuantity;
    }

    public void setCurrentQuotationSecQuantity(BigDecimal currentQuotationSecQuantity) {
        this.currentQuotationSecQuantity = currentQuotationSecQuantity;
    }

    /**
     * @return 辅助当前含税单价
     */
    public BigDecimal getCurrentQuotationSecPrice() {
        return currentQuotationSecPrice;
    }

    public void setCurrentQuotationSecPrice(BigDecimal currentQuotationSecPrice) {
        this.currentQuotationSecPrice = currentQuotationSecPrice;
    }

    /**
     * @return 辅助当前未税单价
     */
    public BigDecimal getNetSecondaryPrice() {
        return netSecondaryPrice;
    }

    public void setNetSecondaryPrice(BigDecimal netSecondaryPrice) {
        this.netSecondaryPrice = netSecondaryPrice;
    }

    /**
     * @return 辅助当前报价每一含税单价
     */
    public BigDecimal getCurrentPerTaxInclSecPrice() {
        return currentPerTaxInclSecPrice;
    }

    public void setCurrentPerTaxInclSecPrice(BigDecimal currentPerTaxInclSecPrice) {
        this.currentPerTaxInclSecPrice = currentPerTaxInclSecPrice;
    }

    /**
     * @return 辅助当前报价每一未税单价
     */
    public BigDecimal getCurrentPerNetSecPrice() {
        return currentPerNetSecPrice;
    }

    public void setCurrentPerNetSecPrice(BigDecimal currentPerNetSecPrice) {
        this.currentPerNetSecPrice = currentPerNetSecPrice;
    }

    /**
     * @return 更新标识
     */
    public Integer getUpdatedFlag() {
        return updatedFlag;
    }

    public void setUpdatedFlag(Integer updatedFlag) {
        this.updatedFlag = updatedFlag;
    }

    public void initByRfxLineItem(BiddingSupHeaderDTO biddingSupHeaderDTO, Long roundNumber, RfxLineItem rfxLineItem, String priceTypeCode, SourceTemplate sourceTemplate) {
        BiddingSupHeaderCur biddingSupHeaderCur = biddingSupHeaderDTO.getBiddingSupHeaderCur();
        this.biddingSupHeaderCurId = biddingSupHeaderCur.getBiddingSupHeaderCurId();
        this.tenantId = rfxLineItem.getTenantId();
        this.quotationLineStatus = SourceConstants.RfxQuotationLineStatus.NEW;
        this.rfxLineItemId = rfxLineItem.getRfxLineItemId();
        this.roundNumber = roundNumber;
        this.taxIncludedFlag = rfxLineItem.getTaxIncludedFlag();
        this.taxId = rfxLineItem.getTaxId();
        this.taxRate = rfxLineItem.getTaxRate();
        this.quotedDate = new Date();
        this.priceBatchQuantity = rfxLineItem.getBatchPrice();
        this.ladderInquiryFlag = rfxLineItem.getLadderInquiryFlag();
        this.currentQuotationQuantity = rfxLineItem.getRfxQuantity();
        this.currentQuotationSecQuantity = rfxLineItem.getSecondaryQuantity();
        this.currentExpiryDateFrom = rfxLineItem.getValidExpiryDateFrom();
        this.currentExpiryDateTo = rfxLineItem.getValidExpiryDateTo();
        this.taxId = rfxLineItem.getTaxId();
        this.taxRate = rfxLineItem.getTaxRate();
        this.abandonedFlag = BaseConstants.Flag.NO;
        this.rfxLadderInquiries = rfxLineItem.getRfxLadderInquiries();
        this.brand = rfxLineItem.getBrand();
        this.benchmarkPriceType = priceTypeCode;
        //根据模版带出是否含运费的默认值
        this.freightIncludedFlag = Objects.isNull(sourceTemplate.getFreightIncludedFlag()) ? BaseConstants.Flag.NO : sourceTemplate.getFreightIncludedFlag();
    }


    public List<RfxLadderInquiry> getRfxLadderInquiries() {
        return rfxLadderInquiries;
    }

    public void setRfxLadderInquiries(List<RfxLadderInquiry> rfxLadderInquiries) {
        this.rfxLadderInquiries = rfxLadderInquiries;
    }




    public Long getSecondaryUomId() {
        return secondaryUomId;
    }

    public void setSecondaryUomId(Long secondaryUomId) {
        this.secondaryUomId = secondaryUomId;
    }

    public String getSecondaryUomName() {
        return secondaryUomName;
    }

    public void setSecondaryUomName(String secondaryUomName) {
        this.secondaryUomName = secondaryUomName;
    }

    public String getSecondaryUomCode() {
        return secondaryUomCode;
    }

    public void setSecondaryUomCode(String secondaryUomCode) {
        this.secondaryUomCode = secondaryUomCode;
    }

    public String getUomName() {
        return uomName;
    }

    public void setUomName(String uomName) {
        this.uomName = uomName;
    }

    public String getUomCode() {
        return uomCode;
    }

    public void setUomCode(String uomCode) {
        this.uomCode = uomCode;
    }

    public void initUomCodeName(){
        if(StringUtils.isNotBlank(this.getUomCode()) && StringUtils.isNotBlank(this.getUomName())) {
            this.setUomName(this.getUomCode() + BaseConstants.Symbol.SLASH + this.getUomName());
        }
        if(StringUtils.isNotBlank(this.getSecondaryUomCode()) && StringUtils.isNotBlank(this.getSecondaryUomName())) {
            this.setSecondaryUomName(this.getSecondaryUomCode() + BaseConstants.Symbol.SLASH + this.getSecondaryUomName());
        }
    }
}

}
