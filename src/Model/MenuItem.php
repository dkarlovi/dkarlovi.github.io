<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Sigwin\YASSG\Collection;

final class MenuItem
{
    public ?string $title = null;
    public ?Link $link = null;

    public ?Page $page = null;

    /**
     * @var null|Collection<string, MenuItem>
     */
    public ?Collection $items = null;
}
