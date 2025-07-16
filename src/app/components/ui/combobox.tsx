"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/app/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover"
import { FaPlus } from "react-icons/fa"

interface ComboboxProps {
    items: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onCreateNew?: () => void;
}

export function Combobox({ items, value, onChange, placeholder = "Select an option...", onCreateNew }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
                >
                    {value
                        ? items.find((item) => item.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 shadow-lg border border-gray-200 rounded-lg">
                <Command className="rounded-lg">
                    <CommandInput placeholder="Buscar..." className="h-9 text-sm" />
                    <CommandList>
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-3 p-6 text-center">
                                <p className="text-sm text-gray-500">No se encontraron resultados</p>
                                {onCreateNew && (
                                    <Button
                                        className="bg-[#1f2160] hover:bg-[#1f2160]/80 text-white transition-all duration-200"
                                        variant="secondary"
                                        onClick={() => {
                                            onCreateNew();
                                            setOpen(false);
                                        }}
                                    >
                                        Crear nuevo
                                    </Button>
                                )}
                            </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={(currentValue) => {
                                        const selectedItem = items.find(item => item.label === currentValue);
                                        if (selectedItem) {
                                            onChange(selectedItem.value);
                                        }
                                        setOpen(false);
                                    }}
                                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
