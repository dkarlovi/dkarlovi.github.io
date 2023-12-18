<?php

declare(strict_types=1);

/*
 * This file is part of the dkarlovi.github.io project.
 *
 * (c) Dalibor Karlović
 */

namespace App\Model;

use Sigwin\YASSG\Collection;

final class Article
{
    public string $title;
    public string $slug;
    public string $body;
    public string $image;
    public bool $draft = false;

    /**
     * @var Collection<string, ArticleCategory>
     */
    public Collection $categories;

    /**
     * @var Collection<string, ArticleSeries>
     */
    public Collection $series;

    public \DateTimeInterface $publishedAt;
}
