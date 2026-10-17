<?php

namespace App\Enums;

enum SlaPolicyPriority: int
{
    case Low = 1;
    case Medium = 2;
    case High = 3;
    case Critical = 4;

    public function label(): string
    {
        return $this->name;
    }

    public static function options(): array
    {
        return array_map(fn($p) => [
            'value' => $p->value,
            'label' => $p->label(),
        ], self::cases());
    }
}
