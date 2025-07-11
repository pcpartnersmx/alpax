"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select"

export function DatePickerWithRange({
    className,
    onChange,
}: {
    className?: string;
    onChange?: (date: DateRange | undefined) => void;
}) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Comienza la semana en lunes
        to: endOfWeek(new Date(), { weekStartsOn: 1 }), // Termina la semana en domingo
    })

    React.useEffect(() => {
        onChange?.(date);
    }, [date, onChange]);

    const handlePresetSelect = (value: string) => {
        const today = new Date();
        const days = parseInt(value);
        setDate({
            from: today,
            to: addDays(today, days)
        });
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] cursor-pointer hover:bg-[#f2f2ff] justify-start text-left text-[#282b7e] font-semibold py-[1.2rem] border-2 border-[#282b7e]",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                        <Select onValueChange={handlePresetSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rango" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="7">Última semana</SelectItem>
                                <SelectItem value="14">Últimas 2 semanas</SelectItem>
                                <SelectItem value="30">Último mes</SelectItem>
                                <SelectItem value="90">Últimos 3 meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
