<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Sigwin\YASSG\Collection;

final class ArticleSeries
{
    public string $title;
    public string $slug;

    public string $body;
    public string $image;

    /**
     * @var Collection<string, Article>
     */
    public Collection $articles;
}
