<?php

namespace App\Model;

use Sigwin\YASSG\Collection;

class MenuItem
{
    public ?Link $link = null;

    public ?Page $page = null;

    /**
     * @var null|Collection<string, MenuItem>
     */
    public ?Collection $items = null;
}
