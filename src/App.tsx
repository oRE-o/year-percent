import React, { useState, useEffect } from "react";
import "./reset.css";
import "./App.css";

// 1년, 1달, 1주일, 하루에 대한 퍼센트를 계산하는 함수
const getTimePercentages = () => {
  const now = new Date();

  // 1년 퍼센트
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearPercent =
    ((now.getTime() - startOfYear.getTime()) /
      (endOfYear.getTime() - startOfYear.getTime())) *
    100;

  // 1달 퍼센트
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthPercent =
    ((now.getTime() - startOfMonth.getTime()) /
      (endOfMonth.getTime() - startOfMonth.getTime())) *
    100;

  // 1주일 퍼센트 (월요일 시작, 일요일 끝)
  const startOfWeek = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7; // 월요일을 0으로 설정
  startOfWeek.setDate(now.getDate() - dayOfWeek); // 이번 주 월요일로 설정
  startOfWeek.setHours(0, 0, 0, 0); // 자정으로 시간 설정
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // 다음 주 월요일 자정으로 설정
  const weekPercent =
    ((now.getTime() - startOfWeek.getTime()) /
      (endOfWeek.getTime() - startOfWeek.getTime())) *
    100;

  // 주말까지 남은 퍼센트 (토요일까지 남은 시간)
  const startOfWeekend = new Date(startOfWeek);
  startOfWeekend.setDate(startOfWeek.getDate() + 5); // 이번 주 토요일 설정
  const weekendPercentRemaining =
    ((startOfWeekend.getTime() - now.getTime()) /
      (endOfWeek.getTime() - startOfWeek.getTime())) *
    100;

  // 월요일까지 남은 퍼센트 (일요일일 경우)
  const startOfNextWeek = new Date(endOfWeek);
  const mondayPercentRemaining =
    ((startOfNextWeek.getTime() - now.getTime()) /
      (endOfWeek.getTime() - startOfWeek.getTime())) *
    100;

  // 1일 퍼센트
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);
  const dayPercent =
    ((now.getTime() - startOfDay.getTime()) /
      (endOfDay.getTime() - startOfDay.getTime())) *
    100;

  return {
    yearPercent,
    monthPercent,
    weekPercent,
    dayPercent,
    weekendPercentRemaining,
    mondayPercentRemaining,
    isWeekend: now.getDay() >= 5,
  };
};

const TimePercentage: React.FC = () => {
  const [percentages, setPercentages] = useState(getTimePercentages());
  const [precision, setPrecision] = useState({
    year: 1,
    month: 1,
    week: 1,
    day: 1,
    weekend: 1,
  });
  const [hovering, setHovering] = useState({
    yearPercent: false,
    monthPercent: false,
    weekPercent: false,
    dayPercent: false,
    weekendPercent: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentages(getTimePercentages());
    }, 50); // 50ms마다 퍼센트 값 업데이트

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const precisionInterval = setInterval(() => {
      setPrecision((prevPrecision) => {
        const newPrecision = { ...prevPrecision };

        // 각 항목별로 hover 상태에 따라 소수점 자릿수를 증가/감소
        if (hovering.yearPercent) {
          newPrecision.year = Math.min(newPrecision.year + 1, 7);
        } else {
          newPrecision.year = Math.max(newPrecision.year - 1, 1);
        }

        if (hovering.monthPercent) {
          newPrecision.month = Math.min(newPrecision.month + 1, 7);
        } else {
          newPrecision.month = Math.max(newPrecision.month - 1, 1);
        }

        if (hovering.weekPercent) {
          newPrecision.week = Math.min(newPrecision.week + 1, 7);
        } else {
          newPrecision.week = Math.max(newPrecision.week - 1, 1);
        }

        if (hovering.dayPercent) {
          newPrecision.day = Math.min(newPrecision.day + 1, 7);
        } else {
          newPrecision.day = Math.max(newPrecision.day - 1, 1);
        }

        return newPrecision;
      });
    }, 50); // 50ms마다 자릿수 변경

    return () => clearInterval(precisionInterval);
  }, [hovering]);

  const handleMouseEnter = (key: string) => {
    setHovering((prev) => ({ ...prev, [key]: true }));
  };

  const handleMouseLeave = (key: string) => {
    setHovering((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="content-wrapper">
      {/* 1년 퍼센트 */}
      <div className="time-block">
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("yearPercent")}
          onMouseLeave={() => handleMouseLeave("yearPercent")}
        >
          2024년의 {percentages.yearPercent.toFixed(precision.year)}%가
          끝났습니다.
        </p>
        <progress
          className="progress-bar"
          value={percentages.yearPercent}
          max={100}
        />
      </div>

      {/* 1달 퍼센트 */}
      <div className="time-block">
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("monthPercent")}
          onMouseLeave={() => handleMouseLeave("monthPercent")}
        >
          이번 달의 {percentages.monthPercent.toFixed(precision.month)}%가
          끝났습니다.
        </p>
        <progress
          className="progress-bar"
          value={percentages.monthPercent}
          max={100}
        />
      </div>

      {/* 1주일 퍼센트 */}
      <div className="time-block">
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("weekPercent")}
          onMouseLeave={() => handleMouseLeave("weekPercent")}
        >
          이번 주의 {percentages.weekPercent.toFixed(precision.week)}%가
          끝났습니다.
        </p>
        <p className="percent-block-caption">(월요일 시작 기준)</p>
        <progress
          className="progress-bar"
          value={percentages.weekPercent}
          max={100}
        />
        <p
          className="percent-block-small"
          onMouseEnter={() => handleMouseEnter("weekendPercent")}
          onMouseLeave={() => handleMouseLeave("weekendPercent")}
        >
          {percentages.isWeekend
            ? `월요일까지 ${percentages.mondayPercentRemaining.toFixed(
                precision.week
              )}% 남았습니다... 남은 주말을 즐기세요!`
            : `다음 주말까지 ${percentages.weekendPercentRemaining.toFixed(
                precision.week
              )}% 남았습니다! 조금만 더 힘내봅시다.`}
        </p>
      </div>

      {/* 1일 퍼센트 */}
      <div className="time-block">
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("dayPercent")}
          onMouseLeave={() => handleMouseLeave("dayPercent")}
        >
          오늘의 {percentages.dayPercent.toFixed(precision.day)}%가 끝났습니다.
        </p>
        <progress
          className="progress-bar"
          value={percentages.dayPercent}
          max={100}
        />
      </div>

      <div className="nametag">
        Dev with <a href="https://www.youtube.com/watch?v=HQgaCVT9Bw8">migu</a>{" "}
        by <a href="https://github.com/ore-o">@ore-o</a>
      </div>
    </div>
  );
};

export default TimePercentage;
