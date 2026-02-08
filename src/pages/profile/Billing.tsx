import { Button, Tag } from "antd";
import {
  CreditCardOutlined,
  DownloadOutlined,
  CheckOutlined,
} from "@ant-design/icons";

export default function Billing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      current: false,
      features: ["5 boards", "10 members", "Basic integrations", "1GB storage"],
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      current: true,
      features: [
        "Unlimited boards",
        "Unlimited members",
        "All integrations",
        "100GB storage",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      current: false,
      features: [
        "Everything in Pro",
        "Advanced security",
        "SSO & SAML",
        "Dedicated support",
        "Custom contracts",
      ],
    },
  ];

  const invoices = [
    {
      id: "INV-2026-001",
      date: "Jan 7, 2026",
      amount: "$12.00",
      status: "Paid",
    },
    {
      id: "INV-2025-012",
      date: "Dec 7, 2025",
      amount: "$12.00",
      status: "Paid",
    },
    {
      id: "INV-2025-011",
      date: "Nov 7, 2025",
      amount: "$12.00",
      status: "Paid",
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">Billing</h2>
        <p className="text-sm text-[#64748b] mt-1.5 mb-0">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mb-6">
        <h3 className="text-base font-medium text-[#e2e8f0] mb-4">
          Current Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-xl p-5 ${
                plan.current
                  ? "border-[#3b82f6] bg-[#3b82f6]/5"
                  : "border-[#1e293b] bg-[#0f1219]"
              }`}
            >
              {plan.current && (
                <Tag color="blue" className="mb-3 !rounded-md">
                  Current Plan
                </Tag>
              )}
              <h4 className="text-lg font-semibold text-[#e2e8f0] mb-1">
                {plan.name}
              </h4>
              <div className="mb-4">
                <span className="text-2xl font-bold text-[#e2e8f0]">
                  {plan.price}
                </span>
                <span className="text-sm text-[#64748b] ml-1">
                  / {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#94a3b8]"
                  >
                    <CheckOutlined className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <Button
                  type={plan.name === "Enterprise" ? "default" : "primary"}
                  className="w-full"
                  size="small"
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-[#e2e8f0] m-0">
              Payment Method
            </h3>
            <p className="text-sm text-[#64748b] m-0">
              Manage your payment information
            </p>
          </div>
          <Button size="small">Update</Button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-[#0f1219] rounded-lg border border-[#1e293b]">
          <div className="w-12 h-8 rounded bg-[#1a1f2e] flex items-center justify-center">
            <CreditCardOutlined className="text-[#94a3b8] text-lg" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] m-0">
              Visa ending in 4242
            </p>
            <p className="text-xs text-[#64748b] m-0">Expires 12/2027</p>
          </div>
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-base font-medium text-[#e2e8f0] mb-4">
          Billing History
        </h3>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-[#0f1219] rounded-lg border border-[#1e293b]"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0] m-0">
                    {invoice.id}
                  </p>
                  <p className="text-xs text-[#64748b] m-0">{invoice.date}</p>
                </div>
                <Tag color="success" className="!rounded-md">
                  {invoice.status}
                </Tag>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#e2e8f0]">
                  {invoice.amount}
                </span>
                <Button type="text" size="small" icon={<DownloadOutlined />}>
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
