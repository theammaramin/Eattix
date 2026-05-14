import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { LoadCanvasTemplate, loadCaptchaEnginge } from "react-simple-captcha";
import { cn } from "../utils/cn";

const CaptchaWidget = forwardRef(function CaptchaWidget(
  { value, onChange },
  ref,
) {
  const [stage, setStage] = useState("idle");

  useImperativeHandle(ref, () => ({
    reset() {
      setStage("idle");
    },
  }));

  useEffect(() => {
    if (stage === "ready") {
      loadCaptchaEnginge(6);
    }
  }, [stage]);

  const handleClick = () => {
    if (stage !== "idle") return;
    setStage("loading");
    setTimeout(() => {
      setStage("ready");
    }, 1500);
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden select-none">
      <div
        role={stage === "idle" ? "button" : undefined}
        tabIndex={stage === "idle" ? 0 : undefined}
        onClick={stage === "idle" ? handleClick : undefined}
        onKeyDown={
          stage === "idle"
            ? (e) => e.key === "Enter" && handleClick()
            : undefined
        }
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          stage === "idle" &&
            "cursor-pointer hover:bg-gray-50 transition-colors",
        )}
      >
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          {stage === "idle" && (
            <div className="w-5 h-5 rounded border-2 border-gray-400" />
          )}
          {stage === "loading" && (
            <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin" />
          )}
          {stage === "ready" && (
            <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        <span className="flex-1 text-sm text-gray-700 font-medium">
          I&apos;m not a robot
        </span>

        <div className="flex flex-col items-center gap-0.5">
          <svg
            className="w-8 h-8 text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <span className="text-[10px] text-gray-400 leading-none">
            CAPTCHA
          </span>
        </div>
      </div>

      {stage === "ready" && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 pb-4 pt-3 space-y-2">
          <LoadCanvasTemplate reloadColor="#f97316" />
          <input
            type="text"
            placeholder="Type the characters above"
            value={value}
            onChange={onChange}
            autoComplete="off"
            className="input text-sm w-full"
          />
        </div>
      )}
    </div>
  );
});

export default CaptchaWidget;
