"use client";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const getDaysInMonth = (year, month) => {
    const daysInMonth = [];
    const daysInMonthCount = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonthCount; i++) {
        daysInMonth.push(i);
    }

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        daysInMonth.unshift(null);
    }

    return daysInMonth;
};

export default function Calendar({ onChangeDateRange, onFinished, value }) {
    const [date, setDate] = useState(new Date());
    const [weekends, setWeekends] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [hoveredDate, setHoveredDate] = useState(null);
    const [prevMonthDays, setPrevMonthDays] = useState([]);
    const [nextMonthDays, setNextMonthDays] = useState([]);

    const year = date.getFullYear();
    const month = date.getMonth();
    const todayDate = new Date();
    const today = todayDate.getDate();
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const nextMonth = () => {
        setDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setDate(new Date(year, month - 1, 1));
    };

    useEffect(() => {
        const daysInMonth = getDaysInMonth(year, month);
        const weekendDays = daysInMonth.filter(day => {
            if (day !== null) {
                const currentDate = new Date(year, month, day);
                const dayOfWeek = currentDate.getDay();
                return dayOfWeek === 0 || dayOfWeek === 6;
            }
            return false;
        });

        setWeekends(weekendDays);
    }, [year, month]);

    useEffect(() => {
        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0);
        const prevMonthDaysCount = prevMonthLastDay.getDate();
        const prevMonthLastWeekday = prevMonthLastDay.getDay();
        const prevMonthDaysToDisplay = [];

        for (let i = prevMonthDaysCount - prevMonthLastWeekday; i <= prevMonthDaysCount; i++) {
            prevMonthDaysToDisplay.push(i);
        }

        // Días del mes siguiente
        const nextMonthFirstDay = new Date(year, month + 1, 1);
        const nextMonthFirstWeekday = nextMonthFirstDay.getDay();
        const nextMonthDaysToDisplay = [];
        const nextMonthDaysCount = new Date(year, month + 2, 0).getDate();

        for (let i = 1; i <= (7 - nextMonthFirstWeekday) && nextMonthDaysToDisplay.length < 7; i++) {
            nextMonthDaysToDisplay.push(i);
        }

        setPrevMonthDays(prevMonthDaysToDisplay);
        setNextMonthDays(nextMonthDaysToDisplay);
    }, [year, month]);

    useEffect(() => {
        // Verificar si ambos valores de fecha están seleccionados
        if (dateRange[0] && dateRange[1]) {
            if (typeof onFinished === 'function') {
                onFinished(true);
            }
        }
    }, [dateRange, onFinished]);

    useEffect(() => {
        onChangeDateRange(dateRange);
    }, [dateRange, onChangeDateRange]);

    const daysInMonth = getDaysInMonth(year, month);

    //Aqui se eligen las fechas

    const handleDateClick = (day) => {
        const newDate = new Date(year, month, day);
        const [startDate, endDate] = dateRange;

        if (!startDate || (startDate && endDate)) {
            setDateRange([newDate, null]);
        } else {
            setDateRange([startDate, newDate]);
        }
    };

    const handleHover = (day) => {
        if (!dateRange[1]) {
            setHoveredDate(new Date(year, month, day));
        }
    };

    const handleMouseLeave = () => {
        setHoveredDate(null);
    };

    const getDaysInRange = (startDate, endDate) => {
        if (!startDate || !endDate) return [];
        console.log("ejecutnado daysinrange")
        const daysInRange = [];
        console.log("daysInRange:", daysInRange)
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            daysInRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return daysInRange;
    };

    return (
        <div className="max-w-sm mx-auto p-4 border rounded-lg shadow-lg text-xs">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex justify-center items-center"
                >
                    <FaChevronLeft />
                </button>
                <span className="text-lg font-semibold">
                    {new Date(year, month).toLocaleString("es-ES", { month: "short", year: "numeric" })}
                </span>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition flex justify-center items-center"
                >
                    <FaChevronRight />
                </button>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold text-xs mb-2">
                {weekdays.map((day, index) => (
                    <div key={index} className="p-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {prevMonthDays.map((day, index) => (
                    <div key={index} className="p-2 text-gray-400">
                        {day}
                    </div>
                ))}

                {daysInMonth.map((day, index) => {
                    if (day === null) {
                        return null;
                    }

                    const isToday =
                        day === today && todayDate.getFullYear() === year && todayDate.getMonth() === month;

                    const isWeekend = weekends.includes(day);
                    const isStartDate = dateRange[0] && dateRange[0].getDate() === day && dateRange[0].getMonth() === month;
                    const isEndDate = dateRange[1] && dateRange[1].getDate() === day && dateRange[1].getMonth() === month;

                    const isInRange = dateRange[0] && dateRange[1] && new Date(year, month, day) >= dateRange[0] && new Date(year, month, day) <= dateRange[1];
                    
                    const isBetweenDates = hoveredDate && dateRange[0] && new Date(year, month, day) > dateRange[0] && new Date(year, month, day) <= hoveredDate;

                    const daysInRange = getDaysInRange(dateRange[0], dateRange[1]);
                    
                    const isInSelectedRange = daysInRange.some(
                        (d) => d.getDate() === day && d.getMonth() === month
                    );

                    return (
                        <div
                            key={index}
                            className={`p-2 rounded-lg cursor-pointer transition text-center h-10 w-10 flex justify-center items-center flex-col
                                ${isWeekend ? "text-red-500" : ""}
                                ${isStartDate ? "!bg-blue-400 text-white" : ""}
                                ${isEndDate ? "!bg-blue-400 text-white" : ""}
                                ${isInRange ? "bg-blue-100" : ""}
                                ${isBetweenDates ? "bg-gray-200" : ""}
                                ${isInSelectedRange ? "bg-gray-100" : ""}
                            `}
                            onClick={() => handleDateClick(day)}
                            onMouseEnter={() => handleHover(day)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isToday ? (
                                <div className="bg-red-500 rounded-full text-white flex justify-center items-center m-auto h-5 w-5">{day}</div>
                            ) : (
                                <div className="flex justify-center items-center m-auto">
                                    {day}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Mostrar días del próximo mes */}
                {nextMonthDays.map((day, index) => (
                    <div key={index} className="p-2 text-gray-400">
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}
