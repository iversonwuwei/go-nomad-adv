export type FeatureStatus = "p0" | "p1" | "p2";

export type SelectOption = {
  value: string;
  label: string;
};

export type MarketFeature = {
  id: string;
  status: FeatureStatus;
  title: string;
  stageLabel: string;
  summary: string;
  marketSignal: string;
  serviceLine: string;
  tags: string[];
};

export const MARKET_FEATURES: MarketFeature[] = [
  {
    id: "p0-readiness-destination-check",
    status: "p0",
    title: "出发可行性与目的地判断",
    stageLabel: "P0 先做",
    summary: "我们可以帮你判断现在能不能出发、适合去哪几个目的地，以及每个选择的成本、签证和生活取舍。",
    marketSignal: "用户愿不愿意先使用出发前判断服务。",
    serviceLine: "readiness_destination",
    tags: ["能不能走", "去哪", "取舍对比"],
  },
  {
    id: "p0-stay-tax-risk-check",
    status: "p0",
    title: "签证停留与税务风险提醒",
    stageLabel: "P0 先做",
    summary: "我们可以帮你梳理目的地签证、停留天数、税务居民和申报风险，避免还没出发就踩到硬约束。",
    marketSignal: "用户愿不愿意使用风险提醒服务。",
    serviceLine: "stay_tax_risk",
    tags: ["签证", "停留天数", "税务"],
  },
  {
    id: "p0-remote-work-approval-pack",
    status: "p0",
    title: "远程出境工作沟通包",
    stageLabel: "P0 先做",
    summary: "我们可以帮你整理和公司、客户或团队沟通远程出境工作的材料、边界、风险说明和审批要点。",
    marketSignal: "用户愿不愿意使用雇主/客户沟通支持。",
    serviceLine: "remote_work_approval",
    tags: ["公司审批", "客户沟通", "合规说明"],
  },
  {
    id: "p1-income-payment-structure",
    status: "p1",
    title: "收入与跨境收款梳理",
    stageLabel: "P1 扩展",
    summary: "我们可以帮自由职业者、创作者和小团队梳理合同、收入来源、跨境收款、发票和个税的基本路径。",
    marketSignal: "用户愿不愿意使用收入结构服务。",
    serviceLine: "income_payment",
    tags: ["自由职业", "收款", "合同"],
  },
  {
    id: "p1-family-nomad-route",
    status: "p1",
    title: "家庭数字游民路线规划",
    stageLabel: "P1 扩展",
    summary: "我们可以帮家庭用户一起看教育、保险、医疗、配偶工作、居住安全和季节性回国安排。",
    marketSignal: "用户愿不愿意使用家庭路线服务。",
    serviceLine: "family_route",
    tags: ["家庭", "教育", "医疗保险"],
  },
  {
    id: "p2-local-resource-network",
    status: "p2",
    title: "可信本地资源与城市伙伴",
    stageLabel: "P2 网络",
    summary: "我们可以连接目的地本地会计、律师、保险、银行开户、联合办公、共居和城市伙伴资源。",
    marketSignal: "用户愿不愿意使用本地资源网络。",
    serviceLine: "local_resource_network",
    tags: ["本地资源", "城市伙伴", "可信供应"],
  },
  {
    id: "p2-personal-nomad-plan",
    status: "p2",
    title: "个人数字游民计划工作台",
    stageLabel: "P2 产品",
    summary: "我们可以把你的目的地、材料、风险、待办和进度沉淀成一个可持续更新的个人计划工作台。",
    marketSignal: "用户愿不愿意使用长期计划工具。",
    serviceLine: "personal_plan",
    tags: ["计划", "待办", "长期管理"],
  },
];

export const SEGMENT_OPTIONS: SelectOption[] = [
  { value: "early_explorer", label: "想了解数字游民，但还没开始" },
  { value: "remote_employee", label: "已有远程工作 / 想向公司申请" },
  { value: "freelancer_creator", label: "自由职业者 / 创作者" },
  { value: "founder_small_team", label: "创始人 / 小团队" },
  { value: "family_planner", label: "家庭出行规划者" },
  { value: "employer_hr", label: "企业 HR / 运营 / 财务" },
  { value: "local_partner", label: "顾问 / 本地资源伙伴" },
];

export const WORK_MODE_OPTIONS: SelectOption[] = [
  { value: "not_remote_yet", label: "还没有稳定远程工作" },
  { value: "remote_in_china", label: "在国内远程工作" },
  { value: "cross_border_remote", label: "已经跨境远程工作" },
  { value: "contract_project", label: "项目制 / 合同制" },
  { value: "business_owner", label: "自己经营业务" },
];

export const TIMELINE_OPTIONS: SelectOption[] = [
  { value: "researching", label: "只是调研" },
  { value: "six_months", label: "半年内可能行动" },
  { value: "90_days", label: "90 天内需要方向" },
  { value: "30_days", label: "30 天内要做决定" },
  { value: "already_moving", label: "已经在路上" },
];

export const BUDGET_OPTIONS: SelectOption[] = [
  { value: "free_research", label: "先看免费信息" },
  { value: "small_paid_report", label: "愿意购买低价评测/报告" },
  { value: "expert_review", label: "愿意为专家复核付费" },
  { value: "service_package", label: "有完整服务预算" },
  { value: "enterprise_budget", label: "有企业预算" },
];

export const REGION_OPTIONS: SelectOption[] = [
  { value: "undecided", label: "还没有明确目的地" },
  { value: "southeast_asia", label: "东南亚" },
  { value: "hong_kong", label: "香港" },
  { value: "japan_korea", label: "日本 / 韩国" },
  { value: "europe", label: "欧洲" },
  { value: "middle_east", label: "中东" },
  { value: "multi_region", label: "多地流动" },
];

export const BLOCKER_OPTIONS: SelectOption[] = [
  { value: "not_sure", label: "不知道从哪里开始" },
  { value: "visa_path", label: "签证和合法停留" },
  { value: "tax_residency", label: "税务居民和申报风险" },
  { value: "employer_permission", label: "公司是否允许远程出境" },
  { value: "income_payment", label: "收入、合同和跨境收款" },
  { value: "family_constraints", label: "家庭、教育和医疗约束" },
  { value: "trusted_resources", label: "找不到可信本地资源" },
  { value: "cost_uncertainty", label: "成本不确定" },
];

export const FOLLOWUP_OPTIONS: SelectOption[] = [
  { value: "receive_result", label: "愿意收到服务说明和后续进展" },
  { value: "beta_user", label: "愿意成为早期体验用户" },
  { value: "join_interview", label: "愿意参与一次共创访谈" },
  { value: "partner_discussion", label: "愿意讨论顾问/城市伙伴合作" },
  { value: "no_followup", label: "只表达兴趣，暂时不联系" },
];

export const CONTACT_METHOD_OPTIONS: SelectOption[] = [
  { value: "wechat", label: "微信" },
  { value: "mobile", label: "手机号" },
  { value: "email", label: "邮箱" },
  { value: "none", label: "暂不留联系方式" },
];

export function getFeatureById(featureId: string) {
  return MARKET_FEATURES.find((feature) => feature.id === featureId);
}

export function isKnownOption(options: SelectOption[], value: string) {
  return options.some((option) => option.value === value);
}