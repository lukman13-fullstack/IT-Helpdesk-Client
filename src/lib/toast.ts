import { toast } from "sonner";
import React from "react";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

export const notify = {
  success: (
    message: string,
    description?: string,
    opts?: Parameters<typeof toast.custom>[1]
  ) =>
    toast.custom(
      (t) =>
        React.createElement(
          "div",
          {
            className:
              "bg-[#f2fbf4] text-[#2d1b4e] border-[#cff0d8] border-2 p-4 rounded-lg shadow-lg min-w-[300px]",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(CheckCircle, {
              className: "h-7 w-7 text-white bg-[#7fd99a] p-1 rounded-full",
            }),
            React.createElement(
              "div",
              { className: "flex-grow" },
              React.createElement("div", { className: "font-bold" }, "Success"),
              React.createElement(
                "div",
                { className: "font-semibold text-xs" },
                message
              ),
              description &&
                React.createElement(
                  "div",
                  { className: "text-sm text-gray-700 text-xs" },
                  description
                )
            ),
            React.createElement(
              "button",
              {
                onClick: () => toast.dismiss(t),
                className:
                  "ml-auto bg-transparent hover:bg-[#cff0d8]/30 rounded-full px-2 py-1 text-xs",
              },
              "X"
            )
          )
        ),
      opts
    ),
  information: (
    message: string,
    description?: string,
    opts?: Parameters<typeof toast.custom>[1]
  ) =>
    toast.custom(
      (t) =>
        React.createElement(
          "div",
          {
            className:
              "bg-[#f0f8fc] text-[#2d1b4e] border-[#c9e7f4] border-2 p-4 rounded-lg shadow-lg min-w-[300px]",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(Info, {
              className: "h-7 w-7 text-white bg-[#6ec1e4] p-1 rounded-full",
            }),
            React.createElement(
              "div",
              { className: "flex-grow" },
              React.createElement(
                "div",
                { className: "font-bold" },
                "Information"
              ),
              React.createElement(
                "div",
                { className: "font-semibold text-xs" },
                message
              ),
              description &&
                React.createElement(
                  "div",
                  { className: "text-sm text-gray-700 text-xs" },
                  description
                )
            ),
            React.createElement(
              "button",
              {
                onClick: () => toast.dismiss(t),
                className:
                  "ml-auto bg-transparent hover:bg-[#91d5ff]/30 rounded-full px-2 py-1 text-xs",
              },
              "X"
            )
          )
        ),
      opts
    ),
  warning: (
    message: string,
    description?: string,
    opts?: Parameters<typeof toast.custom>[1]
  ) =>
    toast.custom(
      (t) =>
        React.createElement(
          "div",
          {
            className:
              "bg-[#fff7ed] text-[#2d1b4e] border-[#ffeacb] border-2 p-4 rounded-lg shadow-lg min-w-[300px]",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(AlertTriangle, {
              className: "h-7 w-7 text-white bg-[#ffb84d] p-1 rounded-full",
            }),
            React.createElement(
              "div",
              { className: "flex-grow" },
              React.createElement("div", { className: "font-bold" }, "Warning"),
              React.createElement(
                "div",
                { className: "font-semibold text-xs" },
                message
              ),
              description &&
                React.createElement(
                  "div",
                  { className: "text-sm text-gray-700 text-xs" },
                  description
                )
            ),
            React.createElement(
              "button",
              {
                onClick: () => toast.dismiss(t),
                className:
                  "ml-auto bg-transparent hover:bg-[#ffe58f]/30 rounded-full px-2 py-1 text-xs",
              },
              "X"
            )
          )
        ),
      opts
    ),
  error: (
    message: string,
    description?: string,
    opts?: Parameters<typeof toast.custom>[1]
  ) =>
    toast.custom(
      (t) =>
        React.createElement(
          "div",
          {
            className:
              "bg-[#fff0f5] text-[#2d1b4e] border-[#ffc8da] border-2 p-4 rounded-lg shadow-lg min-w-[300px]",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(XCircle, {
              className: "h-7 w-7 text-white bg-[#ff6b9d] p-1 rounded-full",
            }),
            React.createElement(
              "div",
              { className: "flex-grow" },
              React.createElement("div", { className: "font-bold" }, "Error"),
              React.createElement(
                "div",
                { className: "font-semibold text-xs" },
                message
              ),
              description &&
                React.createElement(
                  "div",
                  { className: "text-sm text-gray-700 text-xs" },
                  description
                )
            ),
            React.createElement(
              "button",
              {
                onClick: () => toast.dismiss(t),
                className:
                  "ml-auto bg-transparent hover:bg-[#ffccc7]/30 rounded-full px-2 py-1 text-xs",
              },
              "X"
            )
          )
        ),
      opts
    ),
};
