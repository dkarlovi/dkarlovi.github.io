<?php

namespace App\Model;

use Sigwin\YASSG\Collection;

class Menu
{
    public string $title;

    /**
     * @var Collection<string, Link>
     */
    public Collection $items;
}
