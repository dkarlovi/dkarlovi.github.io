<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

final class Page
{
    public string $title;
    public string $route;
    public string $summary;
    public string $body;
    public string $image;
}
