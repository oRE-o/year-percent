import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

import "./reset.css";
import "./App.css";

const getFormattedTime = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Seoul",
    hour12: false,
  };

  const formattedTime = now.toLocaleString(navigator.language, options);
  // 날짜 포맷을 "2024년 09월 28일" 형태로 변환
  return formattedTime.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3년 $1월 $2일");
};

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


// 달 위상 이모지 가져오기 (간단히 위상에 따라 보여줌)
const getMoonEmoji = (now: Date): string => {
  const synodicMonth = 29.53058867; // 평균 태음월
  const knownNewMoon = new Date('2025-04-29T00:00:00Z'); // 기준점
  const daysSinceNewMoon =
    (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentPhase = daysSinceNewMoon % synodicMonth;

  if (currentPhase < 1 || currentPhase > synodicMonth - 1) return '🌑';
  else if (currentPhase < 7) return '🌒';
  else if (currentPhase < 13) return '🌓';
  else if (currentPhase < 15) return '🌔';
  else if (currentPhase < 16) return '🌕';
  else if (currentPhase < 21) return '🌖';
  else if (currentPhase < 27) return '🌗';
  else return '🌘';
};

// 다음 보름달까지 퍼센트 계산
const getMoonProgress = () => {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2025-04-29T00:00:00Z');
  const now = new Date();
  const daysSinceNewMoon =
    (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = daysSinceNewMoon % synodicMonth;

  const daysToNextFullMoon = phase < 15
    ? 15 - phase
    : synodicMonth + 15 - phase;

  const percentageToNextFullMoon = (15 - Math.abs(15 - phase)) / 15 * 100;

  return {
    moonEmoji: getMoonEmoji(now),
    daysToNextFullMoon,
    percentageToNextFullMoon,
  };
};

// 올해 남은 보름달 개수 계산
const getRemainingFullMoons = (): number => {
  const synodicMonth = 29.53058867;
  const knownFullMoon = new Date('2000-01-21T04:40:00Z');
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  let count = 0;
  let fullMoon = new Date(knownFullMoon);

  while (fullMoon < endOfYear) {
    if (fullMoon > now) count++;
    fullMoon = new Date(fullMoon.getTime() + synodicMonth * 86400000);
  }

  return count;
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
  const [formattedTime, setFormattedTime] = useState(getFormattedTime());
  const [showConfetti, setShowConfetti] = useState(false);
  // 새 state
  const [moonInfo, setMoonInfo] = useState(getMoonProgress());
  const [remainingFullMoons, setRemainingFullMoons] = useState(getRemainingFullMoons());

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentages(getTimePercentages());
      setFormattedTime(getFormattedTime());
      setMoonInfo(getMoonProgress());
      setRemainingFullMoons(getRemainingFullMoons());
      // 현재 시간이 2025년 1월 1일 0시 ~ 12시인지 확인
      const now = new Date();
      if (
        now.getFullYear() === 2025 &&
        now.getMonth() === 0 && // 0 = January
        now.getDate() === 1 &&
        now.getHours() < 12
      ) {
        setShowConfetti(true);
      } else {
        setShowConfetti(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentages(getTimePercentages());
      setFormattedTime(getFormattedTime());
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
      {showConfetti && <Confetti />}

      {showConfetti && (
        <div className="new-year-message">
          <h1>🎉 Happy New Year! 🎉</h1>
          <p className="new-year-message-sub">한 해동안 수고하셨습니다.</p>
          <p className="new-year-message-sub">
            이 곳에 들어와주신 여러분들, 새해도 행복하길 바랄게요!
          </p>
        </div>
      )}
      <hr></hr>

      <div className="current-time">
        {formattedTime}{" "}
        {/* "2024년 09월 28일 토요일, 14시 43분 nn초 000" 형식으로 표시됨 */}
      </div>
      {/* 1년 퍼센트 */}
      <div className="time-block">
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("yearPercent")}
          onMouseLeave={() => handleMouseLeave("yearPercent")}
        >
          올해의 {percentages.yearPercent.toFixed(precision.year)}%가
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
        <p className="percent-block-caption">(월요일 시작 기준)</p>
        <p
          className="percent-block"
          onMouseEnter={() => handleMouseEnter("weekPercent")}
          onMouseLeave={() => handleMouseLeave("weekPercent")}
        >
          이번 주의 {percentages.weekPercent.toFixed(precision.week)}%가
          끝났습니다.
        </p>
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

      <div className="time-block">
        <p className="percent-block">
          오늘의 달 상태는 {moonInfo.moonEmoji} 입니다.
        </p>
        <p className="percent-block">
          보름달의 {moonInfo.percentageToNextFullMoon.toFixed(2)}%가 보이고 있어요!
        </p>
        <progress
          className="progress-bar"
          value={moonInfo.percentageToNextFullMoon}
          max={100}
        />
        <p className="percent-block-small">
          그거 아세요? 올해가 끝나기 전까지 보름달은 {remainingFullMoons}번 남았답니다!
        </p>
      </div>

      <div className="nametag">
        Dev with <a href="https://www.youtube.com/watch?v=HQgaCVT9Bw8">migu</a>{" "}
        by <a href="https://github.com/ore-o">@ore-o</a>
      </div>
    </div>
  );
};

export default TimePercentage;
